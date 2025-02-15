import { DbContext } from './config/db.config';
import { Context } from '@azure/functions';
import {
  AuthError401Response,
  CommonResponse,
  OkResponse,
  SystemDownResponse
} from './response/common.response';
import { Middleware } from './middleware/checkRole';
import intercept from 'azure-function-log-intercept';
import azureJWT from 'azure-jwt-verify';

export class BaseApp {
  /**
   * Configures console.log to redirect to the Azure log files.
   */
  protected setupLogging(context: Context) {
    intercept(context);
  }

  /**
   * Configures console.log to redirect to the Azure log files.
   */
  protected async connectToDatabase(): Promise<CommonResponse> {
    try {
      await DbContext.initialise();
      await DbContext.getDatabase()
        .authenticate()
        .catch(async (error) => {
          console.error('Unable to connect to the database:', error);
          return SystemDownResponse;
        });
      console.log('Connection has been established successfully.');
      return OkResponse;
    } catch (error) {
      console.error('Unable to connect to the database:', error);
      return SystemDownResponse;
    }
  }

  /**
   * Validate the JWT
   * @param process
   * @param context
   * @returns
   */
  protected async validateJwt(process, context): Promise<CommonResponse> {
    const env = process.env['ENV'];
    const headers = context.req.headers;

    // LOCAL = unit testing
    if (env === 'LOCAL') {
      return OkResponse;
    }

    console.log('Validating JWT');

    const config = {
      JWK_URI: process.env['JWK_URI'],
      ISS: process.env['ISS'],
      AUD: process.env['AUD']
    };

    const jwtToken = await Middleware.getToken(headers.authorization);

    return await azureJWT
      .verify(jwtToken, config)
      .then((decoded) => {
        console.log('JWT Validated - ', decoded);
        return OkResponse;
      })
      .catch((error) => {
        console.log('JWT ERROR - ', typeof error, error);
        return AuthError401Response;
      });
  }

  /**
   * Validate BFF Token
   * @param context
   * @returns
   */
  protected async bffAuthentication(context): Promise<CommonResponse> {
    const bffToken = process.env['KV_BFF_INBOUND_AUTH_TOKEN'];
    const token = await Middleware.getToken(context?.req?.headers?.token);

    if (token === bffToken) {
      return OkResponse;
    } else {
      return AuthError401Response;
    }
  }

  async shutdown(context: Context) {
    if (process.env['ENV'] === 'LOCAL') {
      await DbContext.shutdown();
    }
    intercept(context);
    console.log('shutting down app...');
  }
}
