import { Context } from '@azure/functions';
import joi from 'joi';
import { errorResponse } from '../../response/error.response';

export class AdminGetClientSubscriptionHistoryValidation {
  static validationForClientId = joi.object({
    id: joi.string().trim(true).uuid().required()
  });
  public static async adminGetClientSubscriptionHistoryValidation(
    context: Context
  ) {
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
