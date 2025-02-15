import { AzureFunction, Context } from '@azure/functions';
import { App } from '../src/app';
import { baseResponse } from '../src/response/base.response';
import { ErrorResponse, errorResponse } from '../src/response/error.response';
import { CreateClientController } from '../src/controller/client/create.client.controller';
import { ClientByIdResponse } from '../src/interface/response/client.response.interface';
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
      context.log.error('App Launch Failed');
      return (context.res = await errorResponse(res.usermessage, res.dieCode));
    }
    /**
     * Check request method
     */
    if (context.req.method == 'POST') {
      const result: ClientByIdResponse | ErrorResponse =
        await new CreateClientController(context).reinvite();
      console.log('Success', result);
      context.res = await baseResponse(result, 200, {
        'Content-Type': 'application/json'
      });
    } else {
      context.res = await errorResponse({ message: 'Invalid Request' }, 500);
    }
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
