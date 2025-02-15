import { AgentByEmailResponse } from '../interface/response/agent.response.interface';

export interface UserMessage {
  error: string | object;
  Success: string;
  ipAddress: string;
  currentAgent: AgentByEmailResponse;
  decodedToken: object | any;
}

export interface CommonResponse {
  ok: boolean;
  die: boolean;
  dieCode: number;
  usermessage: Partial<UserMessage>;
}

export const OkResponse: CommonResponse = {
  ok: true,
  die: false,
  dieCode: 200,
  usermessage: { Success: 'Success' }
};

export const UnknownErrResponse: CommonResponse = {
  ok: false,
  die: true,
  dieCode: 500,
  usermessage: { error: '1' }
};

export const SystemDownResponse: CommonResponse = {
  ok: false,
  die: true,
  dieCode: 503,
  usermessage: { error: '1' }
};

export const AuthError401Response: CommonResponse = {
  ok: false,
  die: true,
  dieCode: 401,
  usermessage: { error: 'Authorisation Failure' }
};

export async function commonResponse(
  ok: boolean,
  die: boolean,
  dieCode: number,
  usermessage: Partial<UserMessage>
): Promise<CommonResponse> {
  return {
    ok,
    die,
    dieCode,
    usermessage
  };
}
