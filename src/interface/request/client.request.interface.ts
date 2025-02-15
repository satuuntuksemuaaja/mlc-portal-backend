export interface UpdateClientRequest {
  name: string;
  ref: string;
  notes: string;
  id: string;
  phone: string;
}

export interface CreateClientRequest {
  name: string;
  ref: string;
  notes: string;
  email: string;
  phone: string;
  invitationId: string;
  invitationExpiry: Date;
}
