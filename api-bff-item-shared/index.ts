import { AzureFunction, Context } from '@azure/functions';
import { App } from '../src/app';
import { errorResponse } from '../src/response/error.response';
import { BffApp } from '../src/app.bff';
import { baseResponse } from '../src/response/base.response';
import { BffItemSharedController } from '../src/controller/bff/post.bff.item.shared.controller';
import { AirBrake } from '../src/util/airbrake';

const httpTrigger: AzureFunction = async function (
  context: Context
): Promise<object> {
  const app = new App();
  try {
    /**
     * Running app start function contains databse validation, JWT token validation
     */
    const bffApp = new BffApp();
    const res = await bffApp.start(context);
    if (res.die) {
      return (context.res = await errorResponse(res.usermessage, res.dieCode));
    }
    await new BffItemSharedController(context).run();
    console.log('Success');
    context.res = await baseResponse('', 200, {
      'Content-Type': 'application/json'
    });
  } catch (ex) {
    await AirBrake.notify(ex);
    if (ex?.statusCode) {
      context.res = ex;
    } else {
      console.log('client request Failed', ex);
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
