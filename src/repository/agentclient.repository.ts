import logger from '../logger/api.logger';
import { AgentClient } from '../model/agentclient.model';
import { Baserepository } from './base.repository';
import { Agent, Client, Organisation } from '../model';
import { col } from 'sequelize';
import { ClientStatus } from '../model/enums/client.enum';
import { Op } from 'sequelize';
import {
  AdminAgentAndClient,
  AgentClientResponse,
  getAdminAgentActiveClientList,
  getAdminClientActiveAgentList
} from '../interface/response/agentclient.response.interface';
import { errorResponse } from '../response/error.response';
import { getAgentClientList } from '../interface/response/agentclient.response.interface';
import { CreateAgentClientRequest } from '../interface/request/agentclient.request.interface';

export class AgentClientRepository extends Baserepository {
  /**
   * Role - Admin
   * Create agent client relation
   * @param requestParams
   * @returns
   */
  public static async adminCreateAgentClient(
    requestParams: CreateAgentClientRequest,
    transaction?
  ): Promise<AgentClientResponse> {
    try {
      const agentclientRepository = await Baserepository.getRepo(AgentClient);
      if (transaction) {
        const agentclient: AgentClientResponse =
          await agentclientRepository.create(
            {
              agentId: requestParams.agentId,
              clientId: requestParams.clientId
            },
            {
              transaction
            }
          );
        return agentclient;
      }
      const agentclient: AgentClientResponse =
        await agentclientRepository.create({
          agentId: requestParams.agentId,
          clientId: requestParams.clientId
        });
      return agentclient;
    } catch (error) {
      console.log(
        'Repository - create agnet client list catch block - ',
        error
      );
      logger.error('Error::' + error);
      throw error;
    }
  }
  /**
   * Role - Admin
   * Delete agent client reation
   * @param clientId
   * @param agentId
   * @returns
   */
  public static async adminDeleteAgentClient(
    clientId: string,
    agentId: string
  ): Promise<AdminAgentAndClient> {
    try {
      const agentclientRepository = await Baserepository.getRepo(AgentClient);
      const agentClientData: AdminAgentAndClient = await this.getAgentAndClient(
        agentId,
        clientId
      );

      if (agentClientData) {
        const clientRealtionCount = await agentclientRepository.count({
          where: {
            clientId: clientId
          }
        });
        if (clientRealtionCount <= 1) {
          throw errorResponse({}, 400);
        }
        await agentclientRepository.destroy({
          where: {
            clientId: clientId,
            agentId: agentId
          }
        });
        return agentClientData;
      } else {
        throw errorResponse(
          { message: 'Agent Client data does not exist.' },
          404
        );
      }
    } catch (error) {
      console.log(
        'Repository - delete agent client list catch block - ',
        error
      );
      logger.error('Error::' + error);
      throw error;
    }
  }
  /**
   * Role - Admin
   * Get list of active client for agent of admin organisation
   * @param agentId
   * @param orgId
   * @param archived
   * @returns
   */
  public static async getAdminAgentActiveClientList(
    agentId: string,
    orgId: string,
    archived: string
  ): Promise<getAdminAgentActiveClientList[]> {
    try {
      const where = {
        orgId: orgId,
        status: {
          [Op.in]: [
            ClientStatus.ACTIVE,
            ClientStatus.ARCHIVED,
            ClientStatus.CANCELLED,
            ClientStatus.PENDING
          ]
        }
      };
      if (archived == 'false') {
        where.status = { [Op.in]: [ClientStatus.ACTIVE] };
      }

      const agentclientRepository = await Baserepository.getRepo(AgentClient);
      const clientRepository = await Baserepository.getRepo(Client);

      const clients = await agentclientRepository.findAll({
        where: { agentId: agentId },
        attributes: [
          [col('client.id'), 'id'],
          [col('client.name'), 'name'],
          [col('client.email'), 'email'],
          [col('client.orgId'), 'orgId'],
          'created',
          'agentId'
        ],
        include: [
          {
            model: clientRepository,
            attributes: [],
            where: where,
            require: false
          }
        ],
        raw: true
      });
      return clients;
    } catch (error) {
      console.log(
        'Repository - get active client list for agent list catch block - ',
        error
      );
      logger.error('Error::' + error);
      throw error;
    }
  }
  /**
   * Role - Admin
   * Get list of active agent for client of admin organisation
   * @param clientId
   * @param orgId
   * @returns
   */
  public static async getAdminClientActiveAgentList(
    clientId: string,
    orgId: string
  ): Promise<getAdminClientActiveAgentList[]> {
    try {
      const agentclientRepository = await Baserepository.getRepo(AgentClient);
      const agentRepository = await Baserepository.getRepo(Agent);

      const agents: getAdminClientActiveAgentList[] =
        await agentclientRepository.findAll({
          where: { clientId: clientId },
          attributes: [
            [col('agent.id'), 'id'],
            [col('agent.name'), 'name'],
            [col('agent.email'), 'email'],
            [col('agent.orgId'), 'orgId'],
            'created'
          ],
          include: [
            {
              model: agentRepository,
              attributes: [],
              where: { orgId: orgId },
              require: false
            }
          ],
          raw: true
        });

      return agents;
    } catch (error) {
      console.log(
        'Repository - get active agent list for client list catch block - ',
        error
      );
      throw error;
    }
  }
  /**
   * Role - User
   * Get agent client list
   * @param agentId
   * @param orgId
   * @returns
   */
  public static async getAgentClientList(
    agentId: string,
    orgId: string
  ): Promise<getAgentClientList[]> {
    try {
      const agentclientRepository = await Baserepository.getRepo(AgentClient);
      const clientRepository = await Baserepository.getRepo(Client);

      const clients: getAgentClientList[] = await agentclientRepository.findAll(
        {
          where: { agentId: agentId },
          attributes: [
            [col('client.id'), 'id'],
            [col('client.name'), 'name'],
            [col('client.email'), 'email'],
            [col('client.orgId'), 'orgId']
          ],
          include: [
            {
              model: clientRepository,
              attributes: [],
              where: { orgId: orgId },
              require: false
            }
          ],
          raw: true
        }
      );

      return clients;
    } catch (error) {
      console.log(
        'Repository - client list for an agent catch block - ',
        error
      );
      logger.error('Error::' + error);
      throw error;
    }
  }
  /**
   * List of all agents belong to an client.
   * @param clientId
   * @returns
   */
  public static async getAgentForClient(clientId) {
    try {
      const agentclientRepository = await Baserepository.getRepo(AgentClient);
      const agentClients: AgentClient[] = await agentclientRepository.findAll({
        where: { clientId: clientId },
        attributes: ['agentId']
      });
      return agentClients;
    } catch (error) {
      console.log('Repository - get agent for an client catch block - ', error);
      throw error;
    }
  }
  /**
   * Get Agent and Client data on thier relation
   * @param agentId
   * @param clientId
   * @returns
   */
  public static async getAgentAndClient(agentId: string, clientId: string) {
    try {
      const agentclientRepository = await Baserepository.getRepo(AgentClient);
      const clientRepository = await Baserepository.getRepo(Client);
      const agentRepository = await Baserepository.getRepo(Agent);
      const organisationRepository = await Baserepository.getRepo(Organisation);

      const agentClientData = await agentclientRepository.findOne({
        where: {
          clientId: clientId,
          agentId: agentId
        },
        attributes: [
          [col('agent.name'), 'agentName'],
          [col('agent.email'), 'agentEmail'],
          [col('client.name'), 'clientName'],
          [col('client.email'), 'clientEmail'],
          [col('agent.organisation.name'), 'organisationName']
        ],
        include: [
          {
            model: clientRepository,
            attributes: [],
            require: false
          },
          {
            model: agentRepository,
            include: [{ model: organisationRepository, attributes: [] }],
            attributes: [],
            require: false
          }
        ],
        raw: true
      });
      return agentClientData;
    } catch (error) {
      console.log(
        'Repository - get agent client relation catch block - ',
        error
      );
      throw error;
    }
  }
  /**
   * Get Agent and Clients data on thier relation
   * @param clientId
   * @returns
   */
  public static async getAllClientsAgentRelation(clientIds: string[]) {
    try {
      const agentclientRepository = await Baserepository.getRepo(AgentClient);
      const clientRepository = await Baserepository.getRepo(Client);
      const agentRepository = await Baserepository.getRepo(Agent);
      const organisationRepository = await Baserepository.getRepo(Organisation);

      const clientsAgentData = await agentclientRepository.findOne({
        where: {
          clientId: { [Op.in]: [clientIds] }
        },
        attributes: [
          [col('agent.id'), 'agentId'],
          [col('agent.name'), 'agentName'],
          [col('agent.email'), 'agentEmail'],
          [col('client.id'), 'clientId'],
          [col('client.name'), 'clientName'],
          [col('client.email'), 'clientEmail'],
          [col('agent.organisation.name'), 'organisationName']
        ],
        include: [
          {
            model: clientRepository,
            attributes: [],
            require: false
          },
          {
            model: agentRepository,
            include: [{ model: organisationRepository, attributes: [] }],
            attributes: [],
            require: false
          }
        ],
        raw: true
      });
      return clientsAgentData;
    } catch (error) {
      console.log(
        'Repository - get agent client relation catch block - ',
        error
      );
      throw error;
    }
  }
}

const agentclientRepository: AgentClientRepository =
  new AgentClientRepository();
export default agentclientRepository;
