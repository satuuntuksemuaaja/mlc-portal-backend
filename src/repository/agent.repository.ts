import { v4 as uuidv4 } from 'uuid';
import { Agent } from '../model/agent.model';
import { Baserepository } from './base.repository';
import { AuditRepository } from './audit.repository';
import { Op } from 'sequelize';
import { Organisation, Roles } from '../model';
import { AgentStatus } from '../model/enums/agent.enum';
import {
  CreateAgentRequest,
  AdminUpdateAgentRequest,
  UpdateAgentThumbAgentRequest,
  UpdateAgentRequest,
  UpdateAgentPhotoRequest
} from '../interface/request/agent.request.interface';
import {
  AgentResponse,
  CreateAgentResponse,
  GetAgentsListResponse,
  AgentThumbResponse,
  AgentByEmailResponse,
  GetAgentResponse,
  GetAgentPhoto
} from '../interface/response/agent.response.interface';
import { ErrorResponse, errorResponse } from '../response/error.response';
import { TextFormat } from '../util/textFormat';

/**
 * Extended Base repository to get repositories from db
 */
export class AgentRepository extends Baserepository {
  /**
   * Agent count
   */
  public static async agentCount(currentAgent) {
    const agentRepository = await Baserepository.getRepo(Agent);
    const agentCount = await agentRepository.count({
      where: {
        orgId: currentAgent.orgId
      }
    });
    return agentCount;
  }
  /**
   * Role - Admin
   * Get active agent list of Admin organisation
   * @param orgId
   * @param archived
   * @returns
   */
  public static async adminGetAgentsList(
    orgId: string,
    archived: string
  ): Promise<GetAgentsListResponse[]> {
    try {
      const where = {
        orgId: orgId,
        status: { [Op.in]: [AgentStatus.ACTIVE, AgentStatus.ARCHIVED] }
      };
      if (archived == 'false') {
        where.status = { [Op.in]: [AgentStatus.ACTIVE] };
      }

      const agentRepository = await Baserepository.getRepo(Agent);
      const agents = await agentRepository.findAll({
        where: where,
        attributes: [
          'id',
          'orgId',
          'name',
          'email',
          'phone',
          'status',
          'roleId',
          'created'
        ],
        raw: true,
        order: [['name', 'ASC']]
      });
      return agents;
    } catch (error) {
      console.log('Repository - get agents list catch block - ', error);
      throw error;
    }
  }
  /**
   * Role - Admin
   * Create agent
   */
  public static async adminCreateAgent(
    currentAgent: AgentByEmailResponse,
    agentData: CreateAgentRequest
  ): Promise<CreateAgentResponse | ErrorResponse> {
    try {
      const agentRepository = await Baserepository.getRepo(Agent);

      const isAgentExist = await agentRepository.findOne({
        where: {
          email: `${agentData.emailPrefix}${currentAgent?.organisation?.primaryDomain}`
        }
      });
      if (isAgentExist) {
        throw errorResponse(
          {
            error: '1',
            message: 'Agent already exists'
          },
          409
        );
      }
      const agent = await agentRepository.create({
        id: uuidv4(),
        orgId: currentAgent?.orgId,
        name: agentData?.name,
        email: `${agentData?.emailPrefix}${currentAgent?.organisation?.primaryDomain}`,
        roleId: agentData?.roleId,
        status: AgentStatus.ACTIVE,
        phone: agentData?.phone
      });

      const auditData = {
        orgId: currentAgent?.orgId,
        agentId: currentAgent?.id,
        clientId: null,
        action: 'Agent Created',
        details: agent?.email,
        time: new Date()
      };
      await AuditRepository.createAudit(auditData);

      return {
        id: agent?.id,
        name: agent?.name,
        email: agent?.email,
        status: agent?.status,
        created: agent?.created,
        roleId: agent?.roleId,
        phone: agent?.phone
      };
    } catch (error) {
      console.log('Repository - create agent catch block - ', error);
      throw error;
    }
  }
  /**
   * Role - Admin
   * Update all agent details with audit entry
   * @param currentAgent
   * @param agentData
   * @returns
   */
  public static async adminUpdateAgent(
    currentAgent: AgentByEmailResponse,
    agentData: AdminUpdateAgentRequest
  ): Promise<AgentResponse> {
    try {
      const agentRepository = await Baserepository.getRepo(Agent);
      const agent = await agentRepository.findOne({
        where: { orgId: currentAgent.orgId, id: agentData.id }
      });
      if (!agent) {
        throw errorResponse(
          {
            message: 'You are not authorised to update this user.'
          },
          403
        );
      }
      const updatedAgent = await agentRepository.update(
        {
          name: agentData.name,
          roleId: agentData.roleId,
          phone: agentData.phone
        },
        {
          where: { orgId: currentAgent.orgId, id: agentData.id }
        }
      );
      if (updatedAgent[0] === 1) {
        const textFormat = await TextFormat.getTextFormat(agentData);
        const auditData = {
          orgId: currentAgent.orgId,
          agentId: currentAgent.id,
          clientId: null,
          action: 'Agent Updated',
          details: textFormat,
          time: new Date()
        };
        await AuditRepository.createAudit(auditData);
        const agent = await agentRepository.findOne({
          where: { orgId: currentAgent.orgId, id: agentData.id },
          attributes: [
            'id',
            'name',
            'email',
            'status',
            'roleId',
            'created',
            'phone'
          ],
          raw: true
        });
        return agent;
      } else {
        throw 'Somthing went wrong.';
      }
    } catch (error) {
      console.log('Repository - update agent catch block - ', error);
      throw error;
    }
  }
  /**
   * Role - Admin
   * Restore agent from archive/cancelled with audit entry
   * @param agentId
   * @returns
   */
  public static async adminRestoreAgent(
    currentAgent: AgentByEmailResponse,
    agentId: string
  ): Promise<AgentResponse> {
    try {
      const agentRepository = await Baserepository.getRepo(Agent);
      const agent = await agentRepository.findOne({
        where: { orgId: currentAgent.orgId, id: agentId }
      });
      if (!agent) {
        throw errorResponse(
          {
            message: 'You are not authorised to update this user.'
          },
          403
        );
      }
      const updatedAgent = await agentRepository.update(
        { status: AgentStatus.ACTIVE },
        {
          where: { orgId: currentAgent.orgId, id: agentId }
        }
      );
      if (updatedAgent[0] === 1) {
        const auditData = {
          orgId: currentAgent.orgId,
          agentId: currentAgent.id,
          clientId: null,
          action: 'Agent Status Update',
          details: `Restored with id ${agentId}`,
          time: new Date()
        };
        await AuditRepository.createAudit(auditData);
        const agent = await agentRepository.findOne({
          where: { orgId: currentAgent.orgId, id: agentId },
          attributes: [
            'id',
            'name',
            'email',
            'status',
            'roleId',
            'created',
            'phone'
          ],
          raw: true
        });
        return agent;
      } else {
        throw 'Somthing went wrong.';
      }
    } catch (error) {
      console.log('Repository - active an agent catch block - ', error);
      throw error;
    }
  }
  /**
   * Role - Admin
   * Archive agent from active/cancelled with audit entry
   * @param agentId
   * @returns
   */
  public static async adminArchiveAgent(
    currentAgent: AgentByEmailResponse,
    agentId: string
  ): Promise<AgentResponse> {
    try {
      const agentRepository = await Baserepository.getRepo(Agent);
      const agent = await agentRepository.findOne({
        where: { orgId: currentAgent.orgId, id: agentId }
      });
      if (!agent) {
        throw errorResponse(
          {
            message: 'You are not authorised to update this user.'
          },
          403
        );
      }
      if (currentAgent?.id === agent?.id) {
        throw errorResponse({}, 400);
      }
      const updatedAgent = await agentRepository.update(
        { status: AgentStatus.ARCHIVED },
        {
          where: { orgId: currentAgent.orgId, id: agentId }
        }
      );
      if (updatedAgent[0] === 1) {
        const auditData = {
          orgId: currentAgent.orgId,
          agentId: currentAgent.id,
          clientId: null,
          action: 'Agent Status Update',
          details: `Archived with id ${agentId}`,
          time: new Date()
        };
        await AuditRepository.createAudit(auditData);
        const agent = await agentRepository.findOne({
          where: { orgId: currentAgent.orgId, id: agentId },
          attributes: [
            'id',
            'name',
            'email',
            'status',
            'roleId',
            'created',
            'phone'
          ],
          raw: true
        });
        return agent;
      } else {
        throw 'Somthing went wrong.';
      }
    } catch (error) {
      console.log('Repository - archive an agent catch block - ', error);
      throw error;
    }
  }
  /**
   * Role - User
   * Get agnet thumb image(base64)
   * @param agentId
   * @returns
   */
  public static async getAgentThumb(
    currentAgent: AgentByEmailResponse,
    agentId: string
  ): Promise<AgentThumbResponse> {
    try {
      const agentRepository = await Baserepository.getRepo(Agent);
      const agents = await agentRepository.findOne({
        where: {
          id: agentId,
          orgId: currentAgent.orgId
        },
        attributes: ['id', 'photo'],
        raw: true
      });
      return agents;
    } catch (error) {
      console.log('Repository - get agent thumb catch block - ', error);
      throw error;
    }
  }
  /**
   * Role - Admin
   * Update agent thumb image(base64) with audit entry
   * @param agentId
   * @param agentData
   * @returns
   */
  public static async adminUpdateAgentThumb(
    currentAgent: AgentByEmailResponse,
    agentData: UpdateAgentThumbAgentRequest
  ): Promise<AgentThumbResponse> {
    try {
      const agentRepository = await Baserepository.getRepo(Agent);
      const agent = await agentRepository.findOne({
        where: { orgId: currentAgent.orgId, id: agentData.id }
      });
      if (!agent) {
        throw errorResponse(
          {
            message: 'You are not authorised to update this user.'
          },
          403
        );
      }
      const updatedAgent = await agentRepository.update(
        { photo: agentData.thumb },
        {
          where: { orgId: currentAgent.orgId, id: agentData.id }
        }
      );
      if (updatedAgent[0] === 1) {
        const auditData = {
          orgId: currentAgent.orgId,
          agentId: currentAgent.id,
          clientId: null,
          action: 'Agent Thumbnail Updated',
          details: `Thumbnail Updated with id ${agentData.id}`,
          time: new Date()
        };
        await AuditRepository.createAudit(auditData);
        const agent: AgentThumbResponse = await agentRepository.findOne({
          where: { orgId: currentAgent.orgId, id: agentData.id },
          attributes: ['id', 'photo'],
          raw: true
        });
        return agent;
      } else {
        throw 'Somthing went wrong.';
      }
    } catch (error) {
      console.log('Repository - update agent thumb catch block - ', error);
      throw error;
    }
  }
  /**
   * Get agent by its email
   * @param email
   * @returns
   */
  public static async getAgentByEmail(
    email: string[]
  ): Promise<AgentByEmailResponse> {
    try {
      const agentRepository = await Baserepository.getRepo(Agent);
      const roleRepository = await Baserepository.getRepo(Roles);
      const organisationRepository = await Baserepository.getRepo(Organisation);

      const agentData: AgentByEmailResponse = await agentRepository.findOne({
        where: { email: { [Op.in]: email } },
        include: [roleRepository, organisationRepository]
      });
      return agentData;
    } catch (error) {
      console.log('Repository - get agent by email catch block - ', error);
      return null;
    }
  }
  /**
   * Role - User
   * Get agnet photo(base64)
   * @returns
   */
  public static async getAgentPhoto(
    currentAgent: AgentByEmailResponse
  ): Promise<GetAgentPhoto> {
    try {
      const agentRepository = await Baserepository.getRepo(Agent);
      const agent = await agentRepository.findOne({
        where: { id: currentAgent.id, orgId: currentAgent.orgId }
      });
      return {
        photo: agent?.photo
      };
    } catch (error) {
      console.log('Repository - get agent photo catch block - ', error);
      throw error;
    }
  }
  /**
   * Get agent by its email
   * @param email
   * @returns
   */
  public static async getAgent(
    currentAgent: AgentByEmailResponse
  ): Promise<GetAgentResponse> {
    try {
      const agentRepository = await Baserepository.getRepo(Agent);
      const roleRepository = await Baserepository.getRepo(Roles);
      const organisationRepository = await Baserepository.getRepo(Organisation);
      const agent = await agentRepository.findOne({
        where: { id: currentAgent.id, orgId: currentAgent.orgId },
        include: [roleRepository, organisationRepository]
      });
      return {
        me: {
          email: agent?.email,
          name: agent?.name,
          role: agent?.role?.name,
          phone: agent?.phone
        },
        org: {
          name: agent?.organisation?.name,
          key: agent?.organisation?.key
        }
      };
    } catch (error) {
      console.log('Repository - get agent by email catch block - ', error);
      return null;
    }
  }
  /**
   * Role - User
   * Update agent
   * @param agent
   * @returns
   */
  public static async updateAgent(
    currentAgent: AgentByEmailResponse,
    agentData: UpdateAgentRequest
  ): Promise<GetAgentResponse> {
    try {
      const agentRepository = await Baserepository.getRepo(Agent);
      const roleRepository = await Baserepository.getRepo(Roles);
      const organisationRepository = await Baserepository.getRepo(Organisation);
      const agent = await agentRepository.findOne({
        where: { orgId: currentAgent.orgId, id: currentAgent.id }
      });
      if (!agent) {
        throw errorResponse(
          {
            message: 'You are not authorised to update this user.'
          },
          403
        );
      }
      const updatedAgent = await agentRepository.update(
        {
          name: agentData.name,
          phone: agentData.phone
        },
        {
          where: { id: currentAgent.id, orgId: currentAgent.orgId }
        }
      );
      if (updatedAgent[0] === 1) {
        const agent = await agentRepository.findOne({
          where: { id: currentAgent.id, orgId: currentAgent.orgId },
          attributes: ['name', 'email', 'phone'],
          include: [roleRepository, organisationRepository]
        });
        return {
          me: {
            email: agent?.email,
            name: agent?.name,
            role: agent?.role?.name,
            phone: agent?.phone
          },
          org: {
            name: agent?.organisation?.name,
            key: agent?.organisation?.key
          }
        };
      } else {
        throw 'Somthing went wrong.';
      }
    } catch (error) {
      console.log('Repository - create agent catch block - ', error);
      throw error;
    }
  }
  /**
   * Role - User
   * Create agent
   * @param agent
   * @returns
   */
  public static async updateAgentPhoto(
    currentAgent: AgentByEmailResponse,
    agentData: UpdateAgentPhotoRequest
  ): Promise<GetAgentPhoto> {
    try {
      const agentRepository = await Baserepository.getRepo(Agent);
      const agent = await agentRepository.findOne({
        where: { orgId: currentAgent.orgId, id: currentAgent.id }
      });
      if (!agent) {
        throw errorResponse(
          {
            message: 'You are not authorised to update this user.'
          },
          403
        );
      }
      const updatedAgent = await agentRepository.update(
        { photo: agentData.thumb },
        {
          where: { id: currentAgent.id, orgId: currentAgent.orgId }
        }
      );
      if (updatedAgent[0] === 1) {
        const agent = await agentRepository.findOne({
          where: { id: currentAgent.id, orgId: currentAgent.orgId },
          attributes: ['photo']
        });
        return {
          photo: agent?.photo
        };
      } else {
        throw 'Somthing went wrong.';
      }
    } catch (error) {
      console.log('Repository - update agent photo catch block - ', error);
      throw error;
    }
  }
}

const agentRepository: AgentRepository = new AgentRepository();
export default agentRepository;
