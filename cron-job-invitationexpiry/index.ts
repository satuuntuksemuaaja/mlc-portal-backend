import { AzureFunction } from '@azure/functions';
import intercept from 'azure-function-log-intercept';
import { CronJobInvitationExpiryController } from '../src/controller/cronJob/cron-job.invitationexpiry.controller';
import { AirBrake } from '../src/util/airbrake';

const httpTrigger: AzureFunction = async function (context): Promise<void> {
  try {
    intercept(context);
    await new CronJobInvitationExpiryController().run();
    console.log('Run Invitation Expiry Controller-----');
  } catch (ex) {
    await AirBrake.notify(ex);
    console.log('Check Invitation Expiry Failed', ex);
  }
};

export default httpTrigger;
