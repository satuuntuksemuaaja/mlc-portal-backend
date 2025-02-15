import bffConfig from '../../config/config.bff';
import { AxiosRequester } from '../../util/axiosRequester';
import { BFFHelper } from '../../util/getBffToken';

export interface ExtendSubscriptionRequest {
  organisation_key: string;
  duration: number;
  email: string;
}

/**
 * The response returned from the BFF
 */
export interface ExtendSubscriptionResponse {
  ok: boolean;
}

/**
 * Extends a subscription for a user in the BFF
 */
export class BffClientSubscriptionService extends AxiosRequester {
  public async update(
    request: ExtendSubscriptionRequest
  ): Promise<ExtendSubscriptionResponse> {
    const headers = {
      authorization: BFFHelper.getHeader()
    };
    console.log(headers, '--------------header bff extend subscription.');
    const url =
      BFFHelper.getURL() + `${bffConfig.BFF_UPDATE_CLIENT_SUBSCRIPTION}`;
    const result = await this.makePostCall(url, request, headers);

    // FIXME: - http error code handling?
    console.log(result);
    return {
      ok: true
    };
  }
}
