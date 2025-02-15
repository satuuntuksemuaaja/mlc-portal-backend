import logger from '../logger/api.logger';
import { Audit } from '../model/audit.model';
import { Baserepository } from './base.repository';
import { Agent } from '../model';
import { col } from 'sequelize';
import {
  ClientAuditsResponse,
  CreateAuditsResponse
} from '../interface/response/audit.response.interface';
import { CreateAuditRequest } from '../interface/request/audit.request.interface';

export class AuditRepository extends Baserepository {
  /**
   * Role - Admin
   * Get list of agent audits of admin organisation
   * @param agentId
   * @param pageid
   * @param orgId
   * @returns
   */
  public static async getAgentsAudits(
    agentId: string,
    pageid: string,
    orgId: string
  ): Promise<ClientAuditsResponse[]> {
    try {
      const auditRepository = await Baserepository.getRepo(Audit);
      const agentRepository = await Baserepository.getRepo(Agent);

      let offset = 0;
      const limit = 10;
      const page: string | number = pageid || 0;
      offset = limit * +page;

      const audits = await auditRepository.findAll({
        limit: limit,
        offset: offset,
        where: {
          agentId: agentId,
          orgId: orgId
        },
        attributes: [
          'action',
          'details',
          'time',
          'orgId',
          [col('agent.email'), 'agent']
        ],
        order: [['time', 'DESC']],
        include: [
          {
            model: agentRepository,
            attributes: [],
            require: false
          }
        ]
      });
      return audits;
    } catch (error) {
      console.log('Repository - get agent audits catch block - ', error);
      logger.error('Error::' + error);
      throw error;
    }
  }
  /**
   * Create audit
   * @param audit
   * @returns
   */
  public static async createAudit(
    audit: CreateAuditRequest
  ): Promise<CreateAuditsResponse> {
    try {
      const auditRepository = await Baserepository.getRepo(Audit);
      const data: CreateAuditsResponse = await auditRepository.create({
        orgId: audit?.orgId,
        agentId: audit?.agentId,
        clientId: audit?.clientId,
        action: audit?.action,
        details: audit?.details,
        time: audit?.time
      });
      return data;
    } catch (error) {
      console.log('Repository - create audit catch block - ', error);
      logger.error('Error::' + error);
      throw error;
    }
  }
}

const auditRepository: AuditRepository = new AuditRepository();
export default auditRepository;
