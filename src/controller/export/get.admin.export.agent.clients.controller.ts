import { Context } from '@azure/functions';
import { AdminController } from '../admin.controller';
import { ExportAgentClientsResponse } from '../../interface/response/export.response.interface';
import { ExportRepository } from '../../repository/export.repository';
import { AdminExportAgentClientValidation } from '../../joiValidation/export/adminExportAgentClient.validation';

export class AdminExportAgentClientsController extends AdminController {
  context: Context;

  constructor(context: Context) {
    super();
    this.context = context;
  }

  async run(): Promise<ExportAgentClientsResponse> {
    /**
     * Validate Admin
     */
    const res = await super.isValid(this.context);
    if (res === true) {
      const validateRequest =
        await AdminExportAgentClientValidation.adminExportAgentClientValidation(
          this.context
        );
      if (validateRequest === true) {
        try {
          const orgId = this.userRole?.usermessage?.currentAgent?.orgId;
          const queryData = this.context?.req?.query;
          console.log('Getting agent client export', queryData);
          return await ExportRepository.exportAgentClients(orgId, queryData);
        } catch (error) {
          console.log(
            'Controller - export agent clients catch block - ',
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
