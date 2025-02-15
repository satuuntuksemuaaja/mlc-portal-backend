import { AxiosRequester } from '../../util/axiosRequester';
import { BFFHelper } from '../../util/getBffToken';
import bffConfig from '../../config/config.bff';

export interface OrganisationCreateRequest {
  organisation: {
    key: string;
    name: string;
    website: string;
    logo: string;
    service_user_id: string;
  };
}

export interface OrganisationUpdateRequest {
  organisation: {
    key: string;
    name: string;
    website: string;
    logo: string;
    service_user_id: string;
  };
}

/**
 * The response returned from the BFF
 */
export interface OrganisationUpdateResponse {
  ok: boolean;
}

/**
 * Create and update the organisation in the BFF
 */
export class BffOrganisationService extends AxiosRequester {
  constructor() {
    super();
  }
  public async create(
    request: OrganisationCreateRequest
  ): Promise<OrganisationUpdateResponse> {
    try {
      const headers = {
        authorization: BFFHelper.getHeader()
      };
      console.log('Create Organisation at BFF');
      console.log('BFF Request', request, headers);
      const url = BFFHelper.getURL() + `${bffConfig.BFF_UPDATE_ORGANISATION}`;
      const bffData = await this.makePutCall(url, request, headers);
      console.log('BFF Response', bffData);
      return {
        ok: bffData !== false
      };
    } catch (error) {
      console.log(' BFF update organisation Failed - ', error);
      throw error;
    }
  }

  public async update(
    request: OrganisationUpdateRequest
  ): Promise<OrganisationUpdateResponse> {
    try {
      const headers = {
        authorization: BFFHelper.getHeader()
      };
      console.log('Updating Organisation at BFF');
      console.log('BFF Request', request, headers);
      const url = BFFHelper.getURL() + `${bffConfig.BFF_UPDATE_ORGANISATION}`;
      const bffData = await this.makePutCall(url, request, headers);
      console.log('BFF Response', bffData);
      return {
        ok: bffData !== false
      };
    } catch (error) {
      console.log(' BFF update organisation Failed - ', error);
      throw error;
    }
  }
}
