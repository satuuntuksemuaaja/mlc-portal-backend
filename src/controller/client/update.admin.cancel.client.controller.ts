import { Context } from '@azure/functions';
import { ClientResponse } from '../../interface/response/client.response.interface';
import { AdminUpdateClientToCancelValidation } from '../../joiValidation/client/adminUpdateClientToCancel.validation';
import { ClientRepository } from '../../repository/client.repository';
import { AdminController } from '../admin.controller';

export class AdminUpdateClientToCancelController extends AdminController {
  context: Context;

  constructor(context: Context) {
    super();
    this.context = context;
  }

  async run(): Promise<ClientResponse> {
    /**
     * Validate email domain
     */
    const res = await super.isValid(this.context);
    if (res === true) {
      const validateRequest =
        await AdminUpdateClientToCancelValidation.adminUpdateClientToCancelValidation(
          this.context
        );
      if (validateRequest === true) {
        try {
          const currentAgent = this.userRole?.usermessage?.currentAgent;
          const clientId: string = this.context.req.params.id;
          console.log('Updating client to cancel', clientId);
          return await ClientRepository.adminPutClientToCancel(
            currentAgent,
            clientId
          );
        } catch (error) {
          console.log(
            'Controller - admin put client to cancel catch block - ',
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
