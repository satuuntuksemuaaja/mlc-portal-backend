import { Context } from '@azure/functions';
import { PublicGetOrganisationResponse } from '../../interface/response/organisation.response.interface';
import {
  ErrorResponse,
  NotFound404ErrorResponse
} from '../../response/error.response';
import { OrganisationRepository } from '../../repository/organisation.repository';
import { GetOrganisationPublicValidation } from '../../joiValidation/organisation/getOrganisationPublic.validation';

export class PublicGetOrganisationController {
  context: Context;

  constructor(context: Context) {
    this.context = context;
  }

  async run(): Promise<PublicGetOrganisationResponse | ErrorResponse> {
    const validateRequest =
      await GetOrganisationPublicValidation.getOrganisationPublicValidation(
        this.context
      );
    if (validateRequest === true) {
      const organisationKey = this.context.req.params.key;
      try {
        const org = await OrganisationRepository.getPublicOrganisation(
          organisationKey
        );
        console.log('Get public organisation success', org?.id);
        if (org) {
          return {
            name: org.name,
            key: org.key
          } as PublicGetOrganisationResponse;
        }
        return NotFound404ErrorResponse;
      } catch (error) {
        console.log(
          'Controller - get organisation by key catch block - ',
          error
        );
        throw error;
      }
    } else {
      throw validateRequest;
    }
  }
}
