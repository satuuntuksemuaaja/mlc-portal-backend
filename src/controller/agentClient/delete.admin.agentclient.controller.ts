import { Context } from '@azure/functions';
import { ErrorResponse } from '../../response/error.response';
import { AgentClientRepository } from '../../repository/agentclient.repository';
import { AdminController } from '../admin.controller';
import { SendEmail } from '../../util/email';
import { AdminAgentAndClient } from '../../interface/response/agentclient.response.interface';
import { DeleteAgentClientValidation } from '../../joiValidation/agentClient/deleteAgentClient.validation';

const email = new SendEmail();
export class AdminDeleteAgentClientController extends AdminController {
  context: Context;

  constructor(context: Context) {
    super();
    this.context = context;
  }

  async run(): Promise<any | ErrorResponse> {
    /**
     * Validate Admin
     */
    const res = await super.isValid(this.context);
    if (res === true) {
      const validateRequest =
        await DeleteAgentClientValidation.deleteAgentClientValidation(
          this.context
        );
      if (validateRequest === true) {
        try {
          const clientId: string = this.context?.req?.params?.clientId;
          const agnetId: string = this.context?.req?.params?.agentId;
          const agentClinetDeleted: AdminAgentAndClient =
            await AgentClientRepository.adminDeleteAgentClient(
              clientId,
              agnetId
            );
          console.log(
            `Delete relation of client ${clientId} with agent ${agnetId} success`
          );
          const emailToAgent = {
            From: process.env['POSTMARK_SENDER_EMAIL'],
            To: agentClinetDeleted?.agentEmail,
            TemplateAlias: 'AGENT_EMAIL_REMOVED_FROM_CLIENT',
            TemplateModel: {
              AgentName: agentClinetDeleted?.agentName,
              ClientName: agentClinetDeleted?.clientName,
              OrganisationName: agentClinetDeleted?.organisationName,
              ClientUrl: process.env['KV_CLIENT_URL'],
              PartnerPortalUrl: this.getPPUrl()
            }
          };
          console.log('Sending mail to agent---');
          await email.sendEmail(emailToAgent);

          const emailToClient = {
            From: process.env['POSTMARK_SENDER_EMAIL'],
            To: agentClinetDeleted?.clientEmail,
            TemplateAlias: 'CLIENT_EMAIL_AGENT_REMOVED',
            TemplateModel: {
              AgentName: agentClinetDeleted?.agentName,
              ClientName: agentClinetDeleted?.clientName,
              OrganisationName: agentClinetDeleted?.organisationName,
              ClientUrl: process.env['KV_CLIENT_URL'],
              PartnerPortalUrl: this.getPPUrl()
            }
          };
          console.log('Sending mail to client---');
          await email.sendEmail(emailToClient);
          return agentClinetDeleted;
        } catch (error) {
          console.log('Controller - delete agent client catch block', error);
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
