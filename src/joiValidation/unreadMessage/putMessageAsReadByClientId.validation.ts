import { Context } from '@azure/functions';
import joi from 'joi';
import { errorResponse } from '../../response/error.response';

export class PutMessageAsReadByClienIdValidation {
  static validationForPutMessageAsReadByClienId = joi.object({
    clientId: joi.string().uuid().trim(true).required()
  });
  public static async putMessageAsReadByClienIdValidation(context: Context) {
    try {
      const { error } = this.validationForPutMessageAsReadByClienId.validate(
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
