import { AzureFunction, Context } from '@azure/functions';
import { App } from '../src/app';
import { baseResponse } from '../src/response/base.response';
import { errorResponse } from '../src/response/error.response';
import { ExportSubscriptionsResponse } from '../src/interface/response/export.response.interface';
import { AdminExportSubscriptionController } from '../src/controller/export/get.admin.export.subscription.controller';
import { AirBrake } from '../src/util/airbrake';

const httpTrigger: AzureFunction = async function (
  context: Context
): Promise<object> {
  const app = new App();
  try {
    const res = await app.start(context);
    if (res.die) {
      return (context.res = await errorResponse(res.usermessage, res.dieCode));
    }
    /**
     * Role - Admin
     * Export of the client and clientterm table for the organisation
     */
    const result: ExportSubscriptionsResponse =
      await new AdminExportSubscriptionController(context).run();
    console.log('Success', result);
    context.res = await baseResponse(result, 200, {
      'Content-Type': 'application/json'
    });
  } catch (ex) {
    console.log(
      'Export of the client and clientterm table index file - catch block',
      ex
    );
    await AirBrake.notify(ex);
    if (ex?.statusCode) {
      context.res = ex;
    } else {
      context.res = await errorResponse(
        { message: 'Internal server error' },
        500
      );
    }
  } finally {
    /**
     * Shutting down the app
     */
    await app.shutdown(context);
  }
};

export default httpTrigger;
