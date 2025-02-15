import { AzureFunction, Context } from '@azure/functions';
import { App } from '../src/app';
import { baseResponse } from '../src/response/base.response';
import { ErrorResponse, errorResponse } from '../src/response/error.response';
import { ClientResponse } from '../src/interface/response/client.response.interface';
import { AdminRestoreClientController } from '../src/controller/client/update.admin.client.restore.controller';
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
    /**
     * Role - Admin
     * Restores client from archived/cancelled/pending
     */
    const result: ClientResponse | ErrorResponse =
      await new AdminRestoreClientController(context).run();
    console.log('Success', result);
    context.res = await baseResponse(result, 200, {
      'Content-Type': 'application/json'
    });
  } catch (ex) {
    console.log(
      'Restores client from archived/cancelled/pending index file catch block',
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
