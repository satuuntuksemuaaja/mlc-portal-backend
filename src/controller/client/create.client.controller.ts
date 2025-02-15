import { Context } from '@azure/functions';
import { ClientByEmailResponse, ClientByIdResponse, UserClientResponse } from '../../interface/response/client.response.interface';
import { ErrorResponse } from '../../response/error.response';
import { ClientRepository } from '../../repository/client.repository';
import { AdminController } from '../admin.controller';
import { AgentByEmailResponse } from '../../interface/response/agent.response.interface';
import { MeecoInvitationService } from '../../service/meeco.invitation.service';
import { BffInvitationService } from '../../service/invitation/invitation.bff.service';
import { AgentClientRepository } from '../../repository/agentclient.repository';
import { ActivitiesRepository } from '../../repository/activities.repository';
import { AuditRepository } from '../../repository/audit.repository';
import { CreateClientResponse } from '../../interface/response/client.response.interface';
import { CreateClientValidation } from '../../joiValidation/client/createClient.validation';
import { SendEmail } from '../../util/email';
import { ClientStatus } from '../../model/enums/client.enum';

export class CreateClientController extends AdminController {
  context: Context;
  private readonly duration = 365 * 24 * 60;

  constructor(context: Context) {
    super();
    this.context = context;
  }

  /**
   * Re-Invite a cancelled client.
   * Contacts the BFF 
   * @returns 
   */
  async reinvite(): Promise<ClientByIdResponse | ErrorResponse> {
    
    console.log('Validating User');

    const res = await super.isValidUser(this.context);
    if (res === true) {
      
      console.log('Validating Payload');
      const validateRequest = await CreateClientValidation.clientReInviteValidation(this.context);

      if (validateRequest === true) {
        console.log('User Validated');

        const orgKey: string = this.userRole?.usermessage?.currentAgent?.organisation?.key;
        console.log('Org Key: ' + orgKey);


       
         

          try {
            console.log("Extract current Agent");
            const currentAgent: AgentByEmailResponse = this.userRole?.usermessage?.currentAgent;

            const clientId: string = this.context.req.params.id;
            console.log("Load Existing Client", clientId);
            const client = await ClientRepository.getClientById(clientId, currentAgent.orgId);

            console.log('Creating Meeco Invitation');
            let invitationSuccess = await this.getMeecoInvitation(orgKey, client.email);
            if (!invitationSuccess) {
              throw 'Create Meeco Invitation Failed';
            }
            console.log('Created Meeco Invitation');

            if (client != null) {
              console.log("Loaded Client, checkign cancelled status", client);

              if (client.status == ClientStatus.CANCELLED) {
                console.log("Cancelled - proceed", client.email);

                console.log("Update client invitation details in DB (with transaction)");
                const updateObj: CreateClientResponse = await ClientRepository.reInviteClient(
                  currentAgent,
                  client,
                  invitationSuccess.id,
                  invitationSuccess.expire_at);
                console.log("Pending DB Update Data");
                console.log(updateObj.data);
                
                console.log("Generate Welcome Message");
                let textBody = this.getWelcomeMessage(
                  currentAgent.organisation.welcomeMessageTemplate, 
                  client.name,
                  currentAgent.organisation.name);

                //update the client
                console.log("Register invitation With BFF");
                const bffSuccess = await this.registerWithBFF(
                  orgKey, 
                  client.email, 
                  invitationSuccess.id,
                  invitationSuccess.token,
                  textBody);

                  if (bffSuccess) {
                    //Commiting transaction and creating audit and activity after bff success
                    console.log("Commiting client update transaction");
                    await updateObj?.transaction.commit();
      
                    await this.sendClientEmails(client.name, client.email, currentAgent.organisation.name);
                    await this.createAuditMessages(currentAgent.orgId, currentAgent.id, client.id, client.name, client.email);
      
                    return client;
                  } else {
                    //If bff fails cleaning up everything
                    await this.rollback(invitationSuccess, updateObj, orgKey);
                    invitationSuccess = null;
                    throw "Re Invitation Failed (BFF Failure)";
                  }

              }
            }
          }catch (error) {
            console.log('Controller - update client catch block', error);
            throw error;
          }

      }
    }else {
      throw res;
    }
  }


