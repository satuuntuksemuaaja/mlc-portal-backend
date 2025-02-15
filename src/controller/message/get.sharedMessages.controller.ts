import { Context } from '@azure/functions';
import { AdminController } from '../admin.controller';
import { AgentByEmailResponse } from '../../interface/response/agent.response.interface';
import { ClientRepository } from '../../repository/client.repository';
import { errorResponse } from '../../response/error.response';
import { MeecoShareService } from '../../service/meeco.share.service';
import { GetSharedMessagesValidation } from '../../joiValidation/message/sharedMessages.validation';

export class GetSharedMessagesController extends AdminController {
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
      const validateRequest =
        await GetSharedMessagesValidation.getSharedMessagesValidation(
          this.context
        );
      if (validateRequest === true) {
        try {
          const currentAgent: AgentByEmailResponse =
            this.userRole?.usermessage?.currentAgent;
          const shareId: string = this.context?.req?.params?.shareId;
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
          const shared = await new MeecoShareService(
            currentAgent?.organisation?.key
          ).getShare(shareId);
          console.log('Get shared item success', shared);

          return {
            id: shared?.item?.id,
            own: shared?.item?.own,
            original_id: shared?.item?.original_id,
            share_id: shared?.item?.original_id,
            values: shared?.item?.slots
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
