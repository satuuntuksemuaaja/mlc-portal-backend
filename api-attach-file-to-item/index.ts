import { AzureFunction, Context } from '@azure/functions';
import { App } from '../src/app';
import { errorResponse } from '../src/response/error.response';
import { baseResponse } from '../src/response/base.response';
import multipart from 'parse-multipart';
import { AirBrake } from '../src/util/airbrake';

const httpTrigger: AzureFunction = async function (
  context: Context
): Promise<object> {
  const app = new App();
  try {
    /**
     * Running app start function contains databse validation, JWT token validation
     */
    const res = await app.start(context);
    if (res.die) {
      return (context.res = await errorResponse(res.usermessage, res.dieCode));
    }
    const bodyBuffer = Buffer.from(context.req.body);
    const boundary = multipart.getBoundary(context.req.headers['content-type']);
    const parts = multipart.Parse(bodyBuffer, boundary);
    console.log('Success');
    context.res = await baseResponse(
      {
        name: parts[0].filename,
        type: parts[0].type,
        data: parts[0].data.length
      },
      200,
      {
        'Content-Type': 'application/json'
      }
    );
  } catch (ex) {
    await AirBrake.notify(ex);
    console.log('client request Failed', ex);
    context.res = await errorResponse(
      { message: 'Internal server error' },
      500
    );
  } finally {
    /**
     * Shutting down the app
     */
    console.log('Shutdown App');
    await app.shutdown(context);
  }
};

export default httpTrigger;
