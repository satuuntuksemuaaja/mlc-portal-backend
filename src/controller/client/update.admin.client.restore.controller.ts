import { Context } from '@azure/functions';
import { ClientResponse } from '../../interface/response/client.response.interface';
import { ErrorResponse } from '../../response/error.response';
import { ClientRepository } from '../../repository/client.repository';
import { AdminController } from '../admin.controller';
import { AgentByEmailResponse } from '../../interface/response/agent.response.interface';
import { ClientTermRepository } from '../../repository/clientterm.repository';
import { BffClientSubscriptionService } from '../../service/subscription/subscription.bff.service';
import { ActiveClientSubscription } from '../../interface/response/clientterm.response.interface';
import { ClientTermStatus } from '../../model/enums/clientterm.enum';
import { ActivitiesRepository } from '../../repository/activities.repository';
import { AgentClientRepository } from '../../repository/agentclient.repository';
import { SendEmail } from '../../util/email';
import { AdminRestoreClientValidation } from '../../joiValidation/client/adminRestoreClient.validation';

const email = new SendEmail();

export class AdminRestoreClientController extends AdminController {
  context: Context;

  constructor(context: Context) {
    super();
    this.context = context;
  }

  async run(): Promise<ClientResponse | ErrorResponse> {
    /**
     * Validate Admin
     */
    const res = await super.isValid(this.context);
    if (res === true) {
      const validateRequest =
        await AdminRestoreClientValidation.adminRestoreClientValidation(
          this.context
        );
      if (validateRequest === true) {
        try {
          const activityObj = [],
            emailToAgent = [];

          const currentAgent: AgentByEmailResponse =
            this.userRole?.usermessage?.currentAgent;
          const client: ClientResponse =
            await ClientRepository.adminRestoreClient(
              currentAgent,
              this.context?.req?.params?.id
            );
          console.log('Restoring client success', client?.email);

          // Checking if client have active subscription
          const clientSubscription: ActiveClientSubscription =
            await ClientTermRepository.activeSubcriptionCheckForClient(
              client?.id
            );
          console.log('Client active subscription', clientSubscription);
          // Getting Agent assigned to client
          const clientsAgent =
            await AgentClientRepository.getAdminClientActiveAgentList(
              client.id,
              currentAgent?.organisation?.id.toString()
            );
          // Creating object for email and activity
          clientsAgent.map(async (agentData) => {
            activityObj.push({
              agentId: agentData.id,
              clientId: client.id,
              name: client.name,
              message: `${client.name} Restored`,
              section: 'client',
              title: 'Client Restored',
              created: new Date()
            });
            emailToAgent.push({
              From: process.env['POSTMARK_SENDER_EMAIL'],
              To: agentData?.email,
              TemplateAlias: 'AGENT_EMAIL_CLIENT_RESTORED',
              TemplateModel: {
                ClientName: client?.name,
                AgentName: agentData?.name,
                OrganisationName: currentAgent?.organisation?.name,
                ClientUrl: process.env['KV_CLIENT_URL'],
                PartnerPortalUrl: this.getPPUrl()
              }
            });
          });
          if (clientSubscription) {
            console.log('Sending email in batch');
            await email.sendBatchEmail(emailToAgent);
            return client;
          }
          const bffupdated = await new BffClientSubscriptionService().update({
            organisation_key: clientSubscription?.client?.organisation?.key,
            duration: 365,
            email: clientSubscription?.client?.email
          });
          console.log('Bff update success', bffupdated);
          const dateAfterYear = new Date();
          dateAfterYear.setMonth(dateAfterYear.getMonth() + 12);
          if (bffupdated.ok) {
            await ClientTermRepository.createSubscription([
              {
                clientId: client.id,
                durationMonths: 12,
                start: new Date(),
                end: dateAfterYear,
                status: ClientTermStatus.ACTIVE
              }
            ]);
            await ActivitiesRepository.createBulkActivities(activityObj);
            console.log('Sending email in batch');
            await email.sendBatchEmail(emailToAgent);
            return client;
          }
        } catch (error) {
          console.log('Controller - restore client catch block', error);
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
