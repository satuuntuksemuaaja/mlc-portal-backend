import { Context } from '@azure/functions';
import { AgentByEmailResponse } from '../../interface/response/agent.response.interface';
import { UnreadmessageRepository } from '../../repository/unreadmessage.repository';
import { AdminController } from '../admin.controller';

export class GetUnreadMessageController extends AdminController {
  context: Context;

  constructor(context: Context) {
    super();
    this.context = context;
  }

  async run(): Promise<object> {
    /**
     * Validate Admin
     */
    const res = await super.isValidUser(this.context);
    if (res === true) {
      try {
        const currentAgent: AgentByEmailResponse =
          this.userRole?.usermessage?.currentAgent;
        console.log('Getting unread message');
        return UnreadmessageRepository.getUnreadMessages(currentAgent);
      } catch (error) {
        console.log('Controller - create agent catch block', error);
        throw error;
      }
    } else {
      throw res;
    }
  }
}