  async run(): Promise<UserClientResponse | ErrorResponse> {
    /**
     * Validate email domain
     */
    const res = await super.isValidUser(this.context);
    if (res === true) {

      console.log("Validate Payload");
      const validateRequest =
        await CreateClientValidation.clientCreateValidation(this.context);

      const orgKey: string = this.userRole?.usermessage?.currentAgent?.organisation?.key;
      console.log('Org Key: ' + orgKey);
      
      if (validateRequest === true) {

        //Sending mecco invite
        let invitationSuccess = await this.getMeecoInvitation(orgKey, this.context?.req?.body?.email);

        if (invitationSuccess) {
          try {
            // FIXME: move duration to constant or db or ?
          
            const currentAgent: AgentByEmailResponse =
              this.userRole?.usermessage?.currentAgent;

            console.log("Create Client");
            const createObj: CreateClientResponse = await this.createClient(invitationSuccess, currentAgent, orgKey);

            console.log("Link Agent to Client");
            await this.linkAgent(currentAgent, createObj, orgKey);

            let textBody = this.getWelcomeMessage(
              currentAgent.organisation.welcomeMessageTemplate, 
              createObj.data.name,
              currentAgent.organisation.name
              );

            const bffSuccess = await this.registerWithBFF(
              orgKey, 
              createObj.data.email, 
              invitationSuccess.id,
              invitationSuccess.token,
              textBody);

            if (bffSuccess) {
              //Commiting transaction and creating audit and activity after bff success
              console.log("Commiting transaction");
              await createObj?.transaction.commit();

              await this.sendClientEmails(createObj.data.name, createObj.data.email, currentAgent.organisation.name);
              await this.createAuditMessages(currentAgent.orgId, currentAgent.id, createObj.data.id, createObj.data.name, createObj.data.email);

              return createObj?.data;
            } else {
              //If bff fails cleaning up everything
              await this.rollback(invitationSuccess, createObj, orgKey);
              invitationSuccess = null;
              throw "Invitation Failed";
            }
          } catch (error) {
            console.log('Controller - create client catch block', error);
            await new MeecoInvitationService(orgKey).delete(
              invitationSuccess?.id
            );
            throw error;
          }
        } else {
          throw 'Create Meeco Invitation Failed';
        }
      } else {
        throw validateRequest;
      }
    } else {
      throw res;
    }
  }

  private getWelcomeMessage(
    template: string, 
    clientName: string, 
    orgName: string) {
    console.log("Generate Welcome Message - Replace Variables");
    let textBody = '';
    if (template) {
      textBody = template.replace('{ClientName}', clientName);
      textBody = textBody.replace('{OrganisationName}', orgName);
    }
    return textBody;
  }

  private async rollback(invitationSuccess, createObj: CreateClientResponse, orgKey: string) {
    console.log('Bff error cleaning up everything----');
    try {
      await new BffInvitationService().delete({
        invitationId: invitationSuccess?.id
      });
    } catch (err) {
      // don't really care here as this is best effor to cleanup
    }

    try {
      await new MeecoInvitationService(orgKey).delete(
        invitationSuccess?.id
      );
    }catch(e2) {
      // best effort to cleanup
      console.log(e2);
    }

    await createObj?.transaction?.rollback();
  }

  private async createAuditMessages(orgId:string, agentId:string, clientId:string, clientName:string, clientEmail:string) {
    await AuditRepository.createAudit({
      orgId: orgId,
      agentId: agentId,
      clientId: null,
      action: 'Client Invited',
      details: clientEmail,
      time: new Date()
    });
    await ActivitiesRepository.addActivities({
      agentId: agentId,
      clientId: clientId,
      name: clientName,
      message: `Client ${clientEmail} Invited`,
      section: 'client',
      title: 'Client Invited',
      created: new Date()
    });
  }

  private async sendClientEmails(name: string, email: string, orgName: string) {
    console.log("Prep Welcome Email");
    const emailToClient = {
      From: process.env['POSTMARK_SENDER_EMAIL'],
      To: email,
      TemplateAlias: 'CLIENT_EMAIL_INVITATION',
      TemplateModel: {
        OrganisationName: orgName,
        ClientName: name,
        ClientUrl: process.env['KV_CLIENT_URL'],
        PartnerPortalUrl: this.getPPUrl()
      }
    };
    console.log("Sending Welcome Email");
    const emailSender = new SendEmail();
    await emailSender.sendEmail(emailToClient);
  }

  private async registerWithBFF(
    orgKey: string, 
    clientEmail: string,
    invitationId: string,
    invitationToken: string,
    textBody: string) {
      
    console.log(orgKey, 'Sending invitation details the BFF');
    //Sharing bff invitation
    const bffSuccess = await new BffInvitationService().share({
      invitation: {
        organisation_key: orgKey,
        email: clientEmail,
        invitation_id: invitationId,
        token: invitationToken,
        duration: this.duration,
        welcome_message: textBody
      }
    });
    console.log(orgKey, 'BFF Response', bffSuccess);
    return bffSuccess;
  }

  private async linkAgent(currentAgent: AgentByEmailResponse, createObj: CreateClientResponse, orgKey: string) {
    await AgentClientRepository.adminCreateAgentClient(
      {
        agentId: currentAgent?.id,
        clientId: createObj.data.id
      },
      createObj.transaction
    );
    console.log(orgKey, 'Client linked to agent', currentAgent.email);
  }

  private async createClient(invitationSuccess, currentAgent: AgentByEmailResponse, orgKey: string) {
    this.context.req.body.invitationId = invitationSuccess.id;
    this.context.req.body.invitationExpiry = invitationSuccess.expire_at;

    const createObj: CreateClientResponse = await ClientRepository.createClient(
      currentAgent,
      this.context?.req?.body
    );

    console.log(orgKey, 'Client Created', createObj?.data?.email);
    return createObj;
  }

  private async getMeecoInvitation(orgKey: string, email: string) {
    const msvc = new MeecoInvitationService(orgKey);
    let invitationSuccess = await msvc.invite(email);
    console.log('Meeco invite success', invitationSuccess);
    return invitationSuccess;
  }
}
