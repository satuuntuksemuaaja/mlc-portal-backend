import { Context } from '@azure/functions';
import joi from 'joi';
import { errorResponse } from '../../response/error.response';

export class ItemAttachValidation {
  static validationForClientIdAndItemId = joi.object({
    clientId: joi.string().uuid().trim(true).required(),
    itemId: joi.string().trim(true).required()
  });
  public static async itemAttachValidation(context: Context) {
    try {
      const { error } = this.validationForClientIdAndItemId.validate(
        context?.req?.params
      );
      if (error) {
        return errorResponse({ message: error?.message }, 400);
      } else {
        return true;
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
