import { Context } from '@azure/functions';
import { SystemRepository } from '../../repository/system.repository';
import { AdminController } from '../admin.controller';

export class GetSystemUpController extends AdminController {
  context: Context;

  constructor(context: Context) {
    super();
    this.context = context;
  }

  async run(): Promise<string> {
    try {
      console.log('Getting system up status');
      return SystemRepository.getUp();
    } catch (error) {
      console.log('Controller - get system up catch block - ', error);
      throw error;
    }
  }
}
