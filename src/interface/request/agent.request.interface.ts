export interface CreateAgentRequest {
  roleId: string;
  name: string;
  emailPrefix: string;
  phone: string;
}

export interface AdminUpdateAgentRequest {
  id: string;
  name: string;
  roleId: number;
  phone: string;
}

export interface UpdateAgentThumbAgentRequest {
  id: string;
  thumb: string;
}

export interface UpdateAgentRequest {
  name: string;
  phone: string;
}

export interface UpdateAgentPhotoRequest {
  thumb: string;
}
