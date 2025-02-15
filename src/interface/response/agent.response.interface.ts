import { RoleResponse } from './role.response.interface';
import { AgentStatus } from '../../model/enums/agent.enum';
import { OrganisationResponse } from './organisation.response.interface';

export interface GetAgentsListResponse {
  id: string;
  name: string;
  email: string;
  status: AgentStatus;
  roleId: number;
  created: Date;
  orgId: string;
}

export interface CreateAgentResponse {
  id: string;
  name: string;
  email: string;
  status: AgentStatus;
  roleId: number;
  created: Date;
  phone: string;
}

export interface AgentResponse {
  id: string;
  name: string;
  email: string;
  status: AgentStatus;
  roleId: number;
  created: Date;
  phone: string;
}

export interface AgentThumbResponse {
  id: string;
  photo: string | null;
}

export interface AgentByEmailResponse {
  id?: string;
  roleId?: string;
  orgId?: string;
  name?: string;
  email?: string;
  status?: string;
  photo?: string;
  role?: RoleResponse;
  organisation?: OrganisationResponse;
}

export interface GetAgentResponse {
  me: {
    email: string;
    name: string;
    role: string;
    phone: string;
  };
  org: {
    name: string;
    key: string | null;
  };
}

export interface GetAgentPhoto {
  photo: string;
}
