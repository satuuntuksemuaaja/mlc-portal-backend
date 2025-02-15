import { Context } from '@azure/functions';
import joi from 'joi';
import { errorResponse } from '../../response/error.response';

export class BffInvitationAcceptedValidation {
  static validationForBffInvitationAccepted = joi.object({
    organisation_key: joi.string().trim(true).required(),
    email: joi
      .string()
      .trim(true)
      .email({ tlds: { allow: false } })
      .required(),
    userid: joi.string().trim(true).required(),
    connectionid: joi.string().trim(true).required(),
    subscriptionid: joi.string().trim(true).required()
  });
  public static async bffInvitationAcceptedValidation(context: Context) {
    try {
      const { error } = this.validationForBffInvitationAccepted.validate(
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
