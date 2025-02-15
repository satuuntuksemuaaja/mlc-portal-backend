import { Context } from '@azure/functions';
import { AgentClientRepository } from '../../repository/agentclient.repository';
import { AdminController } from '../admin.controller';
import { getAdminAgentActiveClientList } from '../../interface/response/agentclient.response.interface';
import { GetAdminAgentActiveClientValidation } from '../../joiValidation/agentClient/getAdminAgentActiveClient.validation';

export class AdminAgentActiveClientController extends AdminController {
  context: Context;

  constructor(context: Context) {
    super();
    this.context = context;
  }

  async run(): Promise<getAdminAgentActiveClientList[]> {
    /**
     * Validate Admin
     */
    const res = await super.isValid(this.context);
    if (res === true) {
      const validateRequest =
        await GetAdminAgentActiveClientValidation.getAdminAgentActiveClientValidation(
          this.context
        );
      if (validateRequest === true) {
        try {
          const orgId: string = this.userRole?.usermessage?.currentAgent?.orgId;
          const agentId: string = this.context?.req?.params?.id;
          const archived: string = this.context?.req?.query?.archived;
          console.log('Getting agents active client');
          return await AgentClientRepository.getAdminAgentActiveClientList(
            agentId,
            orgId,
            archived
          );
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
