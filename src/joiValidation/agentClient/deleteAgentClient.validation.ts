import { Context } from '@azure/functions';
import joi from 'joi';
import { errorResponse } from '../../response/error.response';

export class DeleteAgentClientValidation {
  static validationForDeleteAgentClient = joi.object({
    agentId: joi.string().trim(true).uuid().required(),
    clientId: joi.string().trim(true).uuid().required()
  });
  public static async deleteAgentClientValidation(context: Context) {
    try {
      const { error } = this.validationForDeleteAgentClient.validate(
        context?.req?.params
      );
      if (error) {
        return errorResponse({ message: error.message }, 400);
      } else {
        return true;
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
