import { Context } from '@azure/functions';
import joi from 'joi';
import { errorResponse } from '../../response/error.response';

export class PutMessageAsReadValidation {
  static validationForPutMessageAsRead = joi.object({
    id: joi.string().trim(true).required()
  });
  public static async putMessageAsReadValidation(context: Context) {
    try {
      const { error } = this.validationForPutMessageAsRead.validate(
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
