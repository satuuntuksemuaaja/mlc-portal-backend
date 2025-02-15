import { AzureFunction } from '@azure/functions';
import intercept from 'azure-function-log-intercept';
import { CornJobSubscription } from '../src/controller/cronJob/cron-job.subscription.controller';
import { AirBrake } from '../src/util/airbrake';

const httpTrigger: AzureFunction = async function (context): Promise<void> {
  try {
    intercept(context);
    await new CornJobSubscription().run();
    console.log('success subscription-----');
  } catch (ex) {
    await AirBrake.notify(ex);
    console.log('get organisation request Failed', ex);
  }
};

export default httpTrigger;
