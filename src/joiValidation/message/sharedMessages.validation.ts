import { Context } from '@azure/functions';
import joi from 'joi';
import { errorResponse } from '../../response/error.response';

export class GetSharedMessagesValidation {
  static validationForClientId = joi.object({
    clientId: joi.string().uuid().trim(true).required(),
    shareId: joi.string().trim(true).required()
  });
  public static async getSharedMessagesValidation(context: Context) {
    try {
      const { error } = this.validationForClientId.validate(
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
