import { Context } from '@azure/functions';
import joi from 'joi';
import { errorResponse } from '../../response/error.response';

export class CreateItemValidation {
  static validationForCreateItem = joi.object({
    name: joi.string().trim(true).required(),
    notes: joi.string().trim(true).optional().allow('', null)
  });
  static validationForClientId = joi.object({
    clientId: joi.string().uuid().trim(true).required()
  });
  public static async createItemValidation(context: Context) {
    try {
      const { error } = this.validationForCreateItem.validate(
        context?.req?.body
      );
      const error1 = this.validationForClientId.validate(context?.req?.params);
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
