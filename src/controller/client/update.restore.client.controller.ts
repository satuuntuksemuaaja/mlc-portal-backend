import { Context } from '@azure/functions';
import { ClientResponse } from '../../interface/response/client.response.interface';
import { UpdateClientToRestoreValidation } from '../../joiValidation/client/updateClientToRestore.validation';
import { ClientRepository } from '../../repository/client.repository';
import { AdminController } from '../admin.controller';

export class UpdateRestorClientController extends AdminController {
  context: Context;

  constructor(context: Context) {
    super();
    this.context = context;
  }

  async run(): Promise<ClientResponse> {
    /**
     * Validate user/admin
     */
    const res = await super.isValidUser(this.context);
    if (res === true) {
      const validateRequest =
        await UpdateClientToRestoreValidation.updateClientToRestoreValidation(
          this.context
        );
      if (validateRequest === true) {
        try {
          const currentAgent = this.userRole?.usermessage?.currentAgent;
          console.log('Restoring client');
          return await ClientRepository.restoreClient(
            this.context?.req?.params?.id,
            currentAgent
          );
        } catch (error) {
          console.log('Controller - restore client catch block', error);
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
