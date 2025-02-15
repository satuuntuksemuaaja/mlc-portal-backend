import { Context } from '@azure/functions';
import joi from 'joi';
import { errorResponse } from '../../response/error.response';

export class AdminUpdateAgentToRestoreValidation {
  static validationForAdminUpdateAgentToRestore = joi.object({
    id: joi.string().trim(true).uuid().required()
  });
  public static async adminUpdateAgentToRestoreValidation(context: Context) {
    try {
      const { error } = this.validationForAdminUpdateAgentToRestore.validate(
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
