import { v4 as uuidv4 } from 'uuid';
import logger from '../logger/api.logger';
import { Client } from '../model/client.model';
import { readFileSync } from 'fs';
import { Baserepository } from './base.repository';
import {
  CreateClientRequest,
  UpdateClientRequest
} from '../interface/request/client.request.interface';
import { AuditRepository } from './audit.repository';
import { ClientStatus } from '../model/enums/client.enum';
import { AgentClientRepository } from './agentclient.repository';
import {
  ClientByEmailResponse,
  ClientByIdResponse,
  ClientPhotoResponse,
  ClientResponse,
  CreateClientResponse,
  ExpiredClient,
  GetClientResponse,
  UserClientResponse
} from '../interface/response/client.response.interface';
import { AgentByEmailResponse } from '../interface/response/agent.response.interface';
import { errorResponse } from '../response/error.response';
import { Op } from 'sequelize';
import { Organisation } from '../model';
import { InvitationAcceptedRequest } from '../interface/request/bff.request.interface';
import { AirBrake } from '../util/airbrake';
import { Sequelize } from 'sequelize-typescript';

export class ClientRepository extends Baserepository {
  /**
   * Role - User
   * Get list of all clients - active, archived, cancelled of user organisation
   * @param orgId
   * @returns
   */
  public static async getClients(
    orgId,
    clientId: string[]
  ): Promise<GetClientResponse> {
    try {
      const clientRepository = await Baserepository.getRepo(Client);
      const activeClients = await clientRepository.findAll({
        where: {
          status: ClientStatus.ACTIVE,
          id: { [Op.in]: clientId },
          orgId: orgId
        },
        attributes: [
          'name',
          'email',
          'id',
          'status',
          'ref',
          'notes',
          'phone',
          'created',
          'orgId'
        ],
        order: [['name', 'ASC']],
        raw: true
      });
      const archiveClients = await clientRepository.findAll({
        where: {
          status: ClientStatus.ARCHIVED,
          id: { [Op.in]: clientId },
          orgId: orgId
        },
        attributes: [
          'name',
          'email',
          'id',
          'status',
          'ref',
          'notes',
          'phone',
          'created',
          'orgId'
        ],
        order: [['name', 'ASC']],
        raw: true
      });
      const cancelledclients = await clientRepository.findAll({
        where: {
          status: ClientStatus.CANCELLED,
          id: { [Op.in]: clientId },
          orgId: orgId
        },
        attributes: [
          'name',
          'email',
          'id',
          'status',
          'ref',
          'notes',
          'phone',
          'created',
          'orgId'
        ],
        order: [['name', 'ASC']],
        raw: true
      });
      const pendingclients = await clientRepository.findAll({
        where: {
          status: ClientStatus.PENDING,
          id: { [Op.in]: clientId },
          orgId: orgId
        },
        attributes: [
          'name',
          'email',
          'id',
          'status',
          'ref',
          'notes',
          'phone',
          'created',
          'orgId',
          'invitationExpiry'
        ],
        order: [['name', 'ASC']],
        raw: true
      });

      return {
        active: activeClients,
        archived: archiveClients,
        cancelled: cancelledclients,
        pending: pendingclients
      };
    } catch (error) {
      console.log('Repository - get clients catch block - ', error);
      logger.error('Error::' + error);
      throw error;
    }
  }
  /**
   * Role - User
   * Get list of active clients of user organisation
   * @param orgId
   * @returns
   */
  public static async getActiveClients(
    orgId,
    clientId: string[]
  ): Promise<GetClientResponse> {
    try {
      const clientRepository = await Baserepository.getRepo(Client);

      const clients = await clientRepository.findAll({
        where: {
          status: ClientStatus.ACTIVE,
          id: { [Op.in]: clientId },
          orgId: orgId
        },
        attributes: [
          'name',
          'email',
          'id',
          'status',
          'ref',
          'notes',
          'phone',
          'created',
          'orgId'
        ],
        order: [['name', 'ASC']]
      });
      const pendingclients = await clientRepository.findAll({
        where: {
          status: ClientStatus.PENDING,
          id: { [Op.in]: clientId },
          orgId: orgId
        },
        attributes: [
          'name',
          'email',
          'id',
          'status',
          'ref',
          'notes',
          'phone',
          'created',
          'orgId',
          'invitationExpiry'
        ],
        order: [['name', 'ASC']]
      });
      return { active: clients, pending: pendingclients };
    } catch (error) {
      console.log('Repository - get active clients catch block - ', error);
      logger.error('Error::' + error);
      throw error;
    }
  }
  /**
   * Role - User
   * Get client by id of user organisation
   * @param clientId
   * @param orgId
   * @returns
   */
  public static async getClientById(
    clientId: string,
    orgId: string
  ): Promise<ClientByIdResponse> {
    try {
      const clientRepository = await Baserepository.getRepo(Client);

      const clients: ClientByIdResponse = await clientRepository.findOne({
        where: { id: clientId, orgId: orgId },
        attributes: [
          'name',
          'email',
          'id',
          'ref',
          'status',
          'notes',
          'phone',
          'invitationId',
          'invitationExpiry',
          'meecoConnectionId',
          'meecoUserId'
        ]
      });
      return clients;
    } catch (error) {
      console.log('Repository - get client by id catch block - ', error);
      logger.error('Error::' + error);
      throw error;
    }
  }

