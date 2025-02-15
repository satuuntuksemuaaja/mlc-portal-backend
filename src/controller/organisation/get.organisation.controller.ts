import { Context } from '@azure/functions';
import { GetOrganisationResponse } from '../../interface/response/organisation.response.interface';
import { ErrorResponse } from '../../response/error.response';
import { OrganisationRepository } from '../../repository/organisation.repository';
import { AdminController } from '../admin.controller';

export class GetOrganisationController extends AdminController {
  context: Context;

  constructor(context: Context) {
    super();
    this.context = context;
  }

  async run(): Promise<GetOrganisationResponse | ErrorResponse> {
    const res = await super.isValid(this.context);
    if (res == true) {
      const organisationId: string =
        this.userRole?.usermessage?.currentAgent?.orgId;
      console.log('Getting organisation', organisationId);
      try {
        return OrganisationRepository.getOrganisation(organisationId);
      } catch (error) {
        console.log('Controller - get organisation catch block - ', error);
        throw error;
      }
    } else {
      throw res;
    }
  }
}
