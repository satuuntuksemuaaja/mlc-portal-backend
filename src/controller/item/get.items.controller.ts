import { Context } from '@azure/functions';
import { AdminController } from '../admin.controller';
import { AgentByEmailResponse } from '../../interface/response/agent.response.interface';
import { MeecoItemService } from '../../service/meeco.item.service';
import { ClientRepository } from '../../repository/client.repository';
import { errorResponse } from '../../response/error.response';
import { AgentClientRepository } from '../../repository/agentclient.repository';
import { MeecoConnectionService } from '../../service/meeco.connection.service';
import { ItemsResponse } from '@meeco/vault-api-sdk';
import { MeecoItem } from '../../meeco/item/item.model';
import { ShareService, ShareType } from '@meeco/sdk';

export class GetItemsController extends AdminController {
  context: Context;

  constructor(context: Context) {
    super();
    this.context = context;
  }

  async run(): Promise<MeecoItem[]> {
    /**
     * Validate Admin/User
     */
    const res = await super.isValidUser(this.context);

    if (res === true) {
      try {
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
        console.log('Client Loaded');

        const isAgentClientRelated =
          await AgentClientRepository.getAgentAndClient(
            currentAgent?.id,
            client.id
          );
        if (!isAgentClientRelated) {
          throw errorResponse(
            {
              message: 'client is not associated with agent'
            },
            403
          );
        }
        console.log('Client / Agent Validated');

        const loadClientConnection = await new MeecoConnectionService(
          currentAgent.organisation.key
        ).loadAll();
        const connectionExist = loadClientConnection.connections.filter(
          ({ the_other_user }) =>
            the_other_user.id === client.meecoConnectionId &&
            the_other_user.user_id === client.meecoUserId
        );
        if (connectionExist.length === 0) {
          throw errorResponse(
            {
              message: 'Invalid Meeco User Connection'
            },
            422
          );
        }
        console.log('Meeco Connection Validated');

        const sent = 'sent' === this.context?.req?.params?.direction;
        console.log('Loading items from meeco');

        let meecoItems: MeecoItem[] = null;

        if (sent) {
          meecoItems = await new MeecoItemService(
            currentAgent.organisation.key
          ).getItemsSharedWithConnection(client.meecoUserId);
          console.log('Loaded items from meeco (' + meecoItems.length + ')');
          // return items;
        } else {
          const mis = new MeecoItemService(currentAgent.organisation.key);

          meecoItems = await mis.getItemsSharedFromConnection(
            client.meecoUserId
          );
          console.log('Loaded items from meeco (' + meecoItems.length + ')');
          // return items;
        }

        // convert for the UI
        if (meecoItems) {
          return meecoItems;
        }

        return [];
      } catch (error) {
        console.log('Controller - get items catch block', error);
        throw error;
      }
    } else {
      throw res;
    }
  }
}
