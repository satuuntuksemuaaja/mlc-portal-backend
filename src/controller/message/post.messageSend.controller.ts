import { Context } from '@azure/functions';
import { AdminController } from '../admin.controller';
import { AgentByEmailResponse } from '../../interface/response/agent.response.interface';
import { MeecoItemService } from '../../service/meeco.item.service';
import { ClientRepository } from '../../repository/client.repository';
import { errorResponse } from '../../response/error.response';
import { AgentClientRepository } from '../../repository/agentclient.repository';
import { AgentStatus } from '../../model/enums/agent.enum';
import { ClientTermRepository } from '../../repository/clientterm.repository';
import { ClientStatus } from '../../model/enums/client.enum';
import { ClientTermStatus } from '../../model/enums/clientterm.enum';
import { MeecoConnectionService } from '../../service/meeco.connection.service';
import { MeecoShareService } from '../../service/meeco.share.service';
import { MessageSendValidation } from '../../joiValidation/message/messageSend.validation';
import { MeecoItemConversion } from '../../meeco/item/item.conversion';
import { SendEmail } from '../../util/email';
import { CreateActivitiesRequest } from '../../interface/request/activity.request.interface';
import { ActivitiesRepository } from '../../repository/activities.repository';
import { BffItemService } from '../../service/item/item.bff.service';

export class MessageSendController extends AdminController {
  context: Context;

  constructor(context: Context) {
    super();
    this.context = context;
  }

  async run(): Promise<object> {
    /**
     * Validate Admin/User
     */
    const res = await super.isValidUser(this.context);
    if (res === true) {
      const validateRequest = await MessageSendValidation.messageSendValidation(
        this.context
      );
      if (validateRequest === true) {
        try {
          const Retry = 3;
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
          console.log('Client/Agent validated', client?.email);
          if (currentAgent?.status != AgentStatus.ACTIVE) {
            throw errorResponse({ message: 'Agent is not active' }, 403);
          }

          if (client?.status != ClientStatus.ACTIVE) {
            if (client?.status === ClientStatus.ARCHIVED) {
              const clientSubscription =
                await ClientTermRepository.adminClientsubscriptionHistory(
                  client?.id
                );
              console.log(
                'Get archived client subscription success',
                clientSubscription
              );
              const activeSubscriptions =
                clientSubscription?.subscriptionhistory?.filter(
                  (subscription) =>
                    subscription.status === ClientTermStatus.ACTIVE
                );
              if (activeSubscriptions?.length === 0) {
                throw errorResponse(
                  { message: 'Invalid activity for client' },
                  403
                );
              }
            } else {
              throw errorResponse(
                { message: 'Invalid activity for client' },
                403
              );
            }
          }
          const loadClientConnection = await new MeecoConnectionService(
            currentAgent?.organisation?.key
          ).getForUser(client?.meecoUserId);

          if (!loadClientConnection) {
            throw await errorResponse(
              {
                message: 'Invalid Meeco User Connection'
              },
              422
            );
          }
          console.log('Load connection success', loadClientConnection);

          // Message Create ---------
          const itemCreated = await new MeecoItemService(
            currentAgent.organisation.key
          ).createMessage(
            loadClientConnection,
            this.context?.req?.body?.msg,
            currentAgent?.name
          );
          console.log('Message item created', itemCreated?.id);
          if (itemCreated) {
            let tryCount = 0;
            /**
             * Share item to client if fails 3 times delete item
             */
            // eslint-disable-next-line no-loops/no-loops
            while (tryCount <= Retry) {
              if (tryCount === Retry) {
                new MeecoItemService(
                  currentAgent?.organisation?.key
                ).deleteItem(itemCreated?.id);
                throw await errorResponse(
                  { message: 'Failed to share item to client' },
                  409
                );
              }
              try {
                // This connects the item to the client user in the meeco world. The user will be notified later.
                const shareSvc = new MeecoShareService(
                  currentAgent?.organisation?.key
                );
                const share = await shareSvc.shareItem(
                  itemCreated?.id,
                  loadClientConnection.own?.id
                );

                try {
                  const emailToClient = {
                    From: process.env['POSTMARK_SENDER_EMAIL'],
                    To: client.email,
                    TemplateAlias: 'CLIENT_EMAIL_NEW_MESSAGE',
                    TemplateModel: {
                      OrganisationName: currentAgent?.organisation?.name,
                      ClientName: client?.name,
                      ClientUrl: process.env['KV_CLIENT_URL'],
                      PartnerPortalUrl: this.getPPUrl()
                    }
                  };
                  console.log('Sending email to client--');
                  const email = new SendEmail();
                  await email.sendEmail(emailToClient);
                }catch(mex) {
                  console.log('Error Sending email to client');
                }

                try {

                  // load all agents for Client
                  const agents =
                  await AgentClientRepository.getAdminClientActiveAgentList(
                    client?.id,
                    currentAgent?.orgId
                  );

                  // Create an activity record
                  const activities: CreateActivitiesRequest[] = [];
                  agents.map(async (agent) => {
                    activities.push({
                      agentId: agent?.id,
                      clientId: client?.id,
                      name: client?.name,
                      message: currentAgent?.name + ' sent a message to ' + client?.name,
                      section: 'client',
                      title: 'Message Sent',
                      created: new Date()
                    });
                  });

                  // create activities
                  await ActivitiesRepository.createBulkActivities(activities);

                }catch(aex) {
                  console.log('Error creating activities for message');
                }
                
                await new BffItemService().messageSent(client.email, currentAgent?.organisation?.key, share.id);
                return new MeecoItemConversion().convert(itemCreated);
              } catch (error) {
                console.log(
                  'While sharing item to client in create message item',
                  error
                );
              }
              tryCount++;
            }
          }
        } catch (error) {
          console.log('Controller - message send catch block', error);
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
