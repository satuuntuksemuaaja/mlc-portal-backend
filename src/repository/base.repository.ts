import { DbContext } from '../config/db.config';

export class Baserepository {
  /**
   * Get model repository
   * @param model
   * @returns
   */
  public static async getRepo(model: any): Promise<any> {
    try {
      // this is here for unit teting under normal circumstances this would be loaded by the app.
      if (!DbContext.isInitialised()) {
        await DbContext.initialise();
      }
      const db = DbContext.getDatabase();
      // For Development
      // this.db.sequelize.sync({ force: true }).then(() => {
      //   console.log('Drop and re-sync db.');
      // });
      return db.getRepository(model);
    } catch (error) {
      console.log(error, '-------------------error');
      throw error;
    }
  }
  public static async getTransaction() {
    try {
      if (!DbContext.isInitialised()) {
        await DbContext.initialise();
      }
      const db = DbContext.getDatabase();
      return db.transaction();
    } catch (error) {
      console.log(error, '-------------------error');
      throw error;
    }
  }
}
