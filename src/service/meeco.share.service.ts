import {
  AcceptanceRequest,
  IShareOptions,
  ShareService,
  SharingMode
} from '@meeco/sdk';
import { MeecoServices } from './meeco.service';

/**
 * Creates a new invitation record in Meeco
 */
export class MeecoShareService extends MeecoServices {
  /**
   * Shares an item
   */
  public async shareItem(itemId: string, connectionId: string) {
    const shareService = new ShareService(
      this.getMeecoApiConfiguration(),
      console.log
    );

    const options = {
      sharing_mode: SharingMode.Anyone,
      acceptance_required: AcceptanceRequest.NotRequired
    } as IShareOptions;

    const result = await shareService.shareItem(
      this.getAuthObject(),
      connectionId,
      itemId,
      options
    );

    if (result.shares && result.shares.length > 0) {
      return result.shares[0];
    }

    throw 'Share Failed';
  }

  public async reShareItem(itemId: string) {
    const shareService = new ShareService(
      this.getMeecoApiConfiguration(),
      console.log
    );
    const result = await shareService.updateSharedItem(
      this.getAuthObject(),
      itemId
    );
  }

  public async getShare(shareId: string) {
    const shareService = new ShareService(
      this.getMeecoApiConfiguration(),
      console.log
    );
    return await shareService.getSharedItem(this.getAuthObject(), shareId);
  }

}