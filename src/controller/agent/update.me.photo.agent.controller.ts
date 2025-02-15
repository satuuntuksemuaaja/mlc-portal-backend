import { Context } from '@azure/functions';
import { UpdateAgentPhotoRequest } from '../../interface/request/agent.request.interface';
import { GetAgentPhoto } from '../../interface/response/agent.response.interface';
import { AgentRepository } from '../../repository/agent.repository';
import { AdminController } from '../admin.controller';
import { AuditRepository } from '../../repository/audit.repository';
import { ResizeImage } from '../../util/resizeImage';
import { UpdateMePhotoAgentValidation } from '../../joiValidation/agent/updateMePhoto.validation';

export class UpdateMePhotoAgentController extends AdminController {
  context: Context;

  constructor(context: Context) {
    super();
    this.context = context;
  }

  async run(): Promise<GetAgentPhoto> {
    /**
     * Validate Admin
     */
    const res = await super.isAdminOrUserRole(this.context);
    if (res === true) {
      const validateRequest =
        await UpdateMePhotoAgentValidation.UpdateMeAgentPhotoValidation(
          this.context
        );
      if (validateRequest === true) {
        try {
          const currentAgent = this.userRole?.usermessage?.currentAgent;
          const agentBody: UpdateAgentPhotoRequest = this.context.req.body;

          const image = await ResizeImage.resizeImage(agentBody.thumb, 'agent');
          if (image && image != 'failed') {
            console.log('Resizing image success-', image);
            agentBody.thumb = image;
          }
          const agent = await AgentRepository.updateAgentPhoto(
            currentAgent,
            agentBody
          );
          console.log('Update agent thumb success-', agent);
          console.log('creating audit');
          const auditData = {
            orgId: this.userRole?.usermessage?.currentAgent?.orgId,
            agentId: this.userRole?.usermessage?.currentAgent?.id,
            clientId: null,
            action: 'Thumbnail Updated',
            details: '',
            time: new Date()
          };
          await AuditRepository.createAudit(auditData);
          return agent;
        } catch (error) {
          console.log('Controller - create agent catch block', error);
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
