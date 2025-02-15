import { Context } from '@azure/functions';
import { ErrorResponse } from '../../response/error.response';
import { ActivitiesRepository } from '../../repository/activities.repository';
import { AdminController } from '../admin.controller';
import { ActivitiesList } from '../../interface/response/activities.response.interface';
import { AgentByEmailResponse } from '../../interface/response/agent.response.interface';
import { GetActivitesValidation } from '../../joiValidation/activity/getActivites.validation';

export class GetActivitiesController extends AdminController {
  context: Context;

  constructor(context: Context) {
    super();
    this.context = context;
  }

  async run(): Promise<ActivitiesList | ErrorResponse> {
    /**
     * Validate user
     */
    const res = await super.isValidUser(this.context);
    if (res === true) {
      const validateRequest =
        await GetActivitesValidation.getActivitesValidation(this.context);
      if (validateRequest === true) {
        try {
          const currentAgent: AgentByEmailResponse =
            this.userRole?.usermessage?.currentAgent;
          console.log('Getting Activites-------');
          return await ActivitiesRepository.getActivities(
            currentAgent.id,
            this.context?.req?.query?.page,
            this.context?.req?.query?.records
          );
        } catch (error) {
          console.log('Controller - get activities catch block', error);
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
