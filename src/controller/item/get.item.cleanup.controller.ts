import { Context } from '@azure/functions';
import { AdminController } from '../admin.controller';
import { AgentByEmailResponse } from '../../interface/response/agent.response.interface';
import { MeecoItemService } from '../../service/meeco.item.service';
import { ClientRepository } from '../../repository/client.repository';
import { errorResponse } from '../../response/error.response';
import { ItemCleanUpValidation } from '../../joiValidation/item/itemCleanUp.validation';
import MeecoAttachmentService from '../../service/meeco.file.service';

export class ItemCleanUpController extends AdminController {
  context: Context;

  constructor(context: Context) {
    super();
    this.context = context;
  }

  async run(): Promise<void> {
    /**
     * Validate Admin/User
     */
    const res = await super.isValidUser(this.context);
    if (res === true) {
      const validateRequest = await ItemCleanUpValidation.itemCleanUpValidation(
        this.context
      );
      if (validateRequest === true) {
        try {
          const currentAgent: AgentByEmailResponse =
            this.userRole?.usermessage?.currentAgent;
          const itemId = this.context?.req?.params?.itemId;
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
          console.log('Client exist success', client?.email);
          // Loading item ----
          const item = await new MeecoItemService(
            currentAgent?.organisation?.key
          ).getItem(this.context?.req?.params?.itemId);
          if (!item) {
            throw errorResponse({ message: 'Item not available' }, 404);
          }
          console.log('Load item success', item?.id);

          //Check if item created 10 minutes before
          const date10MinutesBefore = new Date();
          date10MinutesBefore.setMinutes(date10MinutesBefore.getMinutes() - 10);
          if (item.item.created_at < date10MinutesBefore) {
            throw errorResponse({ message: 'Can not delete Item' }, 409);
          }
          // Loading if item is shared with client
          const isItemSharedWithClient = await new MeecoItemService(
            currentAgent?.organisation?.key
          ).hasSharedItemWithUser(item?.id, client?.meecoUserId);
          if (!isItemSharedWithClient) {
            throw errorResponse(
              { message: 'Item is not shared with client ' },
              404
            );
          }
          console.log(
            'Item is shared with client success',
            isItemSharedWithClient
          );

          // Deleting item --
          await new MeecoItemService(
            currentAgent?.organisation?.key
          ).deleteItem(itemId);

          //Delting item attachments-----
          // eslint-disable-next-line no-loops/no-loops
          for (let index = 0; index < item?.attachments?.length; index++) {
            await new MeecoAttachmentService(
              currentAgent?.organisation?.key
            ).delete(item?.attachments[index].id);
          }
        } catch (error) {
          console.log('Controller - item clean up catch block', error);
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
