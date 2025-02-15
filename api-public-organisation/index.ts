import { AzureFunction, Context } from '@azure/functions';
import { baseResponse } from '../src/response/base.response';
import { ErrorResponse, errorResponse } from '../src/response/error.response';
import { PublicApp } from '../src/app.public';
import { PublicGetOrganisationController } from '../src/controller/organisation/get.organisation.public.controller';
import { PublicGetOrganisationResponse } from '../src/interface/response/organisation.response.interface';
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

    const key: string = context.req.params.key;
    if (key) {
      const resp = await new PublicGetOrganisationController(context).run();
      if ((resp as ErrorResponse).statusCode) {
        context.res = resp as ErrorResponse;
      } else {
        context.res = await baseResponse(
          resp as PublicGetOrganisationResponse,
          200,
          {
            'Content-Type': 'application/json'
          }
        );
      }
    } else {
      context.res = errorResponse({}, 404);
    }
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
