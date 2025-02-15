import { Context } from '@azure/functions';
import { AdminController } from '../admin.controller';
import { AgentByEmailResponse } from '../../interface/response/agent.response.interface';
import { MeecoItemService } from '../../service/meeco.item.service';
import { ClientRepository } from '../../repository/client.repository';
import { errorResponse } from '../../response/error.response';
import { MeecoItemConversion } from '../../meeco/item/item.conversion';
import { GetMessagesValidation } from '../../joiValidation/message/messagesList.validation';
import { MeecoServices } from '../../service/meeco.service';
import { MeecoConnectionService } from '../../service/meeco.connection.service';
import { ItemsResponse } from '@meeco/vault-api-sdk';

export class GetMessagesController extends AdminController {
  context: Context;

  constructor(context: Context) {
    super();
    this.context = context;
  }

  async run(): Promise<object> {
    /**
     * Validate Admin/User
     */
    const res = await super.isValidUser(this.context);
    if (res === true) {
      const validateRequest = await GetMessagesValidation.getMessagesValidation(
        this.context
      );
      if (validateRequest === true) {
        try {
          const currentAgent: AgentByEmailResponse =
            this.userRole?.usermessage?.currentAgent;
          /**
           * Get Client if not found throw error
           */
          const client = await ClientRepository.getClientById(
            this.context?.req?.params?.clientId,
            currentAgent?.orgId
          );
          if (!client) {
            throw errorResponse({ message: 'Client not found' }, 404);
          }
          console.log('Client exist', client?.email);
          // load connection
          const connection = await new MeecoConnectionService(
            currentAgent.organisation.key
          ).getForUser(client.meecoUserId);
          if (!connection) {
            throw errorResponse(
              { message: 'Client Connection not found' },
              404
            );
          }
          console.log('Load connection success', connection);
          const nextPageAfter = this.context?.req?.query?.nextPageAfter;
          let messages: ItemsResponse;
          console.log('Loading messages');
          try {
            if (nextPageAfter) {
              console.log('Loading messages nextPageAfter', nextPageAfter);
              messages = await new MeecoItemService(
                currentAgent?.organisation?.key
              ).getMessages(connection, nextPageAfter);

            } else {
              console.log('Loading messages no page');

              messages = await new MeecoItemService(
                currentAgent?.organisation?.key
              ).getMessages(connection);
            }
            console.log('Get message success', messages, messages?.next_page_after);
          }catch(ee) {
            console.log('Get message failed', ee);
          }

            // Conversion----------
          const dek = new MeecoServices(
            currentAgent?.organisation?.key
          ).getAuthObject().data_encryption_key;

          const conv = new MeecoItemConversion();
          const items = await conv.convertItems(messages, dek);

          console.log('Convert item success', items);
          return {
            next_page_after: messages?.next_page_after,
            items
          };
        } catch (error) {
          console.log('Controller - message send catch block', error);
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
