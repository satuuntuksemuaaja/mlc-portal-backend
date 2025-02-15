import { Context } from '@azure/functions';
import joi from 'joi';
import { errorResponse } from '../../response/error.response';

export class AdminUpdateAgentValidation {
  static validationForUpdateAgent = joi.object({
    id: joi.string().trim(true).uuid().required(),
    name: joi.string().min(3).max(250).trim(true).required(),
    roleId: joi.number().required(),
    phone: joi
      .string()
      .length(10)
      .trim(true)
      .pattern(
        /^(?:\+?(61))? ?(?:\((?=.*\)))?(0?[2-57-8])\)? ?(\d\d(?:[- ](?=\d{3})|(?!\d\d[- ]?\d[- ]))\d\d[- ]?\d[- ]?\d{3})$/
      ).optional().allow(null, '')
  });
  public static async adminUpdateAgentValidation(context: Context) {
    try {
      const { error } = this.validationForUpdateAgent.validate(
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
