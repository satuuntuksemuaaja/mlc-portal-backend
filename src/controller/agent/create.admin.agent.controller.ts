import { Context } from '@azure/functions';
import {
  AgentByEmailResponse,
  CreateAgentResponse
} from '../../interface/response/agent.response.interface';
import { ErrorResponse } from '../../response/error.response';
import { AgentRepository } from '../../repository/agent.repository';
import { AdminController } from '../admin.controller';
import { SendEmail } from '../../util/email';
import { AdminCreateAgentValidation } from '../../joiValidation/agent/adminCreateAgent.validation';

const email = new SendEmail();

export class AdminCreateAgentController extends AdminController {
  context: Context;

  constructor(context: Context) {
    super();
    this.context = context;
  }

  async run(): Promise<CreateAgentResponse | ErrorResponse> {
    /**
     * Validate Admin
     */
    const res = await super.isValid(this.context);
    if (res === true) {
      const validateRequest =
        await AdminCreateAgentValidation.adminCreateAgentValidation(
          this.context
        );
      if (validateRequest === true) {
        try {
          const currentAgent: AgentByEmailResponse =
            this.userRole?.usermessage?.currentAgent;
          const agentData: any = await AgentRepository.adminCreateAgent(
            currentAgent,
            this.context?.req?.body
          );
          console.log('Create agent success', agentData?.email);
          const emailToAgent = {
            From: process.env['POSTMARK_SENDER_EMAIL'],
            To: agentData?.email,
            TemplateAlias: 'AGENT_EMAIL_NEWAGENT',
            TemplateModel: {
              AgentName: agentData?.name,
              OrganisationName: currentAgent?.organisation?.name,
              ClientUrl: process.env['KV_CLIENT_URL'],
              PartnerPortalUrl: this.getPPUrl()
            }
          };
          console.log('Sending mail to agent--');
          await email.sendEmail(emailToAgent);
          return agentData;
        } catch (error) {
          console.log('Controller - create agent catch block', await error);
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
