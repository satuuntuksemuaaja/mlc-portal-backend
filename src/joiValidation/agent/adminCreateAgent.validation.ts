import { Context } from '@azure/functions';
import joi from 'joi';
import { errorResponse } from '../../response/error.response';

export class AdminCreateAgentValidation {
  static validationForCreateAgent = joi.object({
    emailPrefix: joi.string().min(3).max(250).trim(true).required(),
    name: joi.string().min(3).max(250).trim(true).required(),
    roleId: joi.number().required(),
  });
  public static async adminCreateAgentValidation(context: Context) {
    try {
      const { error } = this.validationForCreateAgent.validate(
        context?.req?.body
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
