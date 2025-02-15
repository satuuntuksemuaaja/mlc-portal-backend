import { Context } from '@azure/functions';
import joi from 'joi';
import { errorResponse } from '../../response/error.response';

export class AdminExportAuditValidation {
  static validationForAdminExportAudit = joi.object({
    dateFrom: joi.string().trim(true),
    dateTo: joi.string().trim(true)
  });
  public static async adminExportAuditValidation(context: Context) {
    try {
      const { error } = this.validationForAdminExportAudit.validate(
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
