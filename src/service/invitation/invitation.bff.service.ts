import bffConfig from '../../config/config.bff';
import { AxiosRequester } from '../../util/axiosRequester';
import { BFFHelper } from '../../util/getBffToken';

export interface InvitationShareDetails {
  invitation: {
    organisation_key: string;
    email: string;
    invitation_id: string;
    token: string;
    duration: number;
    welcome_message: string;
  };
}

export interface InvitationDeleteDetails {
  invitationId: string;
}

/**
 * The response returned from the BFF
 */
export interface InvitationShareResponse {
  vouchercode?: string;
}

/**
 * Delete Invitation Response
 */
export interface InvitationDeleteResponse {
  ok?: boolean;
}

/**
 * Shares the details of an invitation withe the BFF
 */
export class BffInvitationService extends AxiosRequester {
  constructor() {
    super();
  }
  public async share(request: InvitationShareDetails): Promise<boolean> {
    try {
      const header = BFFHelper.getHeader();
      const headers = {
        authorization: header
      };
      console.log(headers, '--------------header bff share invitation.');
      const url = BFFHelper.getURL() + `${bffConfig.BFF_CREATE_CLIENT}`;
      const result = await this.makePostCall(url, request, headers);
      if (result === false) {
        throw 'BFF Create Invitation Failed';
      }
      return true;
    } catch (error) {
      console.log('BFF create client request catch block - ', error);
      throw error;
    }
  }

  public async delete(
    request: InvitationDeleteDetails
  ): Promise<InvitationDeleteResponse> {
    try {
      const headers = {
        authorization: await BFFHelper.getHeader()
      };
      console.log(headers, '--------------header bff delte invitation.');
      let url = BFFHelper.getURL() + `${bffConfig.BFF_CANCEL_CALINET}`;
      url = url.replace('{invitationId}', request.invitationId);
      await this.makeDeleteCall(url, headers);
      return {
        ok: true
      };
    } catch (error) {
      console.log('BFF cancel client request catch block - ', error);
      throw error;
    }
  }
}
