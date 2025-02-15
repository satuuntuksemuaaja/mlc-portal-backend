import { Context } from '@azure/functions';
import { UpdateAgentThumbAgentRequest } from '../../interface/request/agent.request.interface';
import {
  AgentByEmailResponse,
  AgentThumbResponse
} from '../../interface/response/agent.response.interface';
import { AgentRepository } from '../../repository/agent.repository';
import { AdminController } from '../admin.controller';
import { ResizeImage } from '../../util/resizeImage';
import { AdminUpdateAgentThumbValidation } from '../../joiValidation/agent/adminAgentUpdateThumb.validation';

export class UpdateAdminAgentThumbController extends AdminController {
  context: Context;

  constructor(context: Context) {
    super();
    this.context = context;
  }

  async run(): Promise<AgentThumbResponse> {
    /**
     * Validate Admin
     */
    const res = await super.isValid(this.context);
    if (res === true) {
      const validateRequest =
        await AdminUpdateAgentThumbValidation.adminUpdateAgentThumbValidation(
          this.context
        );
      if (validateRequest === true) {
        try {
          const agentData: UpdateAgentThumbAgentRequest = this.context.req.body;
          const currentAgent: AgentByEmailResponse =
            this.userRole?.usermessage?.currentAgent;
          console.log('Resizing image if needed---');
          const image = await ResizeImage.resizeImage(
            agentData?.thumb,
            'agent'
          );
          if (image && image != 'failed') {
            console.log('Resizing image success---');
            agentData.thumb = image;
          }
          console.log('Updating agent thumb---');
          return await AgentRepository.adminUpdateAgentThumb(
            currentAgent,
            agentData
          );
        } catch (error) {
          console.log(
            'Controller - admin update agent thumb catch block - ',
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
