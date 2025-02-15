import { Context } from '@azure/functions';
import { AdminController } from '../admin.controller';
import { AgentByEmailResponse } from '../../interface/response/agent.response.interface';
import { ClientRepository } from '../../repository/client.repository';
import { errorResponse } from '../../response/error.response';
import { AgentClientRepository } from '../../repository/agentclient.repository';
import { CreateActivitiesRequest } from '../../interface/request/activity.request.interface';
import { AuditRepository } from '../../repository/audit.repository';
import { ActivitiesRepository } from '../../repository/activities.repository';
import { BffItemService } from '../../service/item/item.bff.service';
import { SendEmail } from '../../util/email';
import { ItemSendCompleteValidation } from '../../joiValidation/item/itemSendComplete.validation';
import { MeecoItemService } from '../../service/meeco.item.service';
import { MeecoShareService } from '../../service/meeco.share.service';

const email = new SendEmail();

export class ItemSendCompleteController extends AdminController {
  context: Context;

  constructor(context: Context) {
    super();
    this.context = context;
  }

  async run(): Promise<void> {
    /**
     * Validate Admin/User
     */
    const res = await super.isValidUser(this.context);
    if (res === true) {
      const validateRequest =
        await ItemSendCompleteValidation.itemSendCompleteValidation(
          this.context
        );
      if (validateRequest === true) {
        try {
          const clientObj: CreateActivitiesRequest[] = [];
          const itemId = this.context?.req?.params?.itemId;
          const currentAgent: AgentByEmailResponse =
            this.userRole?.usermessage?.currentAgent;
          /**
           * Get Client if not found throw error
           */
          const client = await ClientRepository.getClientById(
            this.context?.req?.params?.clientId,
            currentAgent?.orgId
          );
          if (!client) {
            throw errorResponse({ message: 'Client not found' }, 404);
          }
          const isAgentClientRelated =
            await AgentClientRepository.getAgentAndClient(
              currentAgent?.id,
              client?.id
            );
          if (!isAgentClientRelated) {
            throw errorResponse(
              {
                message: 'client is not associated with agent'
              },
              403
            );
          }
          console.log('Client/Agent validated');
          const agent =
            await AgentClientRepository.getAdminClientActiveAgentList(
              client?.id,
              currentAgent?.orgId
            );
          const item = await new MeecoItemService(
            currentAgent?.organisation?.key
          ).getItem(this.context?.req?.params?.itemId);
          if (!item) {
            throw errorResponse({ message: 'Item not available' }, 404);
          }
          console.log('Load item success', item);

          await AuditRepository.createAudit({
            agentId: currentAgent?.id,
            clientId: client?.id,
            action: 'Item Shared',
            details: `Item ${itemId} shared with client ${client?.name}`,
            orgId: currentAgent?.orgId,
            time: new Date()
          });
          const itemName = item?.slotsByName
            ? item?.slotsByName['name']?.value
            : '';

          agent.map(async (agent) => {
            clientObj.push({
              agentId: agent?.id,
              clientId: client?.id,
              name: client?.name,
              message: itemName + ` sent to ` + client?.name,
              section: 'client',
              title: 'Item Sent',
              created: new Date()
            });
          });
          await ActivitiesRepository.createBulkActivities(clientObj);
          const emailToClient = {
            From: process.env['POSTMARK_SENDER_EMAIL'],
            To: client.email,
            TemplateAlias: 'CLIENT_EMAIL_NEW_ITEM',
            TemplateModel: {
              OrganisationName: currentAgent?.organisation?.name,
              ClientName: client?.name,
              ClientUrl: process.env['KV_CLIENT_URL'],
              PartnerPortalUrl: this.getPPUrl()
            }
          };
          console.log('Sending email to client--');
          await email.sendEmail(emailToClient);

          const isvc = new MeecoItemService(
            currentAgent?.organisation?.key
          );
          const shareRes = await isvc.getSharedItemWithUser(item.id, client.meecoUserId);
          await new BffItemService().itemSent(client.email, currentAgent?.organisation?.key, shareRes.id);
        } catch (error) {
          console.log('Controller - create item catch block', error);
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
