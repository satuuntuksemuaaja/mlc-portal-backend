import { Context } from '@azure/functions';
import { AdminController } from '../admin.controller';
import { ExportClientRespons } from '../../interface/response/export.response.interface';
import { ExportRepository } from '../../repository/export.repository';
import { AdminExportClientValidation } from '../../joiValidation/export/adminExportClient.validation';

export class AdminExportClientsController extends AdminController {
  context: Context;

  constructor(context: Context) {
    super();
    this.context = context;
  }

  async run(): Promise<ExportClientRespons> {
    /**
     * Validate Admin
     */
    const res = await super.isValid(this.context);
    if (res === true) {
      const validateRequest =
        await AdminExportClientValidation.adminExportClientValidation(
          this.context
        );
      if (validateRequest === true) {
        try {
          const orgId = this.userRole?.usermessage?.currentAgent?.orgId;
          const queryData = this.context.req?.query;
          console.log('Getting client export', queryData);
          return await ExportRepository.exportClient(orgId, queryData);
        } catch (error) {
          console.log('Controller - export client catch block - ', error);
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
