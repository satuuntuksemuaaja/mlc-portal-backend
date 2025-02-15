export interface Activities {
  title: string;
  name: string;
  message: string;
  clientId: string;
  section: string;
  agentId: string;
  read: boolean;
  created: string;
}

export interface ActivitiesList {
  total: number;
  activities: Activities[];
}
