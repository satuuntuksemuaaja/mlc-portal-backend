import { AzureFunction, Context } from '@azure/functions';
import { App } from '../src/app';
import { baseResponse } from '../src/response/base.response';
import { ErrorResponse, errorResponse } from '../src/response/error.response';
import { AdminCreateAgentController } from '../src/controller/agent/create.admin.agent.controller';
import { AdminUpdateAgentController } from '../src/controller/agent/update.admin.agent.controller';
import {
  AgentResponse,
  CreateAgentResponse
} from '../src/interface/response/agent.response.interface';
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
     * Check request method
     */
    if (context.req.method == 'POST') {
      const agent: CreateAgentResponse | ErrorResponse =
        await new AdminCreateAgentController(context).run();
      console.log('Success', agent);
      context.res = await baseResponse({ agent }, 200, {
        'Content-Type': 'application/json'
      });
    } else if (context.req.method == 'PUT') {
      const agent: AgentResponse | ErrorResponse =
        await new AdminUpdateAgentController(context).run();
      console.log('Success', agent);
      context.res = await baseResponse({ agent }, 200, {
        'Content-Type': 'application/json'
      });
    } else {
      context.res = await errorResponse({ message: 'Invalid Request' }, 500);
    }
  } catch (ex) {
    await AirBrake.notify(ex);
    if (ex?.statusCode) {
      context.res = ex;
    } else {
      console.log('Admin agent request Failed', ex);
      context.res = await errorResponse(
        { message: 'Internal server error' },
        500
      );
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
