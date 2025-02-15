import { AzureFunction, Context } from '@azure/functions';
import { App } from '../src/app';
import { baseResponse } from '../src/response/base.response';
import { errorResponse } from '../src/response/error.response';
import { getAgentClientList } from '../src/interface/response/agentclient.response.interface';
import { AgentClientListController } from '../src/controller/agentClient/get.agent.client.list.controller';
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
     * Role - User
     * Client list for an agent
     */
    const clients: getAgentClientList[] = await new AgentClientListController(
      context
    ).run();
    console.log('Success', { clients });
    context.res = await baseResponse({ clients }, 200, {
      'Content-Type': 'application/json'
    });
  } catch (ex) {
    console.log('Client list for an agent index file - catch block', ex);
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