  // /**
  //  * Role - User
  //  * Get client photo
  //  * @returns
  //  */
  public static async getClientPhoto(): Promise<ClientPhotoResponse> {
    try {
      console.log('getClientPhoto--------------');
      const photo: string = readFileSync(
        './src/images/clientImage.png',
        'base64'
      );
      return { photo };
    } catch (error) {
      console.log('Repository - get client photo catch block - ', error);
      logger.error('Error::' + error);
      throw error;
    }
  }

  /**
   * Role - User
   * Create client
   * @param client
   * @returns
   */
  public static async createClient(
    currentAgent: AgentByEmailResponse,
    client: CreateClientRequest
  ): Promise<CreateClientResponse> {
    const transaction = await Baserepository.getTransaction();
    try {
      const clientRepository = await Baserepository.getRepo(Client);
      const isClientExist = await clientRepository.findOne({
        where: {
          orgId: currentAgent.orgId,
          email: client.email
        }
      });
      if (isClientExist) {
        throw errorResponse(
          {
            error: '1',
            message: 'Client already exists'
          },
          409
        );
      }
      const data: UserClientResponse = await clientRepository.create(
        {
          id: uuidv4(),
          name: client?.name,
          orgId: currentAgent?.orgId,
          ref: client?.ref,
          notes: client?.notes,
          email: client?.email,
          status: ClientStatus.PENDING,
          phone: client?.phone,
          invitationId: client.invitationId,
          invitationExpiry: client.invitationExpiry
        },
        { transaction }
      );
      return { data, transaction };
    } catch (error) {
      console.log('Repository - create client catch block - ', error);
      logger.error('Error::' + error);
      transaction.rollback();
      throw error;
    }
  }
  /**
   * Role - User
   * re Invite cancelled Client
   * @param client
   * @returns
   */
  public static async reInviteClient(
    currentAgent: AgentByEmailResponse,
    client: ClientByIdResponse,
    invitationId: string,
    invitationExpiry: Date,
  ): Promise<CreateClientResponse> {
    const transaction = await Baserepository.getTransaction();
   
    try {
      console.log("Load Repo");
      const clientRepository = await Baserepository.getRepo(Client);
      
      console.log("Reload Client");
      const existingClient = await clientRepository.findOne({
        where: {
          orgId: currentAgent.orgId,
          email: client.email
        }
      });

      console.log("Update Invitation Id, Expiry and Status");
      const data: UserClientResponse = await clientRepository.update(
        {
          invitationId: invitationId,
          invitationExpiry: invitationExpiry,
          status: ClientStatus.PENDING
        },
        { 
          where: {
            orgId: currentAgent.orgId,
            id: client.id
          },
          transaction: transaction
        }
      );
      return { data, transaction };
    } catch (error) {
      console.log('Repository - create client catch block - ', error);
      logger.error('Error::' + error);
      transaction.rollback();
      throw error;
    }
  }


