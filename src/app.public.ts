import { Context } from '@azure/functions';
import { CommonResponse, UnknownErrResponse } from './response/common.response';
import { BaseApp } from './base.app';

export class PublicApp extends BaseApp {
  async start(context: Context): Promise<CommonResponse> {
    try {
      this.setupLogging(context);

      // connect to DB
      return await this.connectToDatabase();
    } catch (error) {
      console.log('Unknown Error', error);
      return UnknownErrResponse;
    }
  }
}
