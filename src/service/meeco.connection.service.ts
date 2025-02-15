import { vaultAPIFactory } from '@meeco/sdk';
import {
  ConnectionsResponse,
  ConnectionResponse,
  Connection
} from '@meeco/vault-api-sdk';
import { MeecoServices } from './meeco.service';

/**
 * Manage Meeco Connections
 */
export class MeecoConnectionService extends MeecoServices {
  /**
   *
   * @param name Creates a new invitation record to be used in creating a connection.
   * @returns the new Invitation record
   */
  public async loadAll(): Promise<ConnectionsResponse> {
    const vaf = vaultAPIFactory(this.getMeecoApiConfiguration());
    return await vaf(this.getAuthObject()).ConnectionApi.connectionsGet();
  }

  public async load(id: string): Promise<ConnectionResponse> {
    const vaf = vaultAPIFactory(this.getMeecoApiConfiguration());
    return await vaf(this.getAuthObject()).ConnectionApi.connectionsIdGet(id);
  }

  public async getForUser(userId: string): Promise<Connection> {
    const vaf = vaultAPIFactory(this.getMeecoApiConfiguration());
    return (
      await vaf(this.getAuthObject()).ConnectionApi.connectionsGet()
    ).connections.find((e) => e.the_other_user.user_id === userId);
  }
}
