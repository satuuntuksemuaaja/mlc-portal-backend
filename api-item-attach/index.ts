import { AzureFunction, Context } from '@azure/functions';
import { App } from '../src/app';
import { baseResponse } from '../src/response/base.response';
import { errorResponse } from '../src/response/error.response';
import { AttachItemController } from '../src/controller/item/post.item.attach.controller';
import fs from 'fs';
import os from 'os';
import { DeleteDirectories } from '../src/util/deleteFiles';
import { AirBrake } from '../src/util/airbrake';

const httpTrigger: AzureFunction = async function (
  context: Context
): Promise<object> {
  const app = new App();
  const tempdir = os.tmpdir();
  try {
    /**
     * Running app start function contains databse validation, JWT token validation
     */
    const res = await app.start(context);
    if (res.die) {
      context.log.error('App Launch Failed');
      return (context.res = errorResponse(res.usermessage, res.dieCode));
    }
    // Deleting directories exist form 10 minutes or above
    await DeleteDirectories.deleteDirectories(`${tempdir}/MLC`);

    const result = await new AttachItemController(context).run();
    console.log('Success');

    if (result) {
      context.res = await baseResponse(result, 200, {
        'Content-Type': 'application/json'
      });
    } else {
      context.res = errorResponse(
        { error: 'Upload and share did not complete correctly' },
        400
      );
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
    //Deleting File
    if (fs.existsSync(`${tempdir}/MLC/${context?.req?.params?.itemId}`)) {
      fs.rmdirSync(`${tempdir}/MLC/${context?.req?.params?.itemId}`, {
        recursive: true
      });
      console.log('dir removed -------');
    }
    /**
     * Shutting down the app
     */
    console.log('Shutdown App');
    await app.shutdown(context);
  }
};

export default httpTrigger;
