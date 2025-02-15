import { Context } from '@azure/functions';
import {
  AgentByEmailResponse,
  AgentResponse
} from '../../interface/response/agent.response.interface';
import { AdminUpdateAgentToRestoreValidation } from '../../joiValidation/agent/adminUpdateAgentToRestore.validation';
import { AgentRepository } from '../../repository/agent.repository';
import { AdminController } from '../admin.controller';

export class UpdateAdminRestoreAgentController extends AdminController {
  context: Context;

  constructor(context: Context) {
    super();
    this.context = context;
  }

  async run(): Promise<AgentResponse> {
    /**
     * Validate Admin
     */
    const res = await super.isValid(this.context);
    if (res === true) {
      const validateRequest =
        await AdminUpdateAgentToRestoreValidation.adminUpdateAgentToRestoreValidation(
          this.context
        );
      if (validateRequest === true) {
        try {
          const currentAgent: AgentByEmailResponse =
            this.userRole?.usermessage?.currentAgent;
          const agentId: string = this.context.req.body.id;
          console.log('Restoring agent-', agentId);
          return await AgentRepository.adminRestoreAgent(currentAgent, agentId);
        } catch (error) {
          console.log(
            'Controller - admin update agent to active catch block - ',
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
