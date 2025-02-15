import { Sequelize } from 'sequelize-typescript';
import { Agent } from '../model/agent.model';
import { AgentClient } from '../model/agentclient.model';
import { Audit } from '../model/audit.model';
import { Client } from '../model/client.model';
import { ClientTerm } from '../model/clientterm.model';
import { Organisation } from '../model/organisation.model';
import { System } from '../model/system.model';
import { Roles } from '../model/roles.model';
import { Activities, UnreadMessages } from '../model';
import { Dialect } from 'sequelize';

/**
 * Holds the connection to the database for the current process
 * A single connection is maintained.
 *
 * The app will initialise and close as part of normal processing.
 *
 */
export class DbContext {
  private static sequelize: Sequelize;
  private static initialised = false;

  public static isInitialised(): boolean {
    return DbContext.initialised;
  }

  public static async initialise() {
    if (DbContext.initialised) {
      return;
    }

    // whilst not officially initialised we set to true to prevent multiple runs...
    DbContext.initialised = true;

    const hostName = process.env['KV_PP_HOST'];
    const userName = process.env['KV_PP_DBUSER'];
    const password = process.env['KV_PP_DBPASSWORD'];
    const database = process.env['KV_PP_DATABASE'];
    const dialect = process.env['KV_PP_DIALECT'] as Dialect;
    const port = parseInt(process.env['KV_PP_DATABASE_PORT']);
    const schema = process.env['KV_PP_DBSCHEMA'];

    const dialOptions =
      process.env['ENV'] != 'LOCAL'
        ? {
            connectTimeout: 3000,
            ssl: { rejectUnauthorized: false }
          }
        : { connectTimeout: 3000 };

    const sequelize = new Sequelize(database, userName, password, {
      host: hostName,
      port: port,
      dialect,
      repositoryMode: true,
      pool: {
        max: 100,
        min: 0,
        acquire: 20000,
        idle: 5000
      },
      dialectOptions: dialOptions,
      schema: schema
    });

    sequelize.addModels([
      Agent,
      AgentClient,
      Audit,
      Client,
      ClientTerm,
      Organisation,
      System,
      Roles,
      Activities,
      UnreadMessages
    ]);

    DbContext.sequelize = sequelize;
  }

  public static getDatabase() {
    if (!DbContext.sequelize) {
      throw 'Database connection not available';
    }
    return DbContext.sequelize;
  }

  public static async shutdown() {
    if (DbContext.sequelize) {
      try {
        await DbContext.sequelize.close();
      } finally {
        DbContext.initialised = false;
      }
    }
  }
}
