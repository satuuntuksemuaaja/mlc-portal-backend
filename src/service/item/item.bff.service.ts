import { BFFHelper } from '../../util/getBffToken';
import bffConfig from '../../config/config.bff';
import { AxiosRequester } from '../../util/axiosRequester';


export class BffItemService extends AxiosRequester {
  constructor() {
    super();
  }
  
  public async itemSent(email:string, organisation_key:string, share_id:string) {
    this.sent(email, organisation_key, share_id, "item");
  }

  public async messageSent(email:string, organisation_key:string, share_id:string) {
    this.sent(email, organisation_key, share_id, "message");
  }

  private async sent(email:string, organisation_key:string, share_id:string, type:string) {
      try {
        const header = BFFHelper.getHeader();
        const headers = {
          authorization: header
        };

        const req = {
          "email": email,
          "organisation_key": organisation_key,
          "share_id": share_id,
          "type": type
        };

        const url = BFFHelper.getURL() + `${bffConfig.BFF_ITEM_SHARED}`;
        const result = await this.makePostCall(url, req, headers);
        
        if (result === false) {
          throw 'BFF comms error (itemSent)';
        }

      }catch(err) {
        console.log("BFF comms error (itemSent) ", err);
        throw err;
      }
      return true;
  }


}
