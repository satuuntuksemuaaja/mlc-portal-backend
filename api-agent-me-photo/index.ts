import { AzureFunction, Context } from '@azure/functions';
import { GetMePhotoAgentController } from '../src/controller/agent/get.me.photo.agent.controller';
import { App } from '../src/app';
import { baseResponse } from '../src/response/base.response';
import { errorResponse } from '../src/response/error.response';
import { GetAgentPhoto } from '../src/interface/response/agent.response.interface';
import { AirBrake } from '../src/util/airbrake';

const httpTrigger: AzureFunction = async function (
  context: Context
): Promise<object> {
  const app = new App();
  try {
    /**
     * Running app start function contains databse validation, JWT token validation
     */ const res = await app.start(context);
    if (res.die) {
      return (context.res = await errorResponse(res.usermessage, res.dieCode));
    }

    /**
     * Role - User/Admin
     * Get Agent photo
     */
    const result: GetAgentPhoto = await new GetMePhotoAgentController(
      context
    ).run();
    console.log('Success', result);
    let photo = null;
    if (result.photo) {
      const photoBuffer = new Buffer(result.photo.split(',')[1], 'base64');
      photo = new Uint8Array(photoBuffer);
    }
    context.res = await baseResponse(photo, 200, {
      'Content-Type': 'image/png'
    });
  } catch (ex) {
    await AirBrake.notify(ex);
    if (ex?.statusCode) {
      context.res = ex;
    } else {
      console.log('Get agents photo index file - catch block', ex);
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
