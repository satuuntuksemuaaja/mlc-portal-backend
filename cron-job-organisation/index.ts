import { AzureFunction, Context } from '@azure/functions';
import { CronJobOrganisationController } from '../src/controller/cronJob/cron-job.organiser.controller';
import { AirBrake } from '../src/util/airbrake';

const timerTrigger: AzureFunction = async function (
  context: Context
): Promise<void> {
  try {
    await new CronJobOrganisationController(context).run();
    console.log('success run cron job--------');
  } catch (ex) {
    await AirBrake.notify(ex);
    console.log('Get agents index file - catch block', ex);
  }
};

export default timerTrigger;
