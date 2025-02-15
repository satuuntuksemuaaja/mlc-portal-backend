import { Context } from '@azure/functions';
import { AdminController } from '../admin.controller';
import { AgentByEmailResponse } from '../../interface/response/agent.response.interface';
import { MeecoItemService } from '../../service/meeco.item.service';
import { CreateItemValidation } from '../../joiValidation/item/createItem.validation';
import { ClientRepository } from '../../repository/client.repository';
import { errorResponse } from '../../response/error.response';
import { CreateItemResponse } from '../../interface/response/item.response.interface';
import { MeecoShareService } from '../../service/meeco.share.service';
import { AgentClientRepository } from '../../repository/agentclient.repository';
import { ClientStatus } from '../../model/enums/client.enum';
import { MeecoConnectionService } from '../../service/meeco.connection.service';

export class CreateItemController extends AdminController {
  context: Context;

  constructor(context: Context) {
    super();
    this.context = context;
  }

  async run(): Promise<CreateItemResponse> {
    /**
     * Validate Admin/User
     */
    const res = await super.isValidUser(this.context);
    if (res === true) {
      const validateRequest = await CreateItemValidation.createItemValidation(
        this.context
      );
      if (validateRequest === true) {
        try {
          const Retry = 3;
          const currentAgent: AgentByEmailResponse =
            this.userRole?.usermessage?.currentAgent;
          /**
           * Get Client if not found throw, no need to create item
           */
          const client = await ClientRepository.getClientById(
            this.context?.req?.params?.clientId,
            currentAgent?.orgId
          );
          if (!client) {
            throw errorResponse({ message: 'Client not found' }, 404);
          }
          console.log('Client exist', client?.email);
          const isAgentClientRelated =
            await AgentClientRepository.getAgentAndClient(
              currentAgent?.id,
              client?.id
            );
          console.log('Agent Client relation', isAgentClientRelated);
          if (!isAgentClientRelated) {
            throw errorResponse(
              {
                message: 'client is not associated with agent'
              },
              403
            );
          }
          if (client?.status != ClientStatus?.ACTIVE) {
            throw errorResponse(
              {
                message: 'client is not active'
              },
              422
            );
          }
          const loadClientConnection = await new MeecoConnectionService(
            currentAgent?.organisation?.key
          ).loadAll();
          const connectionExist = loadClientConnection?.connections?.filter(
            ({ the_other_user }) =>
              the_other_user?.id === client?.meecoConnectionId &&
              the_other_user?.user_id === client?.meecoUserId
          );
          if (connectionExist.length !== 1) {
            throw await errorResponse(
              {
                message: 'Invalid Meeco User Connection'
              },
              422
            );
          }
          console.log('Meeco user connection success', connectionExist);
          // Create Item ---
          const itemCreated = await new MeecoItemService(
            currentAgent.organisation.key
          ).createItem(
            this.context?.req?.body?.name,
            this.context?.req?.body?.notes
          );

          console.log('Item Created', itemCreated);

          if (itemCreated) {
            let tryCount = 0;
            /**
             * Share item to client if fails 3 times delete item
             */
            // eslint-disable-next-line no-loops/no-loops
            while (tryCount <= Retry) {
              if (tryCount === Retry) {
                new MeecoItemService(
                  currentAgent?.organisation?.key
                ).deleteItem(itemCreated?.id);
                console.log('Item deleted');
                throw await errorResponse(
                  { message: 'Failed to share item to client' },
                  409
                );
              }
              try {
                // This connects the item to the client user in the meeco world. The user will be notified later.
                const shareSvc = new MeecoShareService(
                  currentAgent?.organisation?.key
                );
                const shareRes = await shareSvc.shareItem(
                  itemCreated?.id,
                  connectionExist[0]?.own?.id
                );
                console.log('Share Item success', shareRes);
                return {
                  itemid: itemCreated?.id,
                  shareid: shareRes?.id
                };
              } catch (error) {
                console.log(
                  'While sharing item to client in create item',
                  error
                );
              }
              tryCount++;
            }
          }
        } catch (error) {
          console.log('Controller - create item catch block', error);
          throw error;
        }
      } else {
        throw validateRequest;
      }
    } else {
      throw res;
    }
  }
}
