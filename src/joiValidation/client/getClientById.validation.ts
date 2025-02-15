import { Context } from '@azure/functions';
import joi from 'joi';
import { errorResponse } from '../../response/error.response';

export class GetClientByIdValidation {
  static validationForGetClientById = joi.object({
    id: joi.string().trim(true).uuid().required()
  });
  public static async getClientByIdValidation(context: Context) {
    try {
      const { error } = this.validationForGetClientById.validate(
        context?.req?.params
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
