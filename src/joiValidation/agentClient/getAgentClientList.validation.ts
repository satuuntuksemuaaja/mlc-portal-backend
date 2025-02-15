import { Context } from '@azure/functions';
import joi from 'joi';
import { errorResponse } from '../../response/error.response';

export class GetAgentClientValidation {
  static validationForAgentId = joi.object({
    id: joi.string().trim(true).uuid().required()
  });
  public static async getAgentClientValidation(context: Context) {
    try {
      const { error } = this.validationForAgentId.validate(
        context?.req?.params
      );
      if (error) {
        return errorResponse({ message: error?.message }, 400);
      } else {
        return true;
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
