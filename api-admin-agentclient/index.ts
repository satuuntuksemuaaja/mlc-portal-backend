import { AzureFunction, Context } from '@azure/functions';
import { App } from '../src/app';
import { baseResponse } from '../src/response/base.response';
import { ErrorResponse, errorResponse } from '../src/response/error.response';
import { AdminDeleteAgentClientController } from '../src/controller/agentClient/delete.admin.agentclient.controller';
import { AdminCreateAgentClientController } from '../src/controller/agentClient/create.admin.agentclient.controller';
import { AgentClientResponse } from '../src/interface/response/agentclient.response.interface';
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
      const agentclient: AgentClientResponse | ErrorResponse =
        await new AdminCreateAgentClientController(context).run();
      console.log('Success', agentclient);
      context.res = await baseResponse({ agentclient }, 200, {
        'Content-Type': 'application/json'
      });
    } else if (context.req.method == 'DELETE') {
      const result = await new AdminDeleteAgentClientController(context).run();
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
      console.log('Admin agent client request Failed', ex);
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
