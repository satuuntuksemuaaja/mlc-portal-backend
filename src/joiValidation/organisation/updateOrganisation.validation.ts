import { Context } from '@azure/functions';
import joi from 'joi';
import { errorResponse } from '../../response/error.response';

export class UpdateOrganisationValidation {
  static validationForUpdateOrganisation = joi.object({
    name: joi.string().min(3).max(250).trim(true).required(),
    websiteUrl: joi.string().uri().allow('').trim(true).required(),
    logoThumbnail: joi.string().trim(true).optional().allow('', null),
    welcomeMessageTemplate: joi.string().trim(true).optional().allow('', null),
    bffRegistered: joi.boolean()
  });
  public static async updateOrganisationValidation(context: Context) {
    try {
      const { error } = this.validationForUpdateOrganisation.validate(
        context?.req?.body?.org
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
