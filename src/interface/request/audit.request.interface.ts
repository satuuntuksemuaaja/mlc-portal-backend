export interface CreateAuditRequest {
  orgId: string | null;
  agentId: string | null;
  clientId: string | null;
  action: string;
  details: string;
  time: Date;
}

export interface AdminUpdateAgentRequest {
  id: string;
  name: string;
  roleId: number;
}

export interface UpdateAgentThumbAgentRequest {
  id: string;
  thumb: string;
}