  /**
   * Role - User
   * Update client all client details
   * @param clientId
   * @param client
   * @returns
   */
  public static async updateClient(
    currentAgent: AgentByEmailResponse,
    clientBody: UpdateClientRequest
  ): Promise<UserClientResponse> {
    try {
      const clientRepository = await Baserepository.getRepo(Client);
      const client = await clientRepository.findOne({
        where: { orgId: currentAgent.orgId, id: clientBody?.id }
      });
      if (!client) {
        throw errorResponse(
          {
            message: 'You are not authorised to update this user.'
          },
          403
        );
      }
      const updatedClient = await clientRepository.update(
        {
          name: clientBody.name,
          notes: clientBody.notes,
          ref: clientBody.ref,
          phone: clientBody?.phone
        },
        {
          where: {
            id: clientBody?.id,
            orgId: currentAgent.orgId
          }
        }
      );
      if (updatedClient[0] === 1) {
        const clientData = await clientRepository.findOne({
          where: { id: clientBody?.id, orgId: currentAgent.orgId },
          attributes: ['id', 'name', 'email', 'status', 'phone', 'created'],
          raw: true
        });
        const agents = await AgentClientRepository.getAgentForClient(
          clientData?.id
        );
        clientData.agents = agents.map(({ agentId }) => agentId);
        return clientData;
      } else {
        throw 'Somthing went wrong.';
      }
    } catch (error) {
      console.log('Repository - update client catch block - ', error);
      logger.error('Error::' + error);
      throw error;
    }
  }
  /**
   * Role - User
   * Archive agent from active/cancelled/pending
   * @param clientId
   * @returns
   */
  public static async archiveClient(
    currentAgent: AgentByEmailResponse,
    clientId: string
  ): Promise<UserClientResponse> {
    try {
      const clientRepository = await Baserepository.getRepo(Client);
      const client = await clientRepository.findOne({
        where: { orgId: currentAgent.orgId, id: clientId }
      });
      if (!client) {
        throw errorResponse(
          {
            message: 'You are not authorised to update this user.'
          },
          403
        );
      }
      const updatedClient = await clientRepository.update(
        { status: ClientStatus.ARCHIVED },
        {
          where: {
            id: clientId,
            orgId: currentAgent.orgId
          }
        }
      );
      if (updatedClient[0] === 1) {
        const clientData = await clientRepository.findOne({
          where: {
            orgId: currentAgent.orgId,
            id: clientId
          },
          attributes: [
            'id',
            'name',
            'email',
            'status',
            'ref',
            'notes',
            'phone'
          ],
          raw: true
        });
        return clientData;
      } else {
        throw 'Somthing went wrong.';
      }
    } catch (error) {
      console.log('Repository - archived an client catch block - ', error);
      logger.error('Error::' + error);
      throw error;
    }
  }
  /**
   * Role - User
   * Cancelled client from active/archive/pending
   * @param clientId
   * @returns
   */
  public static async cancelClient(
    currentAgent: AgentByEmailResponse,
    clientId: string
  ): Promise<UserClientResponse> {
    try {
      const clientRepository = await Baserepository.getRepo(Client);
      const client = await clientRepository.findOne({
        where: { orgId: currentAgent.orgId, id: clientId }
      });
      if (!client) {
        throw errorResponse(
          {
            message: 'You are not authorised to update this user.'
          },
          403
        );
      }
      const updatedClient = await clientRepository.update(
        { status: ClientStatus.CANCELLED },
        {
          where: {
            orgId: currentAgent?.orgId,
            id: clientId
          }
        }
      );
      if (updatedClient[0] === 1) {
        const clientData = await clientRepository.findOne({
          where: {
            orgId: currentAgent?.orgId,
            id: clientId
          },
          attributes: [
            'id',
            'name',
            'email',
            'status',
            'ref',
            'notes',
            'phone'
          ],
          raw: true
        });
        return clientData;
      } else {
        throw 'Somthing went wrong.';
      }
    } catch (error) {
      console.log('Repository - cancelled an client catch block - ', error);
      logger.error('Error::' + error);
      throw error;
    }
  }

