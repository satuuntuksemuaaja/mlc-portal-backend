import { Context } from '@azure/functions';
import { GetClientResponse } from '../../interface/response/client.response.interface';
import { ClientRepository } from '../../repository/client.repository';
import { AdminController } from '../admin.controller';
import { getAgentClientList } from '../../interface/response/agentclient.response.interface';
import { AgentClientRepository } from '../../repository/agentclient.repository';

export class GetClientsController extends AdminController {
  context: Context;

  constructor(context: Context) {
    super();
    this.context = context;
  }

  async run(): Promise<GetClientResponse> {
    /**
     * Validate user/admin
     */
    const res = await super.isValidUser(this.context);
    if (res === true) {
      try {
        const orgId: string = this.userRole?.usermessage?.currentAgent?.orgId;
        const agentId: string = this.userRole?.usermessage?.currentAgent?.id;
        const client: getAgentClientList[] =
          await AgentClientRepository.getAgentClientList(agentId, orgId);
        const clientId = client.map(({ id }) => id);
        console.log('Getting all clients of organisation', orgId);

        return await ClientRepository.getClients(orgId, clientId);
      } catch (error) {
        console.log('Controller - get clients catch block - ', error);
        throw error;
      }
    } else {
      throw res;
    }
  }
}
