import { Context } from '@azure/functions';
import joi from 'joi';
import { errorResponse } from '../../response/error.response';

export class GetMessagesValidation {
  static validationForClientId = joi.object({
    clientId: joi.string().uuid().trim(true).required()
  });
  static validationForNextPage = joi.object({
    nextPageAfter: joi.string().trim(true)
  });
  public static async getMessagesValidation(context: Context) {
    try {
      const { error } = this.validationForClientId.validate(
        context?.req?.params
      );
      const error1 = this.validationForNextPage.validate(context?.req?.query);
      if (error || error1.error) {
        return errorResponse(
          { message: error?.message || error1?.error?.message },
          400
        );
      } else {
        return true;
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
