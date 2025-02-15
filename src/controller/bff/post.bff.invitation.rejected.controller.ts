import { Context } from '@azure/functions';
import { ClientRepository } from '../../repository/client.repository';
import { AgentClientRepository } from '../../repository/agentclient.repository';
import { ActivitiesRepository } from '../../repository/activities.repository';
import { ClientStatus } from '../../model/enums/client.enum';
import { errorResponse } from '../../response/error.response';
import { ClientByEmailResponse } from '../../interface/response/client.response.interface';
import { CreateActivitiesRequest } from '../../interface/request/activity.request.interface';
import { BffInvitationRejectedValidation } from '../../joiValidation/bff/bffInvitationRejected.validation';

export class BffInvitationRejected {
  context: Context;

  constructor(context: Context) {
    this.context = context;
  }

  async run(): Promise<void> {
    const validateRequest =
      await BffInvitationRejectedValidation.bffInvitationRejectedValidation(
        this.context
      );
    if (validateRequest === true) {
      try {
        const client: ClientByEmailResponse =
          await ClientRepository.getClientByInvitation(
            this.context?.req?.params?.org,
            this.context?.req?.params?.invitationId
          );
        if (!client) {
          throw errorResponse(
            {
              message: 'Client not found'
            },
            404
          );
        }
        console.log('Get client success', client?.email);
        console.log('Getting all linked agents');
        // get linked agents
        const agent = await AgentClientRepository.getAdminClientActiveAgentList(
          client?.id,
          client?.orgId
        );

        // cancel the client
        if (client.status != ClientStatus.CANCELLED) {
          console.log('Updating client status to cancel');
          await ClientRepository.cancelClient(
            { orgId: client?.orgId },
            client?.id
          );
        }

        // create activities for linked agents
        const clientObj: CreateActivitiesRequest[] = [];
        if (agent.length > 0) {
          agent.map(async (agent) => {
            clientObj.push({
              agentId: agent?.id,
              clientId: client?.id,
              name: client?.name,
              message: `Client ${client?.email} rejected connection. Status updated to cancelled.`,
              section: 'client',
              title: 'Client Rejected',
              created: new Date()
            });
          });
          console.log('Creating activities for client');
          await ActivitiesRepository.createBulkActivities(clientObj);
        }
      } catch (error) {
        console.log('Controller - bff invitation rejected catch block', error);
        throw error;
      }
    } else {
      throw validateRequest;
    }
  }
}
