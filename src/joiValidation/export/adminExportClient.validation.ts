import { Context } from '@azure/functions';
import joi from 'joi';
import { errorResponse } from '../../response/error.response';

export class AdminExportClientValidation {
  static validationForAdminExportClient = joi.object({
    dateFrom: joi.string().trim(true),
    dateTo: joi.string().trim(true)
  });
  public static async adminExportClientValidation(context: Context) {
    try {
      const { error } = this.validationForAdminExportClient.validate(
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