  /**
   * Role - Admin
   * Get list of clients for the organisation
   * @param orgId
   * @returns
   */
  public static async getAdminAllClientsList(
    orgId: string
  ): Promise<ClientResponse> {
    try {
      const clientRepository = await Baserepository.getRepo(Client);
      const clients = await clientRepository.findAll({
        where: { orgId: orgId },
        attributes: [
          'name',
          'email',
          'id',
          'status',
          'phone',
          'created',
          'notes',
          'ref',
          'orgId'
        ],
        order: [['name', 'ASC']]
      });
      return clients;
    } catch (error) {
      console.log(
        'Repository - get admin all clients client list catch block - ',
        error
      );
      logger.error('Error::' + error);
      throw error;
    }
  }

  /**
   * Role - Admin
   * Get list of client with status active of admin organisation
   * @param orgId
   * @returns
   */
  public static async getAdminActiveClientsList(
    orgId: string,
    pending: boolean
  ): Promise<ClientResponse> {
    try {
      const clientRepository = await Baserepository.getRepo(Client);
      const activeClients = await clientRepository.findAll({
        where: { orgId: orgId, status: ClientStatus.ACTIVE },
        attributes: [
          'name',
          'email',
          'id',
          'status',
          'phone',
          'created',
          'notes',
          'ref',
          'orgId'
        ],
        order: [['name', 'ASC']]
      });
      if (pending) {
        const pendingClients = await clientRepository.findAll({
          where: { orgId: orgId, status: ClientStatus.PENDING },
          attributes: [
            'name',
            'email',
            'id',
            'status',
            'phone',
            'created',
            'orgId',
            'invitationExpiry'
          ],
          order: [['name', 'ASC']]
        });
        const clients = activeClients.concat(pendingClients);
        return clients;
      } else {
        const clients = activeClients.concat([]);
        return clients;
      }
    } catch (error) {
      console.log(
        'Repository - get admin active clients client list catch block - ',
        error
      );
      logger.error('Error::' + error);
      throw error;
    }
  }
  /**
   * Role - Admin
   * Get list of client with status archive of admin organisation
   * @param orgId
   * @returns
   */
  public static async getAdminArchiveClientsList(
    orgId: string
  ): Promise<ClientResponse> {
    try {
      const clientRepository = await Baserepository.getRepo(Client);

      const clients = await clientRepository.findAll({
        where: { orgId: orgId, status: ClientStatus.ARCHIVED },
        attributes: [
          'name',
          'email',
          'id',
          'status',
          'phone',
          'created',
          'orgId'
        ],
        order: [['name', 'ASC']]
      });
      return clients;
    } catch (error) {
      console.log(
        'Repository - get admin archive clients list catch block - ',
        error
      );
      logger.error('Error::' + error);
      throw error;
    }
  }
  /**
   * Role - Admin
   * Get list of client with status pending of admin organisation
   * @param orgId
   * @returns
   */
  public static async getAdminPendingClientsList(
    orgId: string
  ): Promise<ClientResponse> {
    try {
      const clientRepository = await Baserepository.getRepo(Client);

      const clients = await clientRepository.findAll({
        where: { orgId: orgId, status: ClientStatus.PENDING },
        attributes: [
          'name',
          'email',
          'id',
          'status',
          'phone',
          'created',
          'orgId'
        ],
        order: [['name', 'ASC']]
      });
      return clients;
    } catch (error) {
      console.log(
        'Repository - get admin pending clients list catch block - ',
        error
      );
      logger.error('Error::' + error);
      throw error;
    }
  }
  /**
   * Role - Admin
   * Get list of client with status cancel of admin organisation
   * @param orgId
   * @returns
   */
  public static async getAdminCancelledClientsList(
    orgId: string
  ): Promise<ClientResponse> {
    try {
      const clientRepository = await Baserepository.getRepo(Client);

      const clients = await clientRepository.findAll({
        where: { orgId: orgId, status: ClientStatus.CANCELLED },
        attributes: [
          'name',
          'email',
          'id',
          'status',
          'phone',
          'created',
          'orgId'
        ],
        order: [['name', 'ASC']]
      });
      return clients;
    } catch (error) {
      console.log(
        'Repository - get admin cancelled clients list catch block - ',
        error
      );
      logger.error('Error::' + error);
      throw error;
    }
  }
  /**
   * Role - Admin
   * Archive client from active/cancelled/pending
   * @param clientId
   * @returns
   */
  public static async adminPutClientToArchive(
    currentAgent: AgentByEmailResponse,
    clientId: string
  ): Promise<ClientResponse> {
    try {
      const clientRepository = await Baserepository.getRepo(Client);
      const client = await clientRepository.findOne({
        where: { orgId: currentAgent.orgId, id: clientId }
      });
      if (!client) {
        throw errorResponse(
          {
            message: 'You are not authorised to update this user.'
          },
          403
        );
      }
      const updatedClient = await clientRepository.update(
        { status: ClientStatus.ARCHIVED },
        {
          where: {
            orgId: currentAgent.orgId,
            id: clientId
          }
        }
      );
      if (updatedClient[0] === 1) {
        const auditData = {
          orgId: currentAgent.orgId,
          agentId: currentAgent.id,
          clientId: clientId,
          action: 'Client Status Update',
          details: `Archived with id ${clientId}`,
          time: new Date()
        };
        await AuditRepository.createAudit(auditData);
        const clientData = await clientRepository.findOne({
          where: {
            orgId: currentAgent.orgId,
            id: clientId
          },
          attributes: ['id', 'name', 'email', 'status', 'phone', 'created'],
          raw: true
        });
        const agents = await AgentClientRepository.getAgentForClient(clientId);
        clientData.agents = agents.map(({ agentId }) => agentId);
        return clientData;
      } else {
        throw 'Somthing went wrong.';
      }
    } catch (error) {
      console.log('Repository - Archive an client catch block - ', error);
      logger.error('Error::' + error);
      throw error;
    }
  }
  /**
   * Role - Admin
   * Cancelled from active/archived/pending
   * @param clientId
   * @returns
   */
  public static async adminPutClientToCancel(
    currentAgent: AgentByEmailResponse,
    clientId: string
  ): Promise<ClientResponse> {
    try {
      const clientRepository = await Baserepository.getRepo(Client);
      const client = await clientRepository.findOne({
        where: { orgId: currentAgent.orgId, id: clientId }
      });
      if (!client) {
        throw errorResponse(
          {
            message: 'You are not authorised to update this user.'
          },
          403
        );
      }
      const updatedClient = await clientRepository.update(
        { status: ClientStatus.CANCELLED },
        {
          where: {
            orgId: currentAgent.orgId,
            id: clientId
          }
        }
      );
      if (updatedClient[0] === 1) {
        const auditData = {
          orgId: currentAgent.orgId,
          agentId: currentAgent.id,
          clientId: clientId,
          action: 'Client Status Update',
          details: `Cancelled with id ${clientId}`,
          time: new Date()
        };
        await AuditRepository.createAudit(auditData);
        const clientData = await clientRepository.findOne({
          where: {
            orgId: currentAgent.orgId,
            id: clientId
          },
          attributes: ['id', 'name', 'email', 'status', 'phone', 'created'],
          raw: true
        });
        const agents = await AgentClientRepository.getAgentForClient(clientId);
        clientData.agents = agents.map(({ agentId }) => agentId);
        return clientData;
      } else {
        throw 'Somthing went wrong.';
      }
    } catch (error) {
      console.log('Repository - Cancelled an client catch block - ', error);
      logger.error('Error::' + error);
      throw error;
    }
  }
  /**
   * Role - Admin
   * Restore client from archived/cancelled/pending
   * @param clientId
   * @returns
   */
  public static async adminRestoreClient(
    currentAgent: AgentByEmailResponse,
    clientId: string
  ): Promise<ClientResponse> {
    try {
      const clientRepository = await Baserepository.getRepo(Client);
      const client = await clientRepository.findOne({
        where: { orgId: currentAgent.orgId, id: clientId }
      });
      if (!client) {
        throw errorResponse(
          {
            message: 'You are not authorised to update this user.'
          },
          403
        );
      }
      const updatedClient = await clientRepository.update(
        { status: ClientStatus.ACTIVE },
        {
          where: {
            orgId: currentAgent.orgId,
            id: clientId
          }
        }
      );
      if (updatedClient[0] === 1) {
        const auditData = {
          orgId: currentAgent.orgId,
          agentId: currentAgent.id,
          clientId: client.id,
          action: `${client.name} Restored`,
          details: client.name,
          time: new Date()
        };
        await AuditRepository.createAudit(auditData);
        const clientData = await clientRepository.findOne({
          where: {
            orgId: currentAgent.orgId,
            id: clientId
          },
          attributes: ['id', 'name', 'email', 'status', 'phone', 'created'],
          raw: true
        });
        const agents = await AgentClientRepository.getAgentForClient(clientId);
        clientData.agents = agents.map(({ agentId }) => agentId);
        return clientData;
      } else {
        throw 'Somthing went wrong.';
      }
    } catch (error) {
      console.log('Repository - admin restore client catch block - ', error);
      logger.error('Error::' + error);
      throw error;
    }
  }
  /**
   * Role - User
   * Restore client from archived/cancelled/pending
   * @param clientId
   * @returns
   */
  public static async restoreClient(
    clientId: string,
    currentAgent: AgentByEmailResponse
  ): Promise<ClientResponse> {
    try {
      const clientRepository = await Baserepository.getRepo(Client);
      const client = await clientRepository.findOne({
        where: { orgId: currentAgent.orgId, id: clientId }
      });
      if (!client) {
        throw errorResponse(
          {
            message: 'You are not authorised to update this user.'
          },
          403
        );
      }
      const updatedClient = await clientRepository.update(
        { status: ClientStatus.ACTIVE },
        {
          where: {
            orgId: currentAgent.orgId,
            id: clientId
          }
        }
      );
      if (updatedClient[0] === 1) {
        const auditData = {
          orgId: currentAgent?.orgId,
          agentId: currentAgent?.id,
          clientId: clientId,
          action: 'Restored client',
          details: `Restored with id ${clientId}`,
          time: new Date()
        };
        await AuditRepository.createAudit(auditData);
        const clientData = await clientRepository.findOne({
          where: {
            orgId: currentAgent.orgId,
            id: clientId
          },
          attributes: ['id', 'name', 'email', 'status', 'phone', 'created'],
          raw: true
        });
        const agents = await AgentClientRepository.getAgentForClient(clientId);
        clientData.agents = agents.map(({ agentId }) => agentId);
        return clientData;
      } else {
        throw 'Somthing went wrong.';
      }
    } catch (error) {
      console.log('Repository - restore client catch block - ', error);
      throw error;
    }
  }

