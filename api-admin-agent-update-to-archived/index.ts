import { AzureFunction, Context } from '@azure/functions';
import { App } from '../src/app';
import { baseResponse } from '../src/response/base.response';
import { ErrorResponse, errorResponse } from '../src/response/error.response';
import { AgentResponse } from '../src/interface/response/agent.response.interface';
import { AdminArchiveAgentController } from '../src/controller/agent/update.admin.archive.agent..controller';
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
     * Updates agent to archive
     */
    const agent: AgentResponse | ErrorResponse =
      await new AdminArchiveAgentController(context).run();
    console.log('Success', agent);
    context.res = await baseResponse({ agent }, 200, {
      'Content-Type': 'application/json'
    });
  } catch (ex) {
    console.log('Updates agent to archive index file catch block', ex);
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
