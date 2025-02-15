export interface exportClientWhere {
  orgId: string;
  created?: object;
}

export interface exportAgentWhere {
  orgId: string;
  created?: object;
}

export interface exportSubscriptionsWhere {
  created?: object;
}

export interface exportAuditWhere {
  orgId: string;
  time?: object;
}

export interface exportAgentClientsWhere {
  created?: object;
}
