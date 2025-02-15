import { Context } from '@azure/functions';
import { OrganisationRepository } from '../../repository/organisation.repository';
import { BffOrganisationService } from '../../service/organisation/organisation.bff.service';

export class CronJobOrganisationController {
  context: Context;

  constructor(context: Context) {
    this.context = context;
  }

  async run(): Promise<void> {
    try {
      const organisationList =
        await OrganisationRepository.allOrganisationList();
      console.log('Organisation list-', organisationList);
      organisationList.map(async (organisation) => {
        if (!organisation?.bffRegistered) {
          console.log('Register organisation to bff');
          const serviceId = await OrganisationRepository.getServiceId(
            organisation.id
          );
          console.log('Organisation service id');
          const bffCreateSuccess = await new BffOrganisationService().create({
            organisation: {
              key: organisation?.key,
              name: organisation?.name,
              website: organisation?.websiteUrl,
              logo: organisation?.logoThumbnail,
              service_user_id: serviceId
            }
          });
          if (bffCreateSuccess.ok) {
            console.log('Bff created success', bffCreateSuccess);
            await OrganisationRepository.markRegistered(
              organisation?.id.toString()
            );
          }
        }
      });
    } catch (error) {
      console.log('Controller - create agent catch block', error);
    }
  }
}
