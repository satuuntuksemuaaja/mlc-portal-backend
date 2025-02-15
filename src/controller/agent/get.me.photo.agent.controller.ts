import { Context } from '@azure/functions';
import {
  AgentByEmailResponse,
  GetAgentPhoto
} from '../../interface/response/agent.response.interface';
import { AgentRepository } from '../../repository/agent.repository';
import { AdminController } from '../admin.controller';

export class GetMePhotoAgentController extends AdminController {
  context: Context;

  constructor(context: Context) {
    super();
    this.context = context;
  }

  async run(): Promise<GetAgentPhoto> {
    /**
     * Validate Admin
     */
    const res = await super.isAdminOrUserRole(this.context);
    if (res === true) {
      try {
        const currentAgent: AgentByEmailResponse =
          this.userRole?.usermessage?.currentAgent;
        const agent = await AgentRepository.getAgentPhoto(currentAgent);
        console.log('Get agent photo success-', agent?.photo);
        return agent;
      } catch (error) {
        console.log('Controller - create agent catch block', error);
        throw error;
      }
    } else {
      throw res;
    }
  }
}
