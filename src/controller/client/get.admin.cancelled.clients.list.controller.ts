import { Context } from '@azure/functions';
import { ClientResponse } from '../../interface/response/client.response.interface';
import { ClientRepository } from '../../repository/client.repository';
import { AdminController } from '../admin.controller';

export class AdminCancelledClientsListController extends AdminController {
  context: Context;

  constructor(context: Context) {
    super();
    this.context = context;
  }

  async run(): Promise<ClientResponse> {
    /**
     * Validate user/admin
     */
    const res = await super.isValid(this.context);
    if (res === true) {
      try {
        const orgId: string = this.userRole?.usermessage?.currentAgent?.orgId;
        console.log('Getting cancel clients of organisation', orgId);
        return await ClientRepository.getAdminCancelledClientsList(orgId);
      } catch (error) {
        console.log(
          'Controller - get admin cancelled clients list catch block - ',
          error
        );
        throw error;
      }
    } else {
      throw res;
    }
  }
}
