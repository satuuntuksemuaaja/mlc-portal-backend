import { Op } from 'sequelize';
import { ClientTermRequest } from '../interface/request/clientterm.request.interface';
import {
  ActiveClientSubscription,
  AdminClientSubscriptionHistoryResponse
} from '../interface/response/clientterm.response.interface';
import logger from '../logger/api.logger';
import { Client, ClientTerm, Organisation } from '../model';
import { ClientStatus } from '../model/enums/client.enum';
import { ClientTermStatus } from '../model/enums/clientterm.enum';
import { Baserepository } from './base.repository';

export class ClientTermRepository extends Baserepository {
  /**
   * Role - Admin
   * Get client subscription history
   * @param clientId
   * @returns
   */
  public static async adminClientsubscriptionHistory(
    clientId: string
  ): Promise<AdminClientSubscriptionHistoryResponse> {
    try {
      const clientTermRepository = await Baserepository.getRepo(ClientTerm);

      const subscriptionhistory = await clientTermRepository.findAll({
        where: {
          clientId: clientId
        },
        attributtes: [
          'id',
          'start',
          'end',
          'status',
          'durationMonths',
          'createdBy',
          'created'
        ],
        raw: true
      });
      return {
        clientId,
        subscriptionhistory
      };
    } catch (error) {
      console.log(
        'Repository - client subscription history catch block - ',
        error
      );
      logger.error('Error::' + error);
      throw error;
    }
  }
  public static async activeClientSubscription(): Promise<
    ActiveClientSubscription[]
  > {
    try {
      const clientTermRepository = await Baserepository.getRepo(ClientTerm);
      const clientRepository = await Baserepository.getRepo(Client);
      const organisationRepository = await Baserepository.getRepo(Organisation);

      const dateTwoHourAfter = new Date();
      dateTwoHourAfter.setHours(dateTwoHourAfter.getHours() + 2);

      return await clientTermRepository.findAll({
        where: {
          end: {
            [Op.lt]: dateTwoHourAfter
          },
          status: ClientTermStatus.ACTIVE
        },
        include: [
          {
            model: clientRepository,
            where: {
              status: ClientStatus.ACTIVE
            },
            attributes: ['id', 'email'],
            include: [
              { model: organisationRepository, attributes: ['name', 'key'] }
            ]
          }
        ],
        attributes: ['id', 'clientId']
      });
    } catch (error) {
      console.log(
        'Repository - client subscription check catch block - ',
        error
      );
      throw error;
    }
  }
  public static async createSubscription(clientObj: ClientTermRequest[]) {
    try {
      const clientTermRepository = await Baserepository.getRepo(ClientTerm);

      await clientTermRepository.bulkCreate(clientObj);
    } catch (error) {
      console.log(
        'Repository - client subscription create catch block - ',
        error
      );
      throw error;
    }
  }

  public static async expireSubscription(subscriptionIds: string[]) {
    try {
      const clientTermRepository = await Baserepository.getRepo(ClientTerm);
      await clientTermRepository.update(
        {
          status: ClientTermStatus.EXPIRED
        },
        { where: { id: { [Op.in]: subscriptionIds } } }
      );
    } catch (error) {
      console.log(
        'Repository - client subscription update catch block - ',
        error
      );
      throw error;
    }
  }

  public static async activeSubcriptionCheckForClient(
    clientId: string
  ): Promise<ActiveClientSubscription> {
    try {
      const clientTermRepository = await Baserepository.getRepo(ClientTerm);
      const clientRepository = await Baserepository.getRepo(Client);
      const organisationRepository = await Baserepository.getRepo(Organisation);

      return await clientTermRepository.findOne({
        where: {
          clientId: clientId,
          status: ClientTermStatus.ACTIVE
        },
        include: [
          {
            model: clientRepository,
            where: {
              status: ClientStatus.ACTIVE
            },
            attributes: ['id', 'email'],
            include: [
              { model: organisationRepository, attributes: ['name', 'key'] }
            ]
          }
        ],
        attributes: ['id', 'clientId']
      });
    } catch (error) {
      console.log(
        'Repository - client subscription check for client catch block - ',
        error
      );
      throw error;
    }
  }
  public static async archivedClientSubscripton() {
    try {
      const clientTermRepository = await Baserepository.getRepo(ClientTerm);
      const clientRepository = await Baserepository.getRepo(Client);
      return await clientTermRepository.findAll({
        where: {
          end: {
            [Op.lt]: new Date()
          },
          status: ClientTermStatus.ACTIVE
        },
        include: [
          {
            model: clientRepository,
            where: {
              status: ClientStatus.ARCHIVED
            }
          }
        ],
        attributes: ['id', 'clientId']
      });
    } catch (error) {
      console.log(
        'Repository - archived client subscription catch block - ',
        error
      );
      throw error;
    }
  }
}

const clientTermRepository: ClientTermRepository = new ClientTermRepository();
export default clientTermRepository;