  public static async getClientByEmail(
    clientEmail: string,
    organisationKey: string
  ): Promise<ClientByEmailResponse> {
    try {
      const clientRepository = await Baserepository.getRepo(Client);
      const organisationRepository = await Baserepository.getRepo(Organisation);

      const client = await clientRepository.findOne({
        where: Sequelize.where(
          Sequelize.fn('lower', Sequelize.col('email')), 
          Sequelize.fn('lower', clientEmail)
        ),
        include: [
          {
            model: organisationRepository,
            attributes: ['name'],
            where: { key: organisationKey }
          }
        ]
      });
      return client;
    } catch (error) {
      console.log('Repository - get client by email catch block - ', error);
      throw error;
    }
  }

  public static async getClientByInvitation(
    orgKey: string,
    invitationId: string
  ) {
    try {
      const clientRepository = await Baserepository.getRepo(Client);
      const organisationRepository = await Baserepository.getRepo(Organisation);

      const client = await clientRepository.findOne({
        where: {
          invitationId: invitationId
        },
        include: [
          {
            model: organisationRepository,
            attributes: ['name'],
            where: { key: orgKey }
          }
        ]
      });
      return client;
    } catch (error) {
      console.log('Repository - get client by email catch block - ', error);
      throw error;
    }
  }

