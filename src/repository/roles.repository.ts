import logger from '../logger/api.logger';
import { Roles } from '../model';
import { Baserepository } from './base.repository';

export class RolesRepository extends Baserepository {
  /**
   * Get list of roles
   * @returns
   */
  public static async getRoles(organisationId: string): Promise<Roles | any> {
    try {
      const rolesRepository = await Baserepository.getRepo(Roles);

      const roles: Roles[] = await rolesRepository.findAll({
        where: { orgId: organisationId },
        attributes: [
          ['id', 'roleId'],
          ['name', 'role']
        ]
      });
      return roles;
    } catch (error) {
      console.log('Repository - get roles catch block', error);
      logger.error('Error::' + error);
      throw error;
    }
  }
}

const rolesRepository: RolesRepository = new RolesRepository();
export default rolesRepository;
