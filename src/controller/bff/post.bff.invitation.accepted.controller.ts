import { Context } from '@azure/functions';
import { ClientRepository } from '../../repository/client.repository';
import { ClientTermRepository } from '../../repository/clientterm.repository';
import { ActivitiesRepository } from '../../repository/activities.repository';
import { ClientStatus } from '../../model/enums/client.enum';
import { errorResponse } from '../../response/error.response';
import { SendEmail } from '../../util/email';
import { ClientByEmailResponse } from '../../interface/response/client.response.interface';
import { CreateActivitiesRequest } from '../../interface/request/activity.request.interface';
import { BffInvitationAcceptedValidation } from '../../joiValidation/bff/bffInvitationAccepted.validation';
import { AgentClientRepository } from '../../repository/agentclient.repository';

const email = new SendEmail();

export class BffInvitationAccepted {
  context: Context;

  constructor(context: Context) {
    this.context = context;
  }

  async run(): Promise<void> {
    const validateRequest =
      await BffInvitationAcceptedValidation.bffInvitationAcceptedValidation(
        this.context
      );
    if (validateRequest === true) {
      try {
        const client: ClientByEmailResponse =
          await ClientRepository.getClientByEmail(
            this.context?.req?.body?.email,
            this.context?.req?.body?.organisation_key
          );
        if (!client) {
          throw errorResponse(
            {
              message: 'Client not found'
            },
            404
          );
        }
        console.log('client exist', client?.email);
        const agents = await AgentClientRepository.getAdminClientActiveAgentList(
          client?.id,
          client?.orgId
        );
        // TODO: - version 2 what to do here?
        // if (agent.length === 0) {
        //   throw errorResponse(
        //     {
        //       message: 'client is not associated with any agent'
        //     },
        //     404
        //   );
        // }

        if (client.status === ClientStatus.PENDING) {
          // FIXME: just update to active. restore is not the function to perform.
          // plus audit logs etc
          //
          console.log('Updating client status to active');
          await ClientRepository.updateClientToActive(client?.id, {
            orgId: client?.orgId
          });
        }
        console.log('Adding mecco connection and user id for client---');
        await ClientRepository.addMeccoConnectionAndUserId(
          client?.id,
          this.context?.req?.body
        );

        const dateAfterYear = new Date();
        dateAfterYear.setMonth(dateAfterYear.getMonth() + 12);
        console.log('Creating subscription for client');
        await ClientTermRepository.createSubscription([
          {
            clientId: client?.id,
            start: new Date(),
            end: dateAfterYear,
            createdBy: 'client connect',
            durationMonths: 12,
            status: 'active'
          }
        ]);
        const clientObj: CreateActivitiesRequest[] = [];
        if (agents && agents.length > 0) {

          agents.map(async agent => {
            const emailToAgent = {
              From: process.env['POSTMARK_SENDER_EMAIL'],
              To: agent?.email,
              TemplateAlias: 'AGENT_EMAIL_CLIENT_CONNECTED',
              TemplateModel: {
                AgentName: agent?.name,
                ClientName: client?.name,
                OrganisationName: client?.organisation?.name,
                ClientUrl: process.env['KV_CLIENT_URL'],
                PartnerPortalUrl: process.env['KV_PP_URL'] + ( this.context?.req?.body?.organisation_key ? "?org=" + this.context?.req?.body?.organisation_key : "")
              }
            };
            await email.sendEmail(emailToAgent);  
          })
        }
        console.log('Creating activities for client');
        await ActivitiesRepository.createBulkActivities(clientObj);
      } catch (error) {
        console.log('Controller - bff invitation accepted catch block', error);
        throw error;
      }
    } else {
      throw validateRequest;
    }
  }
}
