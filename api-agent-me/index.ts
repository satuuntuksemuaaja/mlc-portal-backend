import { AzureFunction, Context } from '@azure/functions';
import { App } from '../src/app';
import { baseResponse } from '../src/response/base.response';
import { ErrorResponse, errorResponse } from '../src/response/error.response';
import { GetAgentController } from '../src/controller/agent/get.me.agent.controller';
import { GetAgentResponse } from '../src/interface/response/agent.response.interface';
import { UpdateAgentController } from '../src/controller/agent/update.me.agent.controller';
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
     * Role - User/Admin
     * Get Agents
     */
    if (context.req.method == 'PUT') {
      const result = await new UpdateAgentController(context).run();
      console.log('Success', result);
      context.res = await baseResponse(result, 200, {
        'Content-Type': 'application/json'
      });
    } else if (context.req.method == 'GET') {
      const result: GetAgentResponse | ErrorResponse =
        await new GetAgentController(context).run();
      console.log('Success', result);
      context.res = await baseResponse(result, 200, {
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
      console.log('Get agents index file - catch block', ex);
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
