import { ClientStatus } from '../../model/enums/client.enum';
import { Transaction } from 'sequelize/types';

export interface ClientResponse {
  id: string;
  name: string;
  email: string;
  status: ClientStatus;
  created: Date;
  phone: string;
  agents: [];
  orgId: string;
}

export interface GetClientResponse {
  active?: {
    id: string;
    name: string;
    email: string;
    status: ClientStatus;
    ref: string;
    notes: string;
    phone: string;
    created: Date;
    orgId: string;
  };
  archived?: {
    id: string;
    name: string;
    email: string;
    status: ClientStatus;
    ref: string;
    notes: string;
    phone: string;
    created: Date;
    orgId: string;
  };
  cancelled?: {
    id: string;
    name: string;
    email: string;
    status: ClientStatus;
    ref: string;
    notes: string;
    phone: string;
    created: Date;
    orgId: string;
  };
  pending?: {
    id: string;
    name: string;
    email: string;
    status: ClientStatus;
    ref: string;
    notes: string;
    phone: string;
    created: Date;
    orgId: string;
    invitationExpiry: Date;
  };
}

export interface ClientByIdResponse {
  id: string;
  name: string;
  email: string;
  status: ClientStatus;
  ref: string;
  notes: string;
  phone: string;
  invitationId: string;
  meecoConnectionId: string;
  meecoUserId: string;
}

export interface ClientPhotoResponse {
  photo: string;
}

export interface CreateClientResponse {
  data: {
    id: string;
    name: string;
    email: string;
    status: ClientStatus;
    ref: string;
    notes: string;
    phone: string;
    invitationId: string;
    invitationExpiry: Date;
  };
  transaction: Transaction;
}
export interface UserClientResponse {
  id: string;
  name: string;
  email: string;
  status: ClientStatus;
  ref: string;
  notes: string;
  phone: string;
  invitationId: string;
  invitationExpiry: Date;
}

export interface ClientByEmailResponse {
  id: string;
  name: string;
  email: string;
  status: ClientStatus;
  created: Date;
  orgId: string;
  phone: string;
  meecoUserId: string;
  meecoConnectionId: string;
  invitationId: string;
  invitationExpiry: Date;
  organisation: {
    name: string;
  };
}

export interface ExpiredClient {
  id: string;
  name: string;
  email: string;
  status: ClientStatus;
  created: Date;
  phone: string;
  orgId: string;
  invitationId: string;
  invitationExpiry: Date;
}
