import { Context } from '@azure/functions';
import { errorResponse } from '../../response/error.response';
import { AgentClientRepository } from '../../repository/agentclient.repository';
import { AdminController } from '../admin.controller';
import { SendEmail } from '../../util/email';
import { ClientRepository } from '../../repository/client.repository';
import { ClientByEmailResponse } from '../../interface/response/client.response.interface';
import { ActivitiesRepository } from '../../repository/activities.repository';
import { AuditRepository } from '../../repository/audit.repository';
import { CreateActivitiesRequest } from '../../interface/request/activity.request.interface';
import { OrganisationRepository } from '../../repository/organisation.repository';
import { UnreadmessageRepository } from '../../repository/unreadmessage.repository';
import { CreateUnreadMessagesRequest } from '../../interface/request/unreadmessages.request.interfase';
import { AgentByEmailResponse } from '../../interface/response/agent.response.interface';
import { BffItemSharedValidation } from '../../joiValidation/bff/bffItemShared.validation';

const sendEmail = new SendEmail();

export class BffItemSharedController extends AdminController {
  context: Context;

  constructor(context: Context) {
    super();
    this.context = context;
  }

  async run(): Promise<void> {
    const validateRequest =
      await BffItemSharedValidation.bffItemSharedValidation(this.context);
    if (validateRequest === true) {
      try {
        const org_key = this.context?.req?.body?.organisation_key;
        const share_id = this.context?.req?.body?.share_id;
        const email = this.context?.req?.body?.email;
        const type = this.context?.req?.body?.type;
        const ppURL = process.env['KV_PP_URL'] + ( org_key ? "?org=" + org_key : "");

        const currentAgent: AgentByEmailResponse =
          this.userRole?.usermessage?.currentAgent;
        const clientObj: CreateActivitiesRequest[] = [],
          emailToAgent = [],
          createUnreadMessages: CreateUnreadMessagesRequest[] = [];
        console.log('Getting organisation-');
        const organisation = await OrganisationRepository.getPublicOrganisation(
          org_key
        );
        if (!organisation) {
          throw errorResponse(
            {
              message: 'Organisation not found'
            },
            404
          );
        }
        const client: ClientByEmailResponse =
          await ClientRepository.getClientByEmail(email, org_key);
        if (!client) {
          throw errorResponse(
            {
              message: 'Client not found'
            },
            404
          );
        }
        console.log('Get client success-', client?.email);
        console.log('Creating audit');
        await AuditRepository.createAudit({
          agentId: null,
          clientId: client.id,
          action: 'Item Shared',
          details: `Item shared ${share_id} from client ${client?.name} to Org`,
          orgId: currentAgent?.orgId,
          time: new Date()
        });
        const agent = await AgentClientRepository.getAdminClientActiveAgentList(
          client?.id,
          client?.orgId
        );
        console.log('Get agents associated with client successs', agent);
        agent?.map(async (agent) => {
          clientObj.push({
            agentId: agent?.id,
            clientId: client?.id,
            name: client?.name,
            message: `${client?.name} shared an ${type} with you`,
            section: 'client',
            title: `Client Shared`,
            created: new Date()
          });

          if (this.context?.req?.body?.type === 'message') {
            emailToAgent.push(
              {
                From: process.env['POSTMARK_SENDER_EMAIL'],
                To: agent?.email,
                TemplateAlias: 'AGENT_EMAIL_NEW_CLIENT_MESSAGE',
                TemplateModel: {
                  OrganisationName: organisation?.name,
                  AgentName: agent?.name,
                  ClientName: client?.name,
                  ClientUrl: process.env['KV_CLIENT_URL'],
                  PartnerPortalUrl: ppURL
                }
              });
          }else {
            emailToAgent.push(
              {
                From: process.env['POSTMARK_SENDER_EMAIL'],
                To: agent?.email,
                TemplateAlias: 'AGENT_EMAIL_NEW_ITEM',
                TemplateModel: {
                  OrganisationName: organisation?.name,
                  AgentName: agent?.name,
                  ClientName: client?.name,
                  ClientUrl: process.env['KV_CLIENT_URL'],
                  PartnerPortalUrl: ppURL
                }
              });
          }


          if (this.context?.req?.body?.type === 'message') {
            createUnreadMessages.push({
              messageId: share_id,
              orgId: organisation?.id,
              agentId: agent?.id,
              clientId: client?.id
            });
          }
        });
        console.log('Creating activities');
        await ActivitiesRepository.createBulkActivities(clientObj);
        console.log('Sending email in batch');
        await sendEmail.sendBatchEmail(emailToAgent);
        if (createUnreadMessages.length > 0) {
          console.log('Creating unread message for client');
          await UnreadmessageRepository.createUnreadMessages(
            createUnreadMessages
          );
        }
      } catch (error) {
        console.log(
          'Controller - client share item/message catch block',
          error
        );
        throw error;
      }
    } else {
      throw validateRequest;
    }
  }
}
