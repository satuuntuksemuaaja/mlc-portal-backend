import { Context } from '@azure/functions';
import joi from 'joi';
import { errorResponse } from '../../response/error.response';

export class UpdateMePhotoAgentValidation {
  static validationForUpdateMePhotoAgent = joi.object({
    thumb: joi.string().trim(true).required()
  });
  public static async UpdateMeAgentPhotoValidation(context: Context) {
    try {
      const { error } = this.validationForUpdateMePhotoAgent.validate(
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
