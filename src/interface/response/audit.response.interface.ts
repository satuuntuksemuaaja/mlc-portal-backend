export interface ClientAuditsResponse {
  action: string;
  details: string;
  time: Date;
  orgId: string;
}

export interface CreateAuditsResponse {
  id: number;
  orgId: string;
  agentId: string;
  clientId: string;
  action: string;
  details: string;
  time: Date;
}
