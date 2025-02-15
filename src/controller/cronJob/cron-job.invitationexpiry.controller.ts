import { ActivitiesRepository } from '../../repository/activities.repository';
import { AgentClientRepository } from '../../repository/agentclient.repository';
import { ClientRepository } from '../../repository/client.repository';
import { ExpiredClient } from '../../interface/response/client.response.interface';
import { AirBrake } from '../../util/airbrake';
import { MeecoInvitationService } from '../../service/meeco.invitation.service';
import { OrganisationRepository } from '../../repository/organisation.repository';
import { BffInvitationService } from '../../service/invitation/invitation.bff.service';
import { AuditRepository } from '../../repository/audit.repository';
import { SendEmail } from '../../util/email';

export class CronJobInvitationExpiryController {

  async run() {
    try {

      // Pending clients whos invitations have expired.
      console.log('Get Expired Invites');
      const clients: ExpiredClient[] = await ClientRepository.getExpiredInvitations();
      console.log('Retrieved Expired Invites: Total Expired' + (clients && clients.length > 0 ? clients.length : ""));

      if (clients && clients.length > 0) {

        for (let index = 0; index < clients.length; index++) {
          const client = clients[index];
          try {

            const org = await OrganisationRepository.getOrganisation(client.orgId);

            console.log('Cancelling Invite in Meeco', client.name);
            try {
              await new MeecoInvitationService(
                org.org.key
              ).delete(client?.invitationId);
              console.log('Mecco invite deleted');
            }catch(err) {
              
              console.log('Mecco invite delete Failed', err);
            }
            
            const toCancel = client.invitationId;

            console.log('Cancelling Client in DB', client.name);
            await ClientRepository.cancelExpiredInvitation(client);
            console.log('Cancelled Client in DB');

            //Bff invite deleted
            console.log('Cancelling Client in BFF', client.name);
            await new BffInvitationService().delete({
              invitationId: toCancel
            });
            console.log('Bff invitation deleted');

            // get assigned agents
            const agents = await AgentClientRepository.getAgentForClient(client.id);

            // create audit and activity entries for all agents.
            console.log('Create Audit Entries');
            for (let x = 0; x < agents.length; x++) {
              const currentAgent = agents[x];
              
              await AuditRepository.createAudit({
                orgId: org.org.id,
                agentId: "" + currentAgent.agentId,
                clientId: client?.id,
                action: `${client?.email} Cancelled (Invitation Expired)`,
                details: `Name: ${client?.name}, Email: ${client?.email}`,
                time: new Date()
              });
  
              await ActivitiesRepository.addActivities({
                agentId: currentAgent.agentId,
                clientId: client?.id,
                name: client?.name,
                message: `Client ${client?.email} Cancelled (Invitation Expired)`,
                section: 'client',
                title: 'Client Cancelled',
                created: new Date()
              });
            }
      
            // send email to agents
            console.log('Emailing Agents - Total Agents:' + agents.length);
            const ppURL =  process.env['KV_PP_URL'] + "?org=" + org?.org.key;
            const emailToAgents = [];

            await Promise.all(agents.map(async (agent) => {

              const clientAndAgent = await AgentClientRepository.getAgentAndClient(agent.agentId, client.id);

              const emailToAgent = {
                From: process.env['POSTMARK_SENDER_EMAIL'],
                To: clientAndAgent.agentEmail,
                TemplateAlias: 'AGENT_EMAIL_CLIENT_INVITATION_EXPIRED',
                TemplateModel: {
                  ClientName: client?.name,
                  ClientEmail: client?.email,
                  AgentName: clientAndAgent?.agentName,
                  OrganisationName: org.org.name,
                  ClientUrl: process.env['KV_CLIENT_URL'],
                  PartnerPortalUrl: ppURL
                }
              };
              emailToAgents.push(emailToAgent);
            }));

            console.log('Sending email in batch');
            const email = new SendEmail();
            await email.sendBatchEmail(emailToAgents);
            console.log('Emailed Agents');
            
            console.log('Email Client');
            //send email to client - Pending 
            const emailToClient = {
              From: process.env['POSTMARK_SENDER_EMAIL'],
              To: client.email,
              TemplateAlias: 'CLIENT_EMAIL_INVITATION_EXPIRED',
              TemplateModel: {
                ClientName: client?.name,
                ClientEmail: client?.email,
                OrganisationName: org.org.name,
                ClientUrl: process.env['KV_CLIENT_URL'],
                PartnerPortalUrl: ppURL
              }
            };
            await email.sendEmail(emailToClient);
            console.log('Emailed Client');

          }catch(err) {
            console.log(err, 'Cancel Expired Invitation Failed ', client.email);
            await AirBrake.notify(err);
          }
        }
      }
    
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

}