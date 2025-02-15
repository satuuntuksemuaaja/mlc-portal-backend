import { Context } from '@azure/functions';
import joi from 'joi';
import { errorResponse } from '../../response/error.response';

export class GetActivitesValidation {
  static validationForGetActivites = joi.object({
    page: joi.string().trim(true),
    records: joi.string().trim(true)
  });
  public static async getActivitesValidation(context: Context) {
    try {
      const { error } = this.validationForGetActivites.validate(
        context?.req?.query
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
