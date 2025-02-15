import { Context } from '@azure/functions';
import { GetAgentsListResponse } from '../../interface/response/agent.response.interface';
import { GetAdminAgentValidation } from '../../joiValidation/agent/adminGetAgents.validation';
import { AgentRepository } from '../../repository/agent.repository';
import { AdminController } from '../admin.controller';

export class AdminAgentListController extends AdminController {
  context: Context;

  constructor(context: Context) {
    super();
    this.context = context;
  }

  async run(): Promise<GetAgentsListResponse[]> {
    /**
     * Validate Admin
     */
    const res = await super.isValid(this.context);
    if (res === true) {
      const validateRequest =
        await GetAdminAgentValidation.getAdminAgentValidation(this.context);
      if (validateRequest === true) {
        try {
          const orgId = this.userRole?.usermessage?.currentAgent?.orgId;
          const archived: string = this.context?.req?.query?.archived;
          console.log('Getting agent list---');
          console.log(orgId, 'orgId---');
          console.log(archived, 'archived---');
          return await AgentRepository.adminGetAgentsList(orgId, archived);
        } catch (error) {
          console.log(
            'Controller - admin get agent list catch block - ',
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
