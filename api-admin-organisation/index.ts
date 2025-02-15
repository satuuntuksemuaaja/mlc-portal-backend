import { AzureFunction, Context } from '@azure/functions';
import { App } from '../src/app';
import { baseResponse } from '../src/response/base.response';
import { errorResponse } from '../src/response/error.response';
import { GetOrganisationController } from '../src/controller/organisation/get.organisation.controller';
import { UpdateOrganisationController } from '../src/controller/organisation/update.organisation.controller';
import { AirBrake } from '../src/util/airbrake';

const httpTrigger: AzureFunction = async function (
  context: Context
): Promise<object> {
  console.log('Admin organisation request');
  console.log(context.req.url);
  console.log(context.req.method);

  console.log('Launch App');
  const app = new App();

  try {
    /**
     * Running app start function contains databse validation, JWT token validation
     */
    const res = await app.start(context);
    if (res.die) {
      context.log.error('App Launch Failed');
      context.res = await errorResponse(res.usermessage, res.dieCode);
      console.log('Request Failed');
      return;
    }

    if (context.req.method == 'GET') {
      console.log('Get organisation data');
      const controller = new GetOrganisationController(context);
      const result = await controller.run();
      context.res = await baseResponse(result, 200, {
        'Content-Type': 'application/json'
      });
    } else if (context.req.method == 'PUT') {
      console.log('Update organisation data');
      const result = await new UpdateOrganisationController(context).run();
      context.res = await baseResponse(result, 200, {
        'Content-Type': 'application/json'
      });
    } else {
      context.res = await errorResponse({ message: 'Invalid Request' }, 500);
    }

    console.log('Request Complete');
  } catch (ex) {
    await AirBrake.notify(ex);
    if (ex?.statusCode) {
      context.res = ex;
    } else {
      console.log('Admin organisation request Failed', ex);
      context.res = await errorResponse(
        { message: 'Internal server error' },
        500
      );
    }
  } finally {
    /**
     * Shutting down the app
     */
    console.log('Shutdown App');
    await app.shutdown(context);
  }
};

export default httpTrigger;
