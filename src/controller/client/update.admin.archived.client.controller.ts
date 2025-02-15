import { Context } from '@azure/functions';
import { ClientResponse } from '../../interface/response/client.response.interface';
import { ClientRepository } from '../../repository/client.repository';
import { AdminController } from '../admin.controller';
import { SendEmail } from '../../util/email';
import { AgentClientRepository } from '../../repository/agentclient.repository';
import { AdminUpdateClientToArchiveValidation } from '../../joiValidation/client/adminUpdateClientToArchive.validation';

const email = new SendEmail();

export class AdminUpdateClientToArchiveController extends AdminController {
  context: Context;

  constructor(context: Context) {
    super();
    this.context = context;
  }

  async run(): Promise<ClientResponse> {
    /**
     * Validate user/admin
     */
    const res = await super.isValid(this.context);
    if (res === true) {
      const validateRequest =
        await AdminUpdateClientToArchiveValidation.adminUpdateClientToArchiveValidation(
          this.context
        );
      if (validateRequest === true) {
        try {
          const currentAgent = this.userRole?.usermessage?.currentAgent;
          const clientId: string = this.context.req.params.id;
          const clientData = await ClientRepository.adminPutClientToArchive(
            currentAgent,
            clientId
          );
          console.log('Update client to archive success', clientData?.email);
          const clientsAgent =
            await AgentClientRepository.getAdminClientActiveAgentList(
              clientId,
              currentAgent?.organisation?.id.toString()
            );
          const emailToAgent = [];
          clientsAgent.map(async (agentData) => {
            const emailToAgentList = {
              From: process.env['POSTMARK_SENDER_EMAIL'],
              To: agentData?.email,
              TemplateAlias: 'AGENT_EMAIL_CLIENT_ARCHIVED',
              TemplateModel: {
                ClientName: clientData?.name,
                AgentName: agentData?.name,
                OrganisationName: currentAgent?.organisation?.name,
                ClientUrl: process.env['KV_CLIENT_URL'],
                PartnerPortalUrl: this.getPPUrl()
              }
            };
            emailToAgent.push(emailToAgentList);
          });
          console.log('Sending email in batch');
          await email.sendBatchEmail(emailToAgent);
          return clientData;
        } catch (error) {
          console.log(
            'Controller - admin put client to archive catch block - ',
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
