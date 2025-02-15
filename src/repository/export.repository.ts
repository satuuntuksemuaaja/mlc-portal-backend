import { ClientTerm } from '../model/clientterm.model';
import { Client } from '../model';
import { Agent } from '../model';
import { Audit } from '../model';
import { AgentClient } from '../model';
import { Baserepository } from './base.repository';
import { col, fn, Op } from 'sequelize';
import {
  exportAgentClientsWhere,
  exportAgentWhere,
  exportAuditWhere,
  exportClientWhere,
  exportSubscriptionsWhere
} from '../interface/request/export.request.interfase';
import moment from 'moment';
import {
  ExportAgentClientsResponse,
  ExportAgentResponse,
  ExportAuditResponse,
  ExportClientRespons,
  ExportSubscriptionsResponse
} from '../interface/response/export.response.interface';

export class ExportRepository extends Baserepository {
  private static extractWhereDates(queryData, where) {
    where.created = {
      [Op.between]: [
        moment(queryData.dateFrom, 'DD-MM-YYYY')
          .set({
            hour: 0,
            minute: 0,
            second: 0,
            millisecond: 0
          })
          .format('YYYY-MM-DD HH:mm:ss'),
        moment(queryData.dateTo, 'DD-MM-YYYY')
          .set({
            hour: 23,
            minute: 59,
            second: 59,
            millisecond: 999
          })
          .format('YYYY-MM-DD HH:mm:ss')
      ]
    };
  }

  /**
   * Role - Admin
   * Get export of client table
   * @param orgId
   * @returns
   */
  public static async exportClient(
    orgId: string,
    queryData
  ): Promise<ExportClientRespons> {
    try {
      const where: exportClientWhere = { orgId: orgId };
      if (queryData.dateFrom && queryData.dateTo) {
        this.extractWhereDates(queryData, where);
      }
      const clientRepository = await Baserepository.getRepo(Client);
      const content = await clientRepository.findAll({
        where: where,
        attributes: [
          'name',
          'email',
          'status',
          'created',
          'lastModified',
          'orgId'
        ]
      });
      return {
        report: 'clients',
        content
      };
    } catch (error) {
      console.log('Repository - export client catch block - ', error);
      throw error;
    }
  }
  /**
   * Role - Admin
   * Get export of agnet table
   * @param orgId
   * @returns
   */
  public static async exportAgent(
    orgId: string,
    queryData
  ): Promise<ExportAgentResponse> {
    try {
      const where: exportAgentWhere = { orgId: orgId };
      if (queryData.dateFrom && queryData.dateTo) {
        this.extractWhereDates(queryData, where);
      }
      const agnetRepository = await Baserepository.getRepo(Agent);
      const content = await agnetRepository.findAll({
        where: where,
        attributes: [
          'name',
          'email',
          'status',
          'created',
          'lastModified',
          'orgId'
        ]
      });
      return {
        report: 'agents',
        content
      };
    } catch (error) {
      console.log('Repository - export agent catch block - ', error);
      throw error;
    }
  }
  /**
   * Role - Admin
   * Get export of subscriptions(client and client term table)
   * @param orgId
   * @returns
   */
  public static async exportSubscriptions(
    orgId: string,
    queryData
  ): Promise<ExportSubscriptionsResponse> {
    try {
      const where: exportSubscriptionsWhere = {};
      if (queryData.dateFrom && queryData.dateTo) {
        this.extractWhereDates(queryData, where);
      }
      const clientTermRepository = await Baserepository.getRepo(ClientTerm);
      const clientRepository = await Baserepository.getRepo(Client);

      const content = await clientTermRepository.findAll({
        where: where,
        attributes: [
          [col('client.orgId'), 'orgId'],
          [col('client.name'), 'name'],
          [col('client.email'), 'email'],
          'start',
          'end',
          'durationMonths'
        ],
        include: [
          {
            model: clientRepository,
            attributes: [],
            where: { orgId: orgId },
            required: false
          }
        ]
      });
      return {
        report: 'subscriptions',
        content
      };
    } catch (error) {
      console.log('Repository - export subscription catch block - ', error);
      throw error;
    }
  }
  /**
   * Role - Admin
   * Get export of audit, agent and client table
   * @param orgId
   * @returns
   */
  public static async exportAudit(
    orgId: string,
    queryData
  ): Promise<ExportAuditResponse> {
    try {
      const where: exportAuditWhere = { orgId: orgId };
      if (queryData.dateFrom && queryData.dateTo) {
        where.time = {
          [Op.between]: [
            moment(queryData.dateFrom, 'DD-MM-YYYY')
              .set({
                hour: 0,
                minute: 0,
                second: 0,
                millisecond: 0
              })
              .format('YYYY-MM-DD HH:mm:ss'),
            moment(queryData.dateTo, 'DD-MM-YYYY')
              .set({
                hour: 23,
                minute: 59,
                second: 59,
                millisecond: 999
              })
              .format('YYYY-MM-DD HH:mm:ss')
          ]
        };
      }
      const auditRepository = await Baserepository.getRepo(Audit);
      const agentRepository = await Baserepository.getRepo(Agent);
      const clientRepository = await Baserepository.getRepo(Client);
      const content = await auditRepository.findAll({
        where: where,
        attributes: [
          [col('agent.orgId'), 'orgId'],
          [col('agent.name'), 'agent'],
          [col('agent.email'), 'agentemail'],
          [col('client.name'), 'client'],
          [col('client.email'), 'clientemail'],
          'action',
          [fn('LEFT', col('details'), 10), 'details'],
          'time'
        ],
        include: [
          {
            model: agentRepository,
            attributes: [],
            where: { orgId: orgId },
            required: false
          },
          {
            model: clientRepository,
            attributes: [],
            where: { orgId: orgId },
            required: false
          }
        ],
        raw: true
      });

      return {
        report: 'audit',
        content
      };
    } catch (error) {
      console.log('Repository - export audit catch block - ', error);
      throw error;
    }
  }
  /**
   * Role - Admin
   * Get export of agent client table
   * @param orgId
   * @returns
   */
  public static async exportAgentClients(
    orgId: string,
    queryData
  ): Promise<ExportAgentClientsResponse> {
    try {
      const where: exportAgentClientsWhere = {};
      if (queryData.dateFrom && queryData.dateTo) {
        this.extractWhereDates(queryData, where);
      }
      const agentclientRepository = await Baserepository.getRepo(AgentClient);
      const agentRepository = await Baserepository.getRepo(Agent);
      const clientRepository = await Baserepository.getRepo(Client);
      const content = await agentclientRepository.findAll({
        where: where,
        attributes: [
          [col('agent.orgId'), 'orgId'],
          [col('agent.name'), 'agent'],
          [col('agent.email'), 'agentemail'],
          [col('client.name'), 'client'],
          [col('client.email'), 'clientemail'],
          'created'
        ],
        include: [
          {
            model: agentRepository,
            attributes: [],
            where: { orgId: orgId }
          },
          {
            model: clientRepository,
            attributes: [],
            where: { orgId: orgId }
          }
        ],
        raw: true
      });

      return {
        report: 'agentclients',
        content
      };
    } catch (error) {
      console.log('Repository - export agent client catch block - ', error);
      throw error;
    }
  }
}
const exportRepository: ExportRepository = new ExportRepository();
export default exportRepository;
