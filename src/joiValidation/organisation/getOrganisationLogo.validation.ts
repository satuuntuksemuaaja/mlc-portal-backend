import { Context } from '@azure/functions';
import joi from 'joi';
import { errorResponse } from '../../response/error.response';

export class GetOrganisationLogoValidation {
  static validationForGetOrganisationLogo = joi.object({
    key: joi.string().trim(true).required()
  });
  public static async getOrganisationLogoValidation(context: Context) {
    try {
      const { error } = this.validationForGetOrganisationLogo.validate(
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
