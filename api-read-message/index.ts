import { AzureFunction, Context } from '@azure/functions';
import { baseResponse } from '../src/response/base.response';
import { errorResponse } from '../src/response/error.response';
import { PublicApp } from '../src/app.public';
import { UpdateMessaageAsRead } from '../src/controller/unreadMessage/put.message.read.controller';
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

    const resp = await new UpdateMessaageAsRead(context).run();
    context.res = await baseResponse(resp, 200, {
      'Content-Type': 'application/json'
    });
  } catch (ex) {
    await AirBrake.notify(ex);
    if (ex?.statusCode) {
      context.res = ex;
    } else {
      console.log('get organisation request Failed', ex);
      context.res = errorResponse({}, 500);
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
