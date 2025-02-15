import { CreateUnreadMessagesRequest } from '../interface/request/unreadmessages.request.interfase';
import { AgentByEmailResponse } from '../interface/response/agent.response.interface';
import { UnreadMessages } from '../model';
import { Baserepository } from './base.repository';

export class UnreadmessageRepository extends Baserepository {
  public static async createUnreadMessages(
    createUnreadMessages: CreateUnreadMessagesRequest[]
  ): Promise<object> {
    try {
      const unreadMessageRepository = await Baserepository.getRepo(
        UnreadMessages
      );

      const unreadMessages = await unreadMessageRepository.bulkCreate(
        createUnreadMessages
      );
      return unreadMessages;
    } catch (error) {
      console.log('Repository - get unread feeds catch block - ', error);
      throw error;
    }
  }
  /**
   * Role - User
   * Get list of all unread feeds
   * @returns
   */
  public static async getUnreadMessages(
    currentAgent: AgentByEmailResponse
  ): Promise<object> {
    try {
      const unreadMessageRepository = await Baserepository.getRepo(
        UnreadMessages
      );

      const unreadMessages = await unreadMessageRepository.findAll({
        where: {
          agentId: currentAgent?.id
        }
      });
      return unreadMessages;
    } catch (error) {
      console.log('Repository - get unread feeds catch block - ', error);
      throw error;
    }
  }
  public static async updateMessageAsRead(messageId: string) {
    try {
      console.log(messageId, '--------------messageId');

      const unreadMessageRepository = await Baserepository.getRepo(
        UnreadMessages
      );
      return await unreadMessageRepository.destroy({
        where: { messageId: messageId }
      });
    } catch (error) {
      console.log('Repository - Put message as read catch block - ', error);
      throw error;
    }
  }

  public static async updateMessageAsReadByClientId(clientId: string) {
    try {
      const unreadMessageRepository = await Baserepository.getRepo(
        UnreadMessages
      );
      return await unreadMessageRepository.destroy({
        where: { clientId: clientId }
      });
    } catch (error) {
      console.log(
        'Repository - Put message as read by clientId catch block - ',
        error
      );
      throw error;
    }
  }
}

const unreadmessageRepository: UnreadmessageRepository =
  new UnreadmessageRepository();
export default unreadmessageRepository;
