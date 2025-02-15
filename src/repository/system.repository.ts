import { System } from '../model';
import { Baserepository } from './base.repository';
import { errorResponse } from '../response/error.response';

export class SystemRepository extends Baserepository {
  /**
   * Get list of roles
   * @returns
   */
  public static async getUp(): Promise<string> {
    try {
      const systemRepository = await Baserepository.getRepo(System);

      const systemUp = await systemRepository.findOne({
        where: {
          up: false
        }
      });
      if (systemUp) {
        throw errorResponse(
          { message: 'The system is down for Maintenance.' },
          503
        );
      }
      return 'The system is up and running';
    } catch (error) {
      console.log('Repository - get system up catch block - ', error);
      throw error;
    }
  }
}

const systemRepository: SystemRepository = new SystemRepository();
export default systemRepository;
