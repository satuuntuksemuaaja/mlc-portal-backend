import { OrganisationRepository } from '../repository/organisation.repository';
import { commonResponse } from '../response/common.response';
import { GetOrganisationResponse } from '../interface/response/organisation.response.interface';

/**
 * To check user's domain with organisation domain.
 * @param orgId
 * @param email
 * @returns
 */
export const validateEmailDomain = async (orgId: string, email: string) => {
  try {
    const organisation: GetOrganisationResponse =
      await OrganisationRepository.getOrganisation(orgId);
    if (!organisation?.org) {
      console.log(`Organisation not found for id = ${orgId}`);
      return await commonResponse(false, true, 404, { error: '4' });
    }
    const domain = email.substring(email.indexOf('@'));

    if (organisation?.org?.primaryDomain != domain) {
      console.log(`User's domain is not the same as the organisation's domain`);
      return await commonResponse(false, true, 401, {
        error: 'User email domain is not same.'
      });
    } else {
      return await commonResponse(true, false, null, {});
    }
  } catch (error) {
    console.log('Check domain - somthing went wrong.', error);
    return await commonResponse(false, true, 500, { error: '1' });
  }
};
