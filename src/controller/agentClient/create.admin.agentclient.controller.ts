import { Context } from '@azure/functions';
import { AgentClientResponse } from '../../interface/response/agentclient.response.interface';
import { errorResponse, ErrorResponse } from '../../response/error.response';
import { AgentClientRepository } from '../../repository/agentclient.repository';
import { AdminController } from '../admin.controller';
import { SendEmail } from '../../util/email';
import { CreateAgentClientValidation } from '../../joiValidation/agentClient/createAgentClient.validation';
import { OrganisationRepository } from '../../repository/organisation.repository';
import { AgentByEmailResponse } from '../../interface/response/agent.response.interface';

const email = new SendEmail();

export class AdminCreateAgentClientController extends AdminController {
  context: Context;

  constructor(context: Context) {
    super();
    this.context = context;
  }

  async run(): Promise<AgentClientResponse | ErrorResponse> {
    /**
     * Validate Admin
     */
    const res = await super.isValid(this.context);
    if (res === true) {
      const validateRequest =
        await CreateAgentClientValidation.createAgentClientValidation(
          this.context
        );
      if (validateRequest === true) {
        try {
          const agentClientAlreadyAssociated =
            await AgentClientRepository.getAgentAndClient(
              this.context?.req?.params?.agentId,
              this.context?.req?.params?.clientId
            );
          console.log(
            'Is agent and client is already associated',
            agentClientAlreadyAssociated
          );
          if (agentClientAlreadyAssociated) {
            throw errorResponse(
              { message: 'agent is already associated with client' },
              409
            );
          }
          const agentClientCreated =
            await AgentClientRepository.adminCreateAgentClient({
              agentId: this.context?.req?.params?.agentId,
              clientId: this.context?.req?.params?.clientId
            });
          console.log(
            'Create agent client relation success-',
            agentClientCreated
          );
          const agentClientData = await AgentClientRepository.getAgentAndClient(
            this.context?.req?.params?.agentId,
            this.context?.req?.params?.clientId
          );


          console.log('Get agent client success', agentClientData);
          const emailToAgent = {
            From: process.env['POSTMARK_SENDER_EMAIL'],
            To: agentClientData?.agentEmail,
            TemplateAlias: 'AGENT_EMAIL_ASSIGNED_TO_CLIENT',
            TemplateModel: {
              AgentName: agentClientData?.agentName,
              ClientName: agentClientData?.clientName,
              ClientUrl: process.env['KV_CLIENT_URL'],
              PartnerPortalUrl: this.getPPUrl()
            }
          };
          console.log('Sending mail to agent---');
          await email.sendEmail(emailToAgent);

          const emailToClient = {
            From: process.env['POSTMARK_SENDER_EMAIL'],
            To: agentClientData?.clientEmail,
            TemplateAlias: 'CLIENT_EMAIL_AGENT_ASSIGNED',
            TemplateModel: {
              AgentName: agentClientData?.agentName,
              ClientName: agentClientData?.clientName,
              ClientUrl: process.env['KV_CLIENT_URL'],
              PartnerPortalUrl: this.getPPUrl()
            }
          };
          console.log('Sending mail to client---');
          await email.sendEmail(emailToClient);
          return agentClientCreated;
        } catch (error) {
          console.log('Controller - create agent client catch block', error);
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
