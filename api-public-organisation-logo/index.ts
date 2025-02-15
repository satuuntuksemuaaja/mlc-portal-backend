import { AzureFunction, Context } from '@azure/functions';
import { baseResponse } from '../src/response/base.response';
import { ErrorResponse, errorResponse } from '../src/response/error.response';
import { GetOrganisationLogoController } from '../src/controller/organisation/get.logo.oranisation.controller';
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

    const key: string = context.req.params.key;
    if (key) {
      const logo: string | ErrorResponse =
        await new GetOrganisationLogoController(context).run();
      console.log('Success', logo);
      let data = null;
      if (logo && typeof logo == 'string') {
        const buffer = new Buffer(logo.split(',')[1], 'base64');
        data = new Uint8Array(buffer);
        context.res = await baseResponse(data, 200, {
          'Content-Type': 'image/png'
        });
      } else {
        context.res = errorResponse({}, 404);
      }
    } else {
      context.res = errorResponse({}, 404);
    }
  } catch (ex) {
    await AirBrake.notify(ex);
    if (ex?.statusCode) {
      context.res = ex;
    } else {
      console.log('get organisation logo request Failed', ex);
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
