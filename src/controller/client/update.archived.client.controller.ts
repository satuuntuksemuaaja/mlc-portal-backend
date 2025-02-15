import { Context } from '@azure/functions';
import { UserClientResponse } from '../../interface/response/client.response.interface';
import { UpdateClientToArchiveValidation } from '../../joiValidation/client/updateClientToArchive.validation';
import { ClientRepository } from '../../repository/client.repository';
import { AdminController } from '../admin.controller';

export class UpdateClientToArchivedController extends AdminController {
  context: Context;

  constructor(context: Context) {
    super();
    this.context = context;
  }

  async run(): Promise<UserClientResponse> {
    /**
     * Validate user/admin
     */
    const res = await super.isValidUser(this.context);
    if (res === true) {
      const validateRequest =
        await UpdateClientToArchiveValidation.updateClientToArchiveValidation(
          this.context
        );
      if (validateRequest === true) {
        try {
          const currentAgent = this.userRole?.usermessage?.currentAgent;
          const clientId: string = this.context.req.params.id;
          console.log('Updating client to archive', clientId);
          return await ClientRepository.archiveClient(currentAgent, clientId);
        } catch (error) {
          console.log('Controller - archive client catch block - ', error);
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
