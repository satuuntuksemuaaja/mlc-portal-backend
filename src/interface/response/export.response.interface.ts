import { AgentStatus } from '../../model/enums/agent.enum';
import { ClientStatus } from '../../model/enums/client.enum';

export interface ExportClientRespons {
  report: 'clients';
  content: {
    name: string;
    email: string;
    status: ClientStatus;
    created: Date;
    lastModified: Date;
    orgId: string;
  };
}

export interface ExportAgentResponse {
  report: 'agents';
  content: {
    name: string;
    email: string;
    status: AgentStatus;
    created: Date;
    lastModified: Date;
    orgId: string;
  };
}

export interface ExportSubscriptionsResponse {
  report: 'subscriptions';
  content: {
    name: string;
    email: string;
    start: Date;
    end: Date;
    durationMonths: string;
    orgId: string;
  };
}

export interface ExportAuditResponse {
  report: 'audit';
  content: {
    agent: string;
    agentemail: string;
    client: string;
    clientemail: string;
    action: string;
    details: string;
    time: Date;
    orgId: string;
  };
}

export interface ExportAgentClientsResponse {
  report: 'agentclients';
  content: {
    agent: string;
    agentemail: string;
    client: string;
    clientemail: string;
    created: Date;
    orgId: string;
  };
}
