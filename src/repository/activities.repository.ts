import { Baserepository } from './base.repository';
import { Activities } from '../model';
import {
  Activities as activities,
  ActivitiesList
} from '../interface/response/activities.response.interface';
import { CreateActivitiesRequest } from '../interface/request/activity.request.interface';

export class ActivitiesRepository extends Baserepository {
  /**
   * Role - User
   * Get activities
   * @param page
   * @param records
   * @returns
   */
  public static async getActivities(
    agentId: string,
    page: string,
    records: string
  ): Promise<ActivitiesList> {
    try {
      const activitiesRepository = await Baserepository.getRepo(Activities);

      let offset = 0;
      const limit = +records || 50;
      const pageNo: string | number = +page || 0;
      offset = limit * pageNo;
      const activities: activities[] = await activitiesRepository.findAll({
        order: [['created', 'DESC']],
        limit: limit,
        offset: offset,
        where: { agentId: agentId },
        attributes: [
          'id',
          'title',
          'name',
          'agentId',
          'clientId',
          'message',
          'section',
          'created',
          'read'
        ]
      });

      const count = await activitiesRepository.count({
        where: { agentId: agentId }
      });

      return {
        total: count,
        activities
      };
    } catch (error) {
      console.log('Repository - get activities catch block - ', error);
      throw error;
    }
  }
  /**
   * Role - User
   * Add activities
   * @param activityData
   * @returns
   */
  public static async addActivities(
    activityData: CreateActivitiesRequest
  ): Promise<activities> {
    try {
      const activitiesRepository = await Baserepository.getRepo(Activities);

      const activities = await activitiesRepository.create({
        agentId: activityData.agentId,
        clientId: activityData.clientId,
        title: activityData.title,
        name: activityData.name,
        message: activityData.message,
        section: activityData.section,
        read: false,
        created: new Date()
      });

      return activities;
    } catch (error) {
      console.log('Repository - add activities catch block - ', error);
      throw error;
    }
  }

  public static async createBulkActivities(
    activityData: CreateActivitiesRequest[]
  ): Promise<activities> {
    try {
      const activitiesRepository = await Baserepository.getRepo(Activities);

      const activities = await activitiesRepository.bulkCreate(activityData);

      return activities;
    } catch (error) {
      console.log('Repository - add bulk activities catch block - ', error);
      throw error;
    }
  }
}
