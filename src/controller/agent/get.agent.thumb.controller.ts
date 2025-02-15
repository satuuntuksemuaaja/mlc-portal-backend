import { Context } from '@azure/functions';
import {
  AgentByEmailResponse,
  AgentThumbResponse
} from '../../interface/response/agent.response.interface';
import { GetAgentThumbValidation } from '../../joiValidation/agent/getAgentThumb.validation';
import { AgentRepository } from '../../repository/agent.repository';
import { AdminController } from '../admin.controller';

export class GetAgentThumbController extends AdminController {
  context: Context;

  constructor(context: Context) {
    super();
    this.context = context;
  }

  async run(): Promise<AgentThumbResponse> {
    /**
     * Validate Admin
     */
    const res = await super.isValidUser(this.context);
    if (res === true) {
      const validateRequest =
        await GetAgentThumbValidation.getAgentThumbValidation(this.context);
      if (validateRequest === true) {
        try {
          const currentAgent: AgentByEmailResponse =
            this.userRole?.usermessage?.currentAgent;
          const agentId: string = this.context.req?.params?.id;
          console.log('Getting thumb for agent-', agentId);
          return await AgentRepository.getAgentThumb(currentAgent, agentId);
        } catch (error) {
          console.log('Controller - get agent thumb catch block - ', error);
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
