import { Context } from '@azure/functions';
import { UserClientResponse } from '../../interface/response/client.response.interface';
import { ErrorResponse } from '../../response/error.response';
import { ClientRepository } from '../../repository/client.repository';
import { AdminController } from '../admin.controller';
import { AgentByEmailResponse } from '../../interface/response/agent.response.interface';
import { UpdateClientValidation } from '../../joiValidation/client/updateClient.validation';

export class UpdateClientController extends AdminController {
  context: Context;

  constructor(context: Context) {
    super();
    this.context = context;
  }

  async run(): Promise<UserClientResponse | ErrorResponse> {
    /**
     * Validate Admin/User
     */
    const res = await super.isValidUser(this.context);
    if (res === true) {
      const validateRequest =
        await UpdateClientValidation.clientUpdateValidation(this.context);
      if (validateRequest === true) {
        try {
          const currentAgent: AgentByEmailResponse =
            this.userRole?.usermessage?.currentAgent;
          console.log('Updating client with-', this.context?.req?.body?.id);
          return await ClientRepository.updateClient(
            currentAgent,
            this.context?.req?.body
          );
        } catch (error) {
          console.log('Controller - create client catch block', error);
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
