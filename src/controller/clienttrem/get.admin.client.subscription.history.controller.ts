import { Context } from '@azure/functions';
import { AdminController } from '../admin.controller';
import { ClientTermRepository } from '../../repository/clientterm.repository';
import { AdminClientSubscriptionHistoryResponse } from '../../interface/response/clientterm.response.interface';
import { AdminGetClientSubscriptionHistoryValidation } from '../../joiValidation/clientterm/adminGetClientSubscriptionHistory.validation';

export class AdminClientSubscriptionHistoryController extends AdminController {
  context: Context;

  constructor(context: Context) {
    super();
    this.context = context;
  }

  async run(): Promise<AdminClientSubscriptionHistoryResponse> {
    /**
     * Validate Admin
     */
    const res = await super.isValid(this.context);
    if (res === true) {
      const validateRequest =
        await AdminGetClientSubscriptionHistoryValidation.adminGetClientSubscriptionHistoryValidation(
          this.context
        );
      if (validateRequest === true) {
        try {
          const clientId: string = this.context.req?.params?.id;
          console.log('Getting subscription history for client-', clientId);
          return await ClientTermRepository.adminClientsubscriptionHistory(
            clientId
          );
        } catch (error) {
          console.log(
            'Controller - admin client subscription history catch block - ',
            error
          );
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
