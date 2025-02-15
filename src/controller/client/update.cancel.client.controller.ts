import { Context } from '@azure/functions';
import { UserClientResponse } from '../../interface/response/client.response.interface';
import { errorResponse, ErrorResponse } from '../../response/error.response';
import { ClientRepository } from '../../repository/client.repository';
import { AdminController } from '../admin.controller';
import { MeecoInvitationService } from '../../service/meeco.invitation.service';
import { BffInvitationService } from '../../service/invitation/invitation.bff.service';
import { AgentClientRepository } from '../../repository/agentclient.repository';
import { ActivitiesRepository } from '../../repository/activities.repository';
import { AuditRepository } from '../../repository/audit.repository';
import { validateEmailDomain } from '../../validation/emaildomian.validation';
import { AgentByEmailResponse } from '../../interface/response/agent.response.interface';
import { UpdateClientToCancelValidation } from '../../joiValidation/client/updateClientToCancel.validation';
import { ClientStatus } from '../../model/enums/client.enum';

export class CancelClientController extends AdminController {
  context: Context;

  constructor(context: Context) {
    super();
    this.context = context;
  }

  async run(): Promise<UserClientResponse | ErrorResponse> {
    /**
     * Validate email domain
     */
    const res = await super.isValidUser(this.context);
    if (res === true) {
      const validateRequest =
        await UpdateClientToCancelValidation.updateClientToCancelValidation(
          this.context
        );
      if (validateRequest === true) {
        try {
          //Check agent client relation
          const currentAgent: AgentByEmailResponse =
            this.userRole?.usermessage?.currentAgent;
          const clientId = this.context.req.params.id;
          const agentClientRelated =
            await AgentClientRepository.getAgentAndClient(
              currentAgent.id.toString(),
              clientId
            );
          console.log('Agent client relation status', agentClientRelated);
          if (!agentClientRelated) {
            throw errorResponse(
              { message: 'Agent is not associated with client' },
              403
            );
          }

          const client = await ClientRepository.getClientById(
            clientId,
            currentAgent?.orgId
          );
          console.log('Get client success', client?.email);
          if (client.status === ClientStatus.CANCELLED) {
            throw errorResponse(
              { message: 'Client is already cancelled' },
              422
            );
          }
          //Meeco invite deleted
          await new MeecoInvitationService(
            currentAgent?.organisation?.key
          ).delete(client?.invitationId);
          console.log('Mecco invite deleted');
          const clientData = await ClientRepository.cancelClient(
            currentAgent,
            clientId
          );
          console.log('Update client to cancel success', clientData?.email);
          if (clientData) {
            //Bff invite deleted
            await new BffInvitationService().delete({
              invitationId: client.invitationId
            });
            console.log('Bff invitation deleted');
            await AuditRepository.createAudit({
              orgId: currentAgent?.orgId,
              agentId: currentAgent?.id,
              clientId: clientData?.id,
              action: `${clientData?.email} Cancelled`,
              details: `Name: ${clientData?.name}, Email: ${clientData?.email}`,
              time: new Date()
            });
            await ActivitiesRepository.addActivities({
              agentId: currentAgent?.id.toString(),
              clientId: clientData?.id,
              name: clientData?.name,
              message: `Client ${clientData?.email} Cancelled`,
              section: 'client',
              title: 'Client Cancelled',
              created: new Date()
            });
            return clientData;
          }
        } catch (error) {
          console.log('Controller - cancel client catch block - ', error);
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
