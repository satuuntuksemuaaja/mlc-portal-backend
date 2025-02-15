import { Context } from '@azure/functions';
import { CommonResponse, UnknownErrResponse } from './response/common.response';
import { BaseApp } from './base.app';

export class App extends BaseApp {
  async start(context: Context): Promise<CommonResponse> {
    console.log('App.Start');

    try {
      this.setupLogging(context);
      const respJwt = await this.validateJwt(process, context);

      console.log('respJwt', respJwt);

      if (respJwt.ok) {
        console.log('db connection - start');
        const respDb = await this.connectToDatabase();
        return respDb; // ok or error
      }

      // error
      console.log('App.Start - Complete');
      return respJwt;
    } catch (error) {
      console.log('Unknown Error', error);
      return UnknownErrResponse;
    }
  }
}
