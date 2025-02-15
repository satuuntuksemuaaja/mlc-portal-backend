import { Context } from '@azure/functions';
import joi from 'joi';
import { errorResponse } from '../../response/error.response';

export class MessageSendValidation {
  static validationForClientId = joi.object({
    clientId: joi.string().uuid().trim(true).required()
  });
  static validationForMessage = joi.object({
    msg: joi.string().trim(true).required()
  });
  public static async messageSendValidation(context: Context) {
    try {
      const { error } = this.validationForClientId.validate(
        context?.req?.params
      );
      const error1 = this.validationForMessage.validate(context?.req?.body);
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
