import { InvitationService, vaultAPIFactory } from '@meeco/sdk';
import { Invitation } from '@meeco/vault-api-sdk';
import { MeecoServices } from './meeco.service';

/**
 * Creates a new invitation record in Meeco
 */
export class MeecoInvitationService extends MeecoServices {
  /**
   *
   * @param name Creates a new invitation record to be used in creating a connection.
   * @returns the new Invitation record
   */
  public async invite(name: string): Promise<Invitation> {
    if (name === undefined || name == null || name.trim().length < 1) {
      throw 'Invalid Name';
    }
    const ivs = new InvitationService(
      this.getMeecoApiConfiguration(),
      (message: string) => console.log(message)
    );
    const invResult = await ivs.create(this.getAuthObject(), name);
    return invResult;
  }

  /**
   * Deletes a pending invitation
   * @param id the invitation id
   * @returns true if the delete succeeded.
   */
  public async delete(id: string): Promise<boolean> {
    const invApi = this.getInvitationApi();
    await invApi.invitationsIdDelete(id);
    return true;
  }

  private getInvitationApi() {
    const vaf = vaultAPIFactory(this.getMeecoApiConfiguration());
    return vaf({
      vault_access_token: this.getAuthObject().vault_access_token,
      oidc_token: ''
    }).InvitationApi;
  }
}
