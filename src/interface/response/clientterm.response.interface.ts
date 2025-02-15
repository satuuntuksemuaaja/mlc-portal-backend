import { ClientTermStatus } from '../../model/enums/clientterm.enum';

export interface ActiveClientSubscription {
  id: string;
  clientId: string;
  client: {
    id: string;
    email: string;
    organisation: {
      name: string;
      key: string;
    };
  };
}

export interface AdminClientSubscriptionHistoryResponse {
  clientId: string;
  subscriptionhistory: [
    {
      id: string;
      clientId: string;
      start: Date;
      end: Date;
      durationMonths: 12;
      createdBy: null;
      status: ClientTermStatus;
      created: Date;
    }
  ];
}
