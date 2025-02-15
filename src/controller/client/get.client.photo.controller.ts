import { Context } from '@azure/functions';
import { ClientPhotoResponse } from '../../interface/response/client.response.interface';
import { ClientRepository } from '../../repository/client.repository';
import { AdminController } from '../admin.controller';

export class GetClientPhotoController extends AdminController {
  context: Context;

  constructor(context: Context) {
    super();
    this.context = context;
  }

  async run(): Promise<ClientPhotoResponse> {
    /**
     * Validate user/admin
     */
    const res = await super.isValidUser(this.context);
    if (res === true) {
      try {
        console.log(`Getting client photo`);
        return await ClientRepository.getClientPhoto();
      } catch (error) {
        console.log('Controller - get client photo catch block - ', error);
        throw error;
      }
    } else {
      throw res;
    }
  }
}
