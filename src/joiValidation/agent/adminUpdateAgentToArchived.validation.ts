import { Context } from '@azure/functions';
import joi from 'joi';
import { errorResponse } from '../../response/error.response';

export class AdminUpdateAgentToArchivedValidation {
  static validationForUpdateAgent = joi.object({
    id: joi.string().trim(true).uuid().required()
  });
  public static async adminUpdateAgentToArchivedValidation(context: Context) {
    try {
      const { error } = this.validationForUpdateAgent.validate(
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
