import { Context } from '@azure/functions';
import joi from 'joi';
import { errorResponse } from '../../response/error.response';

export class CreateClientValidation {
  static validationForCreateClient = joi.object({
    name: joi.string().min(3).max(250).trim(true).required(),
    ref: joi.string().trim(true).optional().allow(null, ''),
    notes: joi.string().trim(true).optional().allow(null, ''),
    email: joi
      .string()
      .email({ tlds: { allow: false } })
      .required(),
    phone: joi
      .string()
      .length(10)
      .trim(true)
      .pattern(
        /^(?:\+?(61))? ?(?:\((?=.*\)))?(0?[2-57-8])\)? ?(\d\d(?:[- ](?=\d{3})|(?!\d\d[- ]?\d[- ]))\d\d[- ]?\d[- ]?\d{3})$/
      )
      .optional()
      .allow(null, '')
  });
  public static async clientCreateValidation(context: Context) {
    try {
      const { error } = this.validationForCreateClient.validate(
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

  static validationForReInviteClient = joi.object({
    email: joi
      .string()
      .email({ tlds: { allow: false } })
      .required()
  });  
  public static async clientReInviteValidation(context: Context) {
    try {
      const { error } = this.validationForReInviteClient.validate(
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
