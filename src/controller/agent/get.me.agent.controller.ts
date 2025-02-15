import { Context } from '@azure/functions';
import {
  AgentByEmailResponse,
  GetAgentResponse
} from '../../interface/response/agent.response.interface';
import { AgentRepository } from '../../repository/agent.repository';
import { OrganisationRepository } from '../../repository/organisation.repository';
import { ErrorResponse } from '../../response/error.response';
import { BffOrganisationService } from '../../service/organisation/organisation.bff.service';
import { AdminController } from '../admin.controller';

export class GetAgentController extends AdminController {
  context: Context;

  constructor(context: Context) {
    super();
    this.context = context;
  }

  async run(): Promise<GetAgentResponse | ErrorResponse> {
    /**
     * Validate Admin
     */
    const res = await super.isAdminOrUserRole(this.context);
    if (res === true) {
      try {
        const currentAgent: AgentByEmailResponse =
          this.userRole?.usermessage?.currentAgent;
        const agent = await AgentRepository.getAgent(currentAgent);
        console.log('Get agent success', agent?.me?.email);
        if (!currentAgent?.organisation?.bffRegistered) {
          console.log('Organisation is not bff registered--');
          const serviceId = await OrganisationRepository.getServiceId(
            currentAgent?.organisation.id
          );
          console.log('get organisation service id success-', serviceId);
          const bffCreateSuccess = await new BffOrganisationService().create({
            organisation: {
              key: currentAgent?.organisation?.key,
              name: currentAgent?.organisation?.name,
              website: currentAgent?.organisation?.websiteUrl,
              logo: currentAgent?.organisation?.logoThumbnail,
              service_user_id: serviceId
            }
          });
          if (bffCreateSuccess.ok) {
            console.log(
              'bff created successfully now registering organisation--'
            );
            await OrganisationRepository.markRegistered(currentAgent?.orgId);
            return agent;
          } else {
            throw null;
          }
        } else {
          return agent;
        }
      } catch (error) {
        console.log('Controller - create agent catch block', error);
        throw error;
      }
    } else {
      throw res;
    }
  }
}
