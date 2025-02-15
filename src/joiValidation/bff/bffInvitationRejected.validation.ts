import { Context } from '@azure/functions';
import joi from 'joi';
import { errorResponse } from '../../response/error.response';

export class BffInvitationRejectedValidation {
  static validationForBffInvitationRejected = joi.object({
    organisation_key: joi.string().trim(true).required(),
    email: joi
      .string()
      .trim(true)
      .email({ tlds: { allow: false } })
      .required()
  });
  public static async bffInvitationRejectedValidation(context: Context) {
    try {
      const { error } = this.validationForBffInvitationRejected.validate(
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