  public static async addMeccoConnectionAndUserId(
    clientId: string,
    meccoIds: InvitationAcceptedRequest
  ) {
    try {
      const clientRepository = await Baserepository.getRepo(Client);
      await clientRepository.update(
        {
          meecoConnectionId: meccoIds.connectionid,
          meecoUserId: meccoIds.userid
        },
        { where: { id: clientId } }
      );
    } catch (error) {
      console.log(
        'Repository - Add mecco connection and user id catch block - ',
        error
      );
      throw error;
    }
  }

  public static async updateClientToActive(
    clientId: string,
    currentAgent: AgentByEmailResponse
  ): Promise<ClientResponse> {
    try {
      const clientRepository = await Baserepository.getRepo(Client);
      const client = await clientRepository.findOne({
        where: { orgId: currentAgent.orgId, id: clientId }
      });
      if (!client) {
        throw errorResponse(
          {
            message: 'You are not authorised to update this user.'
          },
          403
        );
      }
      const updatedClient = await clientRepository.update(
        { status: ClientStatus.ACTIVE },
        {
          where: {
            orgId: currentAgent.orgId,
            id: clientId
          }
        }
      );
      if (updatedClient[0] === 1) {
        const auditData = {
          orgId: currentAgent?.orgId,
          agentId: currentAgent?.id,
          clientId: clientId,
          action: 'Client Status Update',
          details: `Active with id ${clientId}`,
          time: new Date()
        };
        await AuditRepository.createAudit(auditData);
        const clientData = await clientRepository.findOne({
          where: {
            orgId: currentAgent.orgId,
            id: clientId
          },
          attributes: ['id', 'name', 'email', 'status', 'phone', 'created'],
          raw: true
        });
        const agents = await AgentClientRepository.getAgentForClient(clientId);
        clientData.agents = agents.map(({ agentId }) => agentId);
        return clientData;
      } else {
        throw 'Somthing went wrong.';
      }
    } catch (error) {
      console.log('Repository - restore client catch block - ', error);
      throw error;
    }
  }

