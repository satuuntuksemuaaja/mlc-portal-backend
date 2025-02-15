import { Context } from '@azure/functions';
import { GetAgentResponse } from '../../interface/response/agent.response.interface';
import { ErrorResponse } from '../../response/error.response';
import { AgentRepository } from '../../repository/agent.repository';
import { AdminController } from '../admin.controller';
import { UpdateAgentRequest } from '../../interface/request/agent.request.interface';
import { UpdateMeAgentValidation } from '../../joiValidation/agent/updateMeAgent.validation';

export class UpdateAgentController extends AdminController {
  context: Context;

  constructor(context: Context) {
    super();
    this.context = context;
  }

  async run(): Promise<GetAgentResponse | ErrorResponse> {
    /**
     * Validate Admin
     */
    const res = await super.isAdminOrUserRole(this.context);
    if (res === true) {
      const validateRequest =
        await UpdateMeAgentValidation.UpdateMeAgentValidation(this.context);
      if (validateRequest === true) {
        try {
          const currentAgent = this.userRole?.usermessage?.currentAgent;
          const agentBody: UpdateAgentRequest = this.context.req.body;
          const updatedAgent = await AgentRepository.updateAgent(
            currentAgent,
            agentBody
          );
          console.log('Update agent success -', updatedAgent?.me?.email);
          return updatedAgent;
        } catch (error) {
          console.log('Controller - create agent catch block', error);
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
