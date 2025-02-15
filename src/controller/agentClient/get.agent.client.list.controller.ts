import { Context } from '@azure/functions';
import { AgentClientRepository } from '../../repository/agentclient.repository';
import { AdminController } from '../admin.controller';
import { getAgentClientList } from '../../interface/response/agentclient.response.interface';
import { GetAgentClientValidation } from '../../joiValidation/agentClient/getAgentClientList.validation';

export class AgentClientListController extends AdminController {
  context: Context;

  constructor(context: Context) {
    super();
    this.context = context;
  }

  async run(): Promise<getAgentClientList[]> {
    /**
     * Validate Admin
     */
    const res = await super.isValidUser(this.context);
    if (res === true) {
      const validateRequest =
        await GetAgentClientValidation.getAgentClientValidation(this.context);
      if (validateRequest === true) {
        try {
          const orgId: string = this.userRole?.usermessage?.currentAgent?.orgId;
          const agentId: string = this.context.req.params.id;
          console.log('Getting agent client');
          return await AgentClientRepository.getAgentClientList(agentId, orgId);
        } catch (error) {
          console.log(
            'Controller - client list for an agent catch block - ',
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
