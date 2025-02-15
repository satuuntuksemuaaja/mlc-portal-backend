import { Context } from '@azure/functions';
import { GetOrganisationLogoValidation } from '../../joiValidation/organisation/getOrganisationLogo.validation';
import { OrganisationRepository } from '../../repository/organisation.repository';
import { ErrorResponse } from '../../response/error.response';

export class GetOrganisationLogoController {
  context: Context;

  constructor(context: Context) {
    this.context = context;
  }

  async run(): Promise<string | ErrorResponse> {
    const validateRequest =
      await GetOrganisationLogoValidation.getOrganisationLogoValidation(
        this.context
      );
    if (validateRequest === true) {
      const organisationKey = this.context.req.params.key;
      try {
        console.log('Getting organisation logo for-', organisationKey);
        return await OrganisationRepository.getOrganisationLogo(
          organisationKey
        );
      } catch (error) {
        console.log('Controller - get organisation logo catch block - ', error);
        throw error;
      }
    } else {
      throw validateRequest;
    }
  }
}
