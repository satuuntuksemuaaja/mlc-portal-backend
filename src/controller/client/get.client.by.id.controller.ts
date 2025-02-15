import { Context } from '@azure/functions';
import { ClientRepository } from '../../repository/client.repository';
import { AdminController } from '../admin.controller';
import { ClientByIdResponse } from '../../interface/response/client.response.interface';
import { GetClientByIdValidation } from '../../joiValidation/client/getClientById.validation';

export class GetClientByIdController extends AdminController {
  context: Context;

  constructor(context: Context) {
    super();
    this.context = context;
  }

  async run(): Promise<ClientByIdResponse> {
    /**
     * Validate user/admin
     */
    const res = await super.isValidUser(this.context);
    if (res === true) {
      const validateRequest =
        await GetClientByIdValidation.getClientByIdValidation(this.context);
      if (validateRequest === true) {
        try {
          const orgId: string = this.userRole?.usermessage?.currentAgent?.orgId;
          const clientId: string = this.context?.req?.params?.id;
          console.log(`Getting client ${clientId} of organisation ${orgId}`);
          return await ClientRepository.getClientById(clientId, orgId);
        } catch (error) {
          console.log('Controller - get client by id catch block - ', error);
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
