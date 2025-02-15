import { Context } from '@azure/functions';
import { AdminController } from '../admin.controller';
import { ExportAgentResponse } from '../../interface/response/export.response.interface';
import { ExportRepository } from '../../repository/export.repository';
import { AdminExportAgentValidation } from '../../joiValidation/export/adminExportAgent.validation';

export class AdminExportAgentsController extends AdminController {
  context: Context;

  constructor(context: Context) {
    super();
    this.context = context;
  }

  async run(): Promise<ExportAgentResponse> {
    /**
     * Validate Admin
     */
    const res = await super.isValid(this.context);
    if (res === true) {
      const validateRequest =
        await AdminExportAgentValidation.adminExportAgentValidation(
          this.context
        );
      if (validateRequest === true) {
        try {
          const orgId = this.userRole?.usermessage?.currentAgent?.orgId;
          const queryData = this.context.req?.query;
          console.log('Getting agent export', queryData);
          return await ExportRepository.exportAgent(orgId, queryData);
        } catch (error) {
          console.log('Controller - export agent catch block - ', error);
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
