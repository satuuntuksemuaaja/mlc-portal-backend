import { Context } from '@azure/functions';
import {
  AgentByEmailResponse,
  AgentResponse
} from '../../interface/response/agent.response.interface';
import { ErrorResponse } from '../../response/error.response';
import { AgentRepository } from '../../repository/agent.repository';
import { AdminController } from '../admin.controller';
import { AdminUpdateAgentValidation } from '../../joiValidation/agent/adminUpdateAgent.validation';

export class AdminUpdateAgentController extends AdminController {
  context: Context;

  constructor(context: Context) {
    super();
    this.context = context;
  }

  async run(): Promise<AgentResponse | ErrorResponse> {
    /**
     * Validate Admin
     */
    const res = await super.isValid(this.context);
    if (res === true) {
      const validateRequest =
        await AdminUpdateAgentValidation.adminUpdateAgentValidation(
          this.context
        );
      if (validateRequest === true) {
        try {
          const currentAgent: AgentByEmailResponse =
            this.userRole?.usermessage?.currentAgent;
          console.log('Updating agent with', this.context?.req?.body?.id);
          return AgentRepository.adminUpdateAgent(
            currentAgent,
            this.context?.req?.body
          );
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
