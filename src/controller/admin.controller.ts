import { Context } from '@azure/functions';
import { AgentByEmailResponse } from '../interface/response/agent.response.interface';
import { Middleware } from '../middleware/checkRole';
import { CommonResponse } from '../response/common.response';
import { errorResponse, ErrorResponse } from '../response/error.response';

export class AdminController {
  userRole: CommonResponse;
  validEmail: CommonResponse;
  decodedToken: CommonResponse;

  async isValid(context: Context): Promise<ErrorResponse | true> {
    /**
     * Validate administrator role.
     */
    console.log('Check if user is valid admin--');

    this.userRole = await Middleware.checkAdministratorRole(
      context.req.headers
    );

    if (this.userRole.die) {
      return errorResponse(this.userRole.usermessage, this.userRole.dieCode);
    }

    return true;
  }

  getPPUrl() {
    const currentAgent: AgentByEmailResponse = this.userRole?.usermessage?.currentAgent;
    return process.env['KV_PP_URL'] + (currentAgent?.organisation ? "?org="+currentAgent?.organisation?.key : "");
  }

  /**
   * Check if user role Admin/User
   * @param context
   * @returns
   */
  async isValidUser(context: Context): Promise<ErrorResponse | true> {
    /**
     * Validate administrator role.
     */
    console.log('Check if user is valid--');

    this.userRole = await Middleware.checkUserRole(context.req.headers);

    if (this.userRole.die) {
      return errorResponse(this.userRole.usermessage, this.userRole.dieCode);
    }

    return true;
  }
  /**
   * Check if user role Admin/User
   * @param context
   * @returns
   */
  async isAdminOrUserRole(context: Context): Promise<ErrorResponse | true> {
    /**
     * Validate administrator role.
     */
    this.userRole = await Middleware.isAdminOrUserRole(context.req.headers);

    if (this.userRole.die) {
      return errorResponse(this.userRole.usermessage, this.userRole.dieCode);
    }

    return true;
  }
}
