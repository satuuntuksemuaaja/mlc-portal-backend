import { AzureFunction, Context } from '@azure/functions';
import { baseResponse } from '../src/response/base.response';
import { errorResponse } from '../src/response/error.response';
import { GetSystemUpController } from '../src/controller/system/get.system-up';
import { PublicApp } from '../src/app.public';
import { AirBrake } from '../src/util/airbrake';

const httpTrigger: AzureFunction = async function (
  context: Context
): Promise<object> {
  const app = new PublicApp();

  try {
    /**
     * Running app start function contains databse validation, JWT token validation
     */
    const res = await app.start(context);
    if (res.die) {
      return (context.res = await errorResponse(res.usermessage, res.dieCode));
    }
    const result: string = await new GetSystemUpController(context).run();
    console.log('Success', result);
    context.res = await baseResponse({ message: result }, 200, {
      'Content-Type': 'application/json'
    });
  } catch (ex) {
    await AirBrake.notify(ex);
    if (ex?.statusCode) {
      context.res = ex;
    } else {
      console.log('get system up Failed', ex);
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
