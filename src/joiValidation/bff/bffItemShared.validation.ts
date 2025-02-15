import { Context } from '@azure/functions';
import joi from 'joi';
import { errorResponse } from '../../response/error.response';

export class BffItemSharedValidation {
  static validationForBffItemShared = joi.object({
    email: joi.string().trim(true).required(),
    organisation_key: joi.string().trim(true).required(),
    share_id: joi.string().trim(true).required(),
    type: joi.string().trim(true).valid('message', 'item')
  });
  public static async bffItemSharedValidation(context: Context) {
    try {
      const { error } = this.validationForBffItemShared.validate(
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
