import { Context } from '@azure/functions';
import { CommonResponse, UnknownErrResponse } from './response/common.response';
import { BaseApp } from './base.app';

export class BffApp extends BaseApp {
  async start(context: Context): Promise<CommonResponse> {
    try {
      this.setupLogging(context);

      // BFF authentication
      return await this.bffAuthentication(context);
    } catch (error) {
      console.log('Unknown Error', error);
      return UnknownErrResponse;
    }
  }
}
