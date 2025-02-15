export interface ClientTermRequest {
  durationMonths: number;
  end: Date;
  start: Date;
  clientId: string;
  status: string;
  createdBy?: string;
}
