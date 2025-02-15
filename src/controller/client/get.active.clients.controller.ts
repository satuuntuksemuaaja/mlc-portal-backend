import { Context } from '@azure/functions';
import { GetClientResponse } from '../../interface/response/client.response.interface';
import { ClientRepository } from '../../repository/client.repository';
import { AdminController } from '../admin.controller';
import { getAgentClientList } from '../../interface/response/agentclient.response.interface';
import { AgentClientRepository } from '../../repository/agentclient.repository';

export class GetActiveClientsListController extends AdminController {
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
          await AgentClientRepository.getAgentClientList(
            agentId.toString(),
            orgId
          );

        console.log(JSON.stringify(client), '---------------------');
        const clientId = client.map(({ id }) => id);

        return await ClientRepository.getActiveClients(orgId, clientId);
      } catch (error) {
        console.log('Controller - get active clients catch block - ', error);
        throw error;
      }
    } else {
      throw res;
    }
  }
}
