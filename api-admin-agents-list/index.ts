import { AzureFunction, Context } from '@azure/functions';
import { App } from '../src/app';
import { baseResponse } from '../src/response/base.response';
import { errorResponse } from '../src/response/error.response';
import { GetAgentsListResponse } from '../src/interface/response/agent.response.interface';
import { AdminAgentListController } from '../src/controller/agent/get.admin.agents.list.ontroller';
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
     * Get agents list
     */
    const agents: GetAgentsListResponse[] = await new AdminAgentListController(
      context
    ).run();
    console.log('Success', agents);
    context.res = await baseResponse({ agents }, 200, {
      'Content-Type': 'application/json'
    });
  } catch (ex) {
    console.log('Get agents list index file catch block', ex);
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
