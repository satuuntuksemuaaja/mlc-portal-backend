import logger from '../logger/api.logger';
import { Organisation } from '../model/organisation.model';
import { Baserepository } from './base.repository';
import { RolesRepository } from './roles.repository';
import { AuditRepository } from './audit.repository';
import {
  GetOrganisationResponse,
  OrganisationResponse
} from '../interface/response/organisation.response.interface';
import { UpdateOrganisationRequest } from '../interface/request/organisation.request.interface';
import { TextFormat } from '../util/textFormat';

export class OrganisationRepository extends Baserepository {
  /**
   * Role - Admin
   * Get organisation by its id
   * @param organisationId
   * @returns
   */
  public static async getOrganisation(
    organisationId: string
  ): Promise<GetOrganisationResponse> {
    try {
      const organisationRepository = await Baserepository.getRepo(Organisation);

      const organisations: Organisation = await organisationRepository.findOne({
        where: { id: organisationId },
        attributes: [
          'id',
          'name',
          'websiteUrl',
          'status',
          'primaryDomain',
          'logoThumbnail',
          'signupKey',
          'key',
          'welcomeMessageTemplate'
        ],
        raw: true
      });
      const roles = await RolesRepository.getRoles(organisationId);
      return {
        org: organisations,
        security: {
          roles
        }
      };
    } catch (error) {
      console.log('Repository - get organisation catch block - ', error);
      logger.error('Error::' + error);
      throw error;
    }
  }

  public static async getServiceId(organisationId: string): Promise<string> {
    const organisationRepository = await Baserepository.getRepo(Organisation);
    const org: Organisation = await organisationRepository.findOne({
      where: { id: organisationId },
      attributes: ['serviceId'],
      raw: true
    });
    return org.serviceId;
  }

  /**
   * Mark as registered
   * @param organisationId
   */
  public static async markRegistered(organisationId: string) {
    try {
      const organisationRepository = await Baserepository.getRepo(Organisation);
      await organisationRepository.update(
        {
          bffRegistered: true
        },
        {
          where: {
            id: organisationId
          }
        }
      );
    } catch (error) {
      console.log('Repository - Mark as registered - ', error);
      logger.error('Error::' + error);
      throw error;
    }
  }

  /**
   * Role - Admin
   * Update organistion details - Name, Website, Thumbnail
   * @param organisationId
   * @param organisationData
   * @returns
   */
  public static async updateOrganisations(
    organisationId: string,
    organisationData: UpdateOrganisationRequest
  ): Promise<GetOrganisationResponse> {
    try {
      const organisationRepository = await Baserepository.getRepo(Organisation);
      const updatedOrg = await organisationRepository.update(
        {
          name: organisationData?.name,
          logoThumbnail: organisationData?.logoThumbnail,
          websiteUrl: organisationData?.websiteUrl,
          welcomeMessageTemplate: organisationData?.welcomeMessageTemplate
        },
        {
          where: {
            id: organisationId
          }
        }
      );

      if (updatedOrg[0] === 1) {
        const textFormat = await TextFormat.getTextFormat(organisationData);
        const auditData = {
          orgId: organisationId,
          agentId: null,
          clientId: null,
          action: 'Organisation Updated',
          details: textFormat,
          time: new Date()
        };
        await AuditRepository.createAudit(auditData);

        const organisation: Organisation = await organisationRepository.findOne(
          {
            where: { id: organisationId },
            attributes: [
              'id',
              'name',
              'websiteUrl',
              'status',
              'primaryDomain',
              'logoThumbnail',
              'signupKey',
              'key',
              'welcomeMessageTemplate'
            ]
          }
        );
        const roles = await RolesRepository.getRoles(organisationId);
        return {
          org: organisation,
          security: {
            roles: roles
          }
        };
      }
    } catch (error) {
      console.log('Repository - update organisation catch block - ', error);
      logger.error('Error::' + error);
      throw error;
    }
  }
  /**
   * Role - Admin
   * Get organisation logo by its key
   * @param organisationKey
   * @returns
   */
  public static async getOrganisationLogo(
    organisationKey: string
  ): Promise<string> {
    try {
      const organisationRepository = await Baserepository.getRepo(Organisation);

      const organisations: Organisation = await organisationRepository.findOne({
        where: { key: organisationKey },
        attributes: ['logoThumbnail'],
        raw: true
      });
      return organisations?.logoThumbnail ? organisations?.logoThumbnail : null;
    } catch (error) {
      console.log('Repository - get organisation logo catch block - ', error);
      logger.error('Error::' + error);
      throw error;
    }
  }

  /**
   * Get public organisation
   * @param organisationKey
   * @returns
   */
  public static async getPublicOrganisation(
    organisationKey: string
  ): Promise<OrganisationResponse> {
    try {
      const organisationRepository = await Baserepository.getRepo(Organisation);
      const organisations: OrganisationResponse =
        await organisationRepository.findOne({
          where: { key: organisationKey },
          attributes: ['key', 'name'],
          raw: true
        });
      return organisations;
    } catch (error) {
      console.log(
        'Repository - get public organisation details catch block - ',
        error
      );
      logger.error('Error::' + error);
      throw error;
    }
  }
  /**
   * Role - Admin
   * Get active agent list of Admin organisation
   * @param orgId
   * @param archived
   * @returns
   */
  public static async allOrganisationList(): Promise<OrganisationResponse[]> {
    try {
      const organisationRepository = await Baserepository.getRepo(Organisation);
      const organisationList = await organisationRepository.findAll({
        where: { bffRegistered: false },
        attributes: [
          'id',
          'name',
          'status',
          'websiteUrl',
          'primaryDomain',
          'logoThumbnail',
          'bffRegistered'
        ],
        raw: true
      });
      return organisationList;
    } catch (error) {
      console.log('Repository - get agents list catch block - ', error);
      throw error;
    }
  }
}

const organisationRepository: OrganisationRepository =
  new OrganisationRepository();
export default organisationRepository;
