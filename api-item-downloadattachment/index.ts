import { AzureFunction, Context } from '@azure/functions';
import { App } from '../src/app';
import { baseResponse } from '../src/response/base.response';
import { errorResponse } from '../src/response/error.response';
import fs from 'fs';
import os from 'os';
import { GetItemAttachmentController } from '../src/controller/item/get.item.attachment.controller';
import { MimeHelper } from '../src/util/mime';
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
      return (context.res = await errorResponse(res.usermessage, res.dieCode));
    }

    // get attachment
    const result = await new GetItemAttachmentController(context).run();
    console.log('Success');

    context.res = await baseResponse(new Uint8Array(result.data), 200, {
      'Content-Type':
        result.info.content_type === 'text/plain'
          ? MimeHelper.getMime(result.info.filename)
          : result.info.content_type,
      'Content-Disposition': 'inline; filename="' + result.info.filename + '"'
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
