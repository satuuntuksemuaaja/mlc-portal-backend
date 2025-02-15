import { AzureFunction, Context } from '@azure/functions';
import { App } from '../src/app';
import { baseResponse } from '../src/response/base.response';
import { errorResponse } from '../src/response/error.response';
import { GetAgentThumbController } from '../src/controller/agent/get.agent.thumb.controller';
import { AgentThumbResponse } from '../src/interface/response/agent.response.interface';
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
     * Get agent thumb
     */
    const result: AgentThumbResponse = await new GetAgentThumbController(
      context
    ).run();
    console.log('Success', result);
    context.res = await baseResponse(result, 200, {
      'Content-Type': 'application/json'
    });
  } catch (ex) {
    console.log('Get agent thumb index file - catch block', ex);
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
