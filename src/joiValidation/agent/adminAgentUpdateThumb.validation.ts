import { Context } from '@azure/functions';
import joi from 'joi';
import { errorResponse } from '../../response/error.response';

export class AdminUpdateAgentThumbValidation {
  static validationForAdminUpdateAgentThumb = joi.object({
    id: joi.string().trim(true).uuid().required(),
    thumb: joi.string().trim(true).required()
  });
  public static async adminUpdateAgentThumbValidation(context: Context) {
    try {
      const { error } = this.validationForAdminUpdateAgentThumb.validate(
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
