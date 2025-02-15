export interface AgentClientResponse {
  id: string;
  agentId: string;
  clientId: string;
  created: Date;
  lastModified: Date;
}

export interface getAdminClientActiveAgentList {
  id: string;
  name: string;
  email: string;
  orgId: string;
}

export interface getAdminAgentActiveClientList {
  id: string;
  name: string;
  email: string;
}

export interface AdminAgentAndClient {
  agentName: string;
  agentEmail: string;
  clientName: string;
  clientEmail: string;
  organisationName: string;
}

export interface getAgentClientList {
  id: string;
  name: string;
  email: string;
  orgId: string;
}
