import { Context } from '@azure/functions';
import { AdminController } from '../admin.controller';
import { ExportAuditResponse } from '../../interface/response/export.response.interface';
import { ExportRepository } from '../../repository/export.repository';
import { AdminExportAuditValidation } from '../../joiValidation/export/adminExportAudit.validation';

export class AdminExportAuditController extends AdminController {
  context: Context;

  constructor(context: Context) {
    super();
    this.context = context;
  }

  async run(): Promise<ExportAuditResponse> {
    /**
     * Validate Admin
     */
    const res = await super.isValid(this.context);
    if (res === true) {
      const validateRequest =
        await AdminExportAuditValidation.adminExportAuditValidation(
          this.context
        );
      if (validateRequest === true) {
        try {
          const orgId = this.userRole?.usermessage?.currentAgent?.orgId;
          const queryData = this.context.req?.query;
          console.log('Getting audit export', queryData);
          return await ExportRepository.exportAudit(orgId, queryData);
        } catch (error) {
          console.log('Controller - export audit catch block - ', error);
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
