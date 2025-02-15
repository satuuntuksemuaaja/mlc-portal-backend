import * as jwt from 'jsonwebtoken';
import { AgentRepository } from '../repository/agent.repository';
import { CommonResponse, commonResponse } from '../response/common.response';
import { AgentByEmailResponse } from '../interface/response/agent.response.interface';
import { AgentStatus } from '../model/enums/agent.enum';
import { RoleName } from '../model/enums/role.enum';
import { HttpRequestHeaders } from '@azure/functions';

export class Middleware {
  public static async getToken(authorization: string) {
    const parts = authorization?.split(' ');
    if (parts.length === 2) {
      const scheme = parts[0];
      const credentials = parts[1];

      if (/^Bearer$/i.test(scheme)) {
        console.log('Bearer Token found');

        return credentials;
      }
    }
    console.log('No authorization scheme found'); //TODO - return null here. update tests to add Bearer
    return authorization;
  }

  /**
   * Decode JWT token
   * @param headers
   * @returns
   */
  public static async decodeJWT(headers: HttpRequestHeaders) {
    // Getting jwt token from headers
    const token: string = await this.getToken(headers.authorization);

    if (!token) {
      console.log('Decode token - Invalid token');
      return await commonResponse(false, true, 403, {
        error: 'Invalid token'
      });
    }
    // Decode JWT token
    const decodedToken: any = await jwt.decode(token);
    return decodedToken;
  }
  /**
   * Middleware to check if user is Admin
   * @param headers
   * @returns
   */
  public static async checkAdministratorRole(
    headers: HttpRequestHeaders
  ): Promise<CommonResponse> {
    console.log('checkAdministratorRole start');
    try {
      // Getting jwt decoded token
      const decoded = await this.decodeJWT(headers);

      const agent: AgentByEmailResponse = await AgentRepository.getAgentByEmail(
        decoded.emails
      );
      if (!agent) {
        console.log('Check administrator role - user not found');
        return await commonResponse(false, true, 404, {
          error: 'user not found'
        });
      }
      // Checking if user is admin and active
      if (
        agent?.role?.name.toLowerCase() == RoleName.Administrator &&
        agent?.status?.toLowerCase() == AgentStatus.ACTIVE
      ) {
        console.log('Check user role - Success');
        return await commonResponse(true, false, null, {
          currentAgent: agent
        });
      } else {
        console.log(
          'Check administrator role - You are no authorized to access this event'
        );
        return await commonResponse(false, true, 403, {
          error: 'You are no authorized to access this event.'
        });
      }
    } catch (error) {
      console.log('Check administrator role - somthing went wrong');
      return await commonResponse(false, true, 500, { error: '1' });
    }
  }
  /**
   * Check valid user
   * @param headers
   * @returns
   */
  public static async checkUserRole(headers) {
    console.log('checkUserRole');
    try {
      // Getting jwt decoded token
      const decoded = await this.decodeJWT(headers);

      const agent: AgentByEmailResponse = await AgentRepository.getAgentByEmail(
        decoded.emails
      );
      if (!agent) {
        console.log('Check user role - user not found');
        return await commonResponse(false, true, 404, {
          error: 'user not found'
        });
      }
      // Checking if user is admin/user and active
      if (
        (agent?.role?.name.toLowerCase() == RoleName.User ||
          agent?.role?.name.toLowerCase() == RoleName.Administrator) &&
        agent?.status?.toLowerCase() == AgentStatus.ACTIVE
      ) {
        console.log('Check user role - Success');
        return await commonResponse(true, false, null, {
          currentAgent: agent
        });
      } else {
        console.log(
          'Check user role - You are no authorized to access this event'
        );
        return await commonResponse(false, true, 403, {
          error: 'You are no authorized to access this event.'
        });
      }
    } catch (error) {
      console.log('Check user role - somthing went wrong', error);
      return await commonResponse(false, true, 500, { error: '1' });
    }
  }
  /**
   * Check valid user
   * @param headers
   * @returns
   */
  public static async isAdminOrUserRole(headers) {
    console.log('isAdminOrUserRole method');
    try {
      // Getting jwt decoded token
      const decoded = await this.decodeJWT(headers);

      const agent: AgentByEmailResponse = await AgentRepository.getAgentByEmail(
        decoded.emails
      );
      if (!agent) {
        console.log('Check user role - user not found');
        return await commonResponse(false, true, 404, {
          error: 'user not found'
        });
      }
      // Checking if user is admin/user and active
      if (
        agent?.role?.name.toLowerCase() == RoleName.User ||
        agent?.role?.name.toLowerCase() == RoleName.Administrator
      ) {
        console.log('Check admin or user role - Success');
        return await commonResponse(true, false, null, {
          currentAgent: agent
        });
      } else {
        console.log(
          'Check user role - You are no authorized to access this event'
        );
        return await commonResponse(false, true, 403, {
          error: 'You are no authorized to access this event.'
        });
      }
    } catch (error) {
      console.log('Check user role - somthing went wrong', error);
      return await commonResponse(false, true, 500, { error: '1' });
    }
  }
}

const middleware: Middleware = new Middleware();
export default middleware;