  /**
   * Gets the client with expired invitations that need to be cancelled
   * @returns the list of clients or null.
   */
  public static async getExpiredInvitations(): Promise<ExpiredClient[]> {
    try {
      const clientRepository = await Baserepository.getRepo(Client);
      const clients = await clientRepository.findAll({
        where: { 
          status: ClientStatus.PENDING, 
          invitationExpiry: {
            [Op.lt]: new Date()
          } 
        }
      });
      return clients;
    } catch (error) {
      console.log('Repository - restore client catch block - ', error);
      throw error;
    }
  }

  public static async cancelExpiredInvitation(client: ExpiredClient): Promise<ExpiredClient> {
    try {
      
      console.log('Cancel Expired Invitation - ', client.email, client.invitationExpiry);
      const clientRepository = await Baserepository.getRepo(Client);

      // update the client to cancelled and clear invitation token.
      const updatedClient = await clientRepository.update(
        { 
          status: ClientStatus.CANCELLED,
          invitationId: null,
          invitationExpiry: null,
        },
        {
          where: {
            orgId: client?.orgId,
            id: client.id
          }
        }
      );

      if (updatedClient[0] === 1) {
        console.log('Cancel Expired Invitation Completed - ', client.email, client.invitationExpiry);

        client.status = ClientStatus.CANCELLED;
        client.invitationId = null;
        client.invitationExpiry = null;

        return client;
      } else {
        await AirBrake.notify('Cancel Expired Invitation Failed to update DB - ' + client.email);
        console.log('Cancel Expired Invitation Failed - ', client.email, client.invitationExpiry);
        throw 'Somthing went wrong updating the DB';
      }
    } catch (error) {
      await AirBrake.notify(error);
      console.log('Failed to cancel user in DB - ', error);
      logger.error('Error::' + error);
      throw error;
    }
  }


}

const clientRepository: ClientRepository = new ClientRepository();
export default clientRepository;
