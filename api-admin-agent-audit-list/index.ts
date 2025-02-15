import { AzureFunction, Context } from '@azure/functions';
import { App } from '../src/app';
import { baseResponse } from '../src/response/base.response';
import { errorResponse } from '../src/response/error.response';
import { ClientAuditsResponse } from '../src/interface/response/audit.response.interface';
import { AdminAgentAuditsController } from '../src/controller/audit/get.admin.agent.audits.controller';
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
     * Get client audits
     */
    const audits: ClientAuditsResponse[] = await new AdminAgentAuditsController(
      context
    ).run();
    console.log('Success', audits);
    context.res = await baseResponse({ agents: audits }, 200, {
      'Content-Type': 'application/json'
    });
  } catch (ex) {
    console.log('Get client audits index file catch block', ex);
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
