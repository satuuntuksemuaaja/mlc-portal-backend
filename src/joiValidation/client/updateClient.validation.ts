import { Context } from '@azure/functions';
import joi from 'joi';
import { errorResponse } from '../../response/error.response';

export class UpdateClientValidation {
  static validationForUpdateClient = joi.object({
    id: joi.string().trim(true).uuid().required(),
    name: joi.string().min(3).max(250).trim(true).required(),
    ref: joi.string().trim(true).optional().allow('', null),
    notes: joi.string().trim(true).optional().allow('', null),
    phone: joi
      .string()
      .length(10)
      .trim(true)
      .pattern(
        /^(?:\+?(61))? ?(?:\((?=.*\)))?(0?[2-57-8])\)? ?(\d\d(?:[- ](?=\d{3})|(?!\d\d[- ]?\d[- ]))\d\d[- ]?\d[- ]?\d{3})$/
      )
      .optional()
      .allow('', null)
  });
  public static async clientUpdateValidation(context: Context) {
    try {
      const { error } = this.validationForUpdateClient.validate(
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
