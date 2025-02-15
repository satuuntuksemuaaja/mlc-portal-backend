import { Context } from '@azure/functions';
import joi from 'joi';
import { errorResponse } from '../../response/error.response';

export class GetAdminAgentActiveClientValidation {
  static validationForAgentId = joi.object({
    id: joi.string().trim(true).uuid().required()
  });
  static validationForArchived = joi.object({
    archived: joi.string().trim(true).valid('true', 'false').required()
  });
  public static async getAdminAgentActiveClientValidation(context: Context) {
    try {
      const { error } = this.validationForAgentId.validate(
        context?.req?.params
      );
      const error1 = this.validationForArchived.validate(context?.req?.query);
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
