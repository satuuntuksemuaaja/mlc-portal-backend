import { Context } from '@azure/functions';
import joi from 'joi';
import { errorResponse } from '../../response/error.response';

export class GetAdminAgentValidation {
  static validationForArchived = joi.object({
    archived: joi.string().trim(true).valid('true', 'false')
  });
  public static async getAdminAgentValidation(context: Context) {
    try {
      const { error } = this.validationForArchived.validate(
        context?.req?.query
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
