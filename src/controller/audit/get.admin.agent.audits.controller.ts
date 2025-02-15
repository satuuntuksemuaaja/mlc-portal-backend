import { Context } from '@azure/functions';
import { AdminController } from '../admin.controller';
import { ClientAuditsResponse } from '../../interface/response/audit.response.interface';
import { AuditRepository } from '../../repository/audit.repository';
import { GetAdminAgentAuditValidation } from '../../joiValidation/audit/getAdminAgentAudits.validation';

export class AdminAgentAuditsController extends AdminController {
  context: Context;

  constructor(context: Context) {
    super();
    this.context = context;
  }

  async run(): Promise<ClientAuditsResponse[]> {
    /**
     * Validate Admin
     */
    const res = await super.isValid(this.context);
    if (res === true) {
      const validateRequest =
        await GetAdminAgentAuditValidation.getAdminAgentAuditValidation(
          this.context
        );
      if (validateRequest === true) {
        try {
          const orgId: string = this.userRole?.usermessage?.currentAgent?.orgId;
          const agentId: string = this.context.req.params.id;
          const page: string = this.context.req.query.page;
          console.log('Getting agents audits');
          return await AuditRepository.getAgentsAudits(agentId, page, orgId);
        } catch (error) {
          console.log(
            'Controller - get admin agent active clients list  catch block - ',
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
