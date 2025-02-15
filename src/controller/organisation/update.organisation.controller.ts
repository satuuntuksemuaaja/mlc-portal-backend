import { Context } from '@azure/functions';
import { ErrorResponse } from '../../response/error.response';
import { OrganisationRepository } from '../../repository/organisation.repository';
import { AdminController } from '../admin.controller';
import { GetOrganisationResponse } from '../../interface/response/organisation.response.interface';
import { UpdateOrganisationRequest } from '../../interface/request/organisation.request.interface';
import { BffOrganisationService } from '../../service/organisation/organisation.bff.service';
import { ResizeImage } from '../../util/resizeImage';

export class UpdateOrganisationController extends AdminController {
  context: Context;

  constructor(context: Context) {
    super();
    this.context = context;
  }

  async run(): Promise<GetOrganisationResponse | ErrorResponse> {
    const res = await super.isValid(this.context);
    if (res === true) {
      // const validateRequest =
      //   await UpdateOrganisationValidation.updateOrganisationValidation(
      //     this.context
      //   );
      // if (validateRequest === true) {
      const organisationId: string =
        this.userRole?.usermessage?.currentAgent?.orgId;
      const organisationData: UpdateOrganisationRequest =
        this.context?.req?.body?.org;
      try {
        const image = await ResizeImage.resizeImage(
          organisationData?.logoThumbnail,
          'organisation'
        );
        if (image && image != 'failed') {
          console.log('Resize image success', image);
          organisationData.logoThumbnail = image;
        }
        const updatedOrg = await OrganisationRepository.updateOrganisations(
          organisationId,
          organisationData
        );
        console.log('Update organisation success', updatedOrg?.org?.id);

        const serviceId = await OrganisationRepository.getServiceId(
          updatedOrg.org.id
        );
        console.log('Organisation service id', serviceId);
        const bffUpdateSuccess = await new BffOrganisationService().update({
          organisation: {
            key: updatedOrg.org.key,
            name: updatedOrg.org.name,
            website: updatedOrg.org.websiteUrl,
            logo: updatedOrg.org.logoThumbnail,
            service_user_id: serviceId
          }
        });
        console.log('Bff updated', bffUpdateSuccess);
        if (bffUpdateSuccess.ok) {
          return updatedOrg;
        } else {
          throw { ok: null };
        }
      } catch (error) {
        console.error('Update Organisation Failed ', error);
        throw error;
      }
      // } else {
      //   throw validateRequest;
      // }
    } else {
      console.error('Update Organisation Failed');
      throw res;
    }
  }
}
