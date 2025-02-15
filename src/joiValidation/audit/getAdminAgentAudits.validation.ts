import { Context } from '@azure/functions';
import joi from 'joi';
import { errorResponse } from '../../response/error.response';

export class GetAdminAgentAuditValidation {
  static validationForAgentId = joi.object({
    id: joi.string().trim(true).uuid().required()
  });
  static validationForPage = joi.object({
    page: joi.string().trim(true)
  });
  public static async getAdminAgentAuditValidation(context: Context) {
    try {
      const { error } = this.validationForAgentId.validate(
        context?.req?.params
      );
      const error1 = this.validationForPage.validate(context?.req?.query);
      if (error || error1.error) {
        return errorResponse(
          { message: error?.message || error1?.error?.message },
          400
        );
      } else {
        return true;
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
