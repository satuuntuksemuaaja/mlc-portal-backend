export interface MessageRequest {
  message: string;
  type: string;
  new: boolean;
  sent: Date;
  owner: number;
}
