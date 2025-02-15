import { Context } from '@azure/functions';
import { AgentClientRepository } from '../../repository/agentclient.repository';
import { AdminController } from '../admin.controller';
import { getAdminClientActiveAgentList } from '../../interface/response/agentclient.response.interface';
import { GetAdminClientActiveAgentValidation } from '../../joiValidation/agentClient/adminGetClientActiveAgent.validation';

export class AdminClientActiveAgentController extends AdminController {
  context: Context;

  constructor(context: Context) {
    super();
    this.context = context;
  }

  async run(): Promise<getAdminClientActiveAgentList[]> {
    /**
     * Validate Admin
     */
    const res = await super.isValid(this.context);
    if (res === true) {
      const validateRequest =
        await GetAdminClientActiveAgentValidation.getAdminClientActiveAgentValidation(
          this.context
        );
      if (validateRequest === true) {
        try {
          const orgId: string = this.userRole?.usermessage?.currentAgent?.orgId;
          const clientId: string = this.context.req.params.id;
          console.log('Getting client active agents');
          return await AgentClientRepository.getAdminClientActiveAgentList(
            clientId,
            orgId
          );
        } catch (error) {
          console.log(
            'Controller - get admin client active agent list catch block - ',
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
