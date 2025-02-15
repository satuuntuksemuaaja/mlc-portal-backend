export interface CreateActivitiesRequest {
  title: string;
  name: string;
  message: string;
  clientId: string;
  section: string;
  agentId: string;
  created?: Date;
}
