import { Connection, ItemsResponse, Share } from '@meeco/vault-api-sdk';
import {
  DecryptedItem,
  DecryptedKeypair,
  ItemService,
  keystoreAPIFactory,
  ShareService,
  ShareType,
  SlotHelpers,
  SymmetricKey,
  vaultAPIFactory
} from '@meeco/sdk';
import { MeecoServices } from './meeco.service';
import { MeecoItemConversion } from '../meeco/item/item.conversion';
import { MeecoItem } from '../meeco/item/item.model';
import { from } from 'rxjs';
import {map} from 'rxjs/operators';
import { v5 as uuidv5 } from 'uuid';
/**
 * Creates a new invitation record in Meeco
 */
export class MeecoItemService extends MeecoServices {
  // structure - system_itemtype
  private readonly msg_classification: string = 'mlcpp_msg';
  private readonly file_classification: string = 'mlcpp_file';

  private readonly CONNECTION_SEED = '1b671a64-40d5-491e-99b0-da01ff1f3341';

  public async createItem(name: string, notes: string): Promise<DecryptedItem> {
    const slots = [];
    slots.push({ name: 'name', label: 'name', value: name });
    slots.push({ name: 'notes', label: 'notes', value: notes });

    const encslots = await Promise.all(
      slots.map((slot) => {
        return SlotHelpers.encryptSlot(
          {
            data_encryption_key: this.getAuthObject().data_encryption_key
          },
          slot
        );
      })
    );

    const vaf = vaultAPIFactory(this.getMeecoApiConfiguration());
    const itemApi = vaf(this.getAuthObject()).ItemApi;

    const item = await itemApi.itemsPost({
      template_name: 'custom',
      item: {
        label: 'ppgenericitem',
        slots_attributes: encslots,
        classification_nodes_attributes: [
          {
            node_name: this.file_classification,
            scheme_name: 'tag'
          }
        ]
      }
    });

    const itemService = new ItemService(this.getMeecoApiConfiguration());
    return await itemService.get(this.getAuthObject(), item.item.id);
  }

  public async getItem(id: string): Promise<DecryptedItem> {
    const itemService = new ItemService(this.getMeecoApiConfiguration());
    const item = await itemService.get(this.getAuthObject(), id);
    return item;
  }

  public async getItems(): Promise<ItemsResponse> {
    const itemService = new ItemService(this.getMeecoApiConfiguration());
    const items = await itemService.listAll(this.getAuthObject());
    return items;
  }

  /** Checks if the item is shared with a connection */
  public async hasSharedItemWithUser(
    itemId: string,
    otherUserId: string
  ): Promise<boolean> {
    return this.getSharedItemWithUser(itemId, otherUserId) != null;
  }

  public async getSharedItemWithUser(
    itemId: string,
    otherUserId: string
  ): Promise<Share> {
    const vaf = vaultAPIFactory(this.getMeecoApiConfiguration());
    const shareApi = vaf(this.getAuthObject()).SharesApi;
    const shareList = await shareApi.outgoingSharesGet(undefined, undefined, [
      itemId
    ]);
    if (shareList?.shares?.length > 0) {
      const found = shareList.shares.find(
        (e) => e.recipient_id === otherUserId
      );
      return found;
    }
  }  

  public async getItemsSharedWithConnection(
    connectionId: string
  ): Promise<MeecoItem[]> {
    const classificationNodes: string[] = [this.file_classification];
    const items = await this._getItemsSharedWithConnection(
      connectionId,
      classificationNodes
    );

    return await new MeecoItemConversion().convertItems(
      items,
      this.getAuthObject().data_encryption_key
    );
  }

  public async getItemsSharedFromConnection(
    otherUserId: string
  ): Promise<MeecoItem[]> {
    const convertor = new MeecoItemConversion();
    const retData = [];
    const ss = new ShareService(this.getMeecoApiConfiguration());
    const classificationNodes: string[] = ['ad','jn'];

    const items = await this._getItemsSharedFromConnection(otherUserId, classificationNodes);

    // FIXME: horrible loads and conversions. Load all and then load 1 by 1 - yuk
    const allShares = await new ShareService(
      this.getMeecoApiConfiguration()
    ).listAll(this.getAuthObject(), ShareType.Incoming);

    //FIXME: Safer
    return await from(
      Promise.all(
        items.items.map(
          async (i) =>
            (
              await ss.getSharedItem(
                this.getAuthObject(),
                allShares.find((s) => s.item_id === i.original_id).id
              )
            ).item
        )
      )
    )
      .pipe(map((d) => d.map((di) => convertor.convert(di))))
      .toPromise();
  }

  private async _getItemsSharedFromConnection(
    otherUserId: string,
    classificationNodes: string[]
  ): Promise<ItemsResponse> {
    const itemService = new ItemService(this.getMeecoApiConfiguration());
    return itemService.list(this.getAuthObject(), {
      ownerId: otherUserId,
      classifications: classificationNodes,
      own: false
    });
  }

  private async _getItemsSharedWithConnection(
    connectionId: string,
    classificationNodes: string[]
  ): Promise<ItemsResponse> {
    const itemService = new ItemService(this.getMeecoApiConfiguration());
    return itemService.list(this.getAuthObject(), {
      classifications: classificationNodes,
      sharedWith: connectionId,
      own: true
    });
  }

  public async deleteItem(itemId: string) {
    const vaf = vaultAPIFactory(this.getMeecoApiConfiguration());
    await vaf(this.getAuthObject()).ItemApi.itemsIdDelete(itemId);
  }

  public async getShareDEK(share: Share): Promise<SymmetricKey> {
    let dataEncryptionKey: SymmetricKey;

    if (share.encrypted_dek) {
      const kaf = keystoreAPIFactory(this.getMeecoApiConfiguration());
      let kpres = null;
      try {
        kpres = await kaf(this.getAuthObject()).KeypairApi.keypairsIdGet(
          share.keypair_external_id!
        );
      } catch (err) {
        if (err?.status === 404) {
          kpres = await kaf(
            this.getAuthObject()
          ).KeypairApi.keypairsExternalIdExternalIdGet(
            share.keypair_external_id!
          );
        } else {
          throw err;
        }
      }

      const decryptedPrivateKey = await DecryptedKeypair.fromAPI(
        this.getAuthObject().key_encryption_key,
        kpres.keypair
      ).then((k) => k.privateKey);

      dataEncryptionKey = await decryptedPrivateKey.decryptKey(
        share.encrypted_dek
      );
    } else {
      dataEncryptionKey = this.getAuthObject().data_encryption_key;
    }

    return dataEncryptionKey;
  }

  private getConnectionClassificationNode(connection: Connection) {
    return (
      'mlcppmsg_def_channel' +
      uuidv5(
        [
          connection?.own.id ? connection?.own.id : '',
          connection?.the_other_user.id ? connection?.the_other_user.id : ''
        ]
          .sort()
          .join('$$$$$$'),
        this.CONNECTION_SEED
      )
    );
  }

  /**
   *
   * @param message The text message in HTML format to send
   * @param connection  The connection to send the Message to
   * @param additionalSlots The additional slots to add
   * @returns
   */
  async createMessage(connection: Connection, message: string, sentBy: string) {
    const slots = [];

    slots.push({ name: 'message', label: 'message', value: message });
    slots.push({ name: 'sentby', label: 'sentby', value: sentBy });
    //slots.push({ name: 'time', label: 'time', value: time. });
    slots.push({ name: 'messagetype', label: 'messagetype', value: 'msg' });

    const encslots = await Promise.all(
      slots.map((slot) => {
        return SlotHelpers.encryptSlot(
          {
            data_encryption_key: this.getAuthObject().data_encryption_key
          },
          slot
        );
      })
    );

    const vaf = vaultAPIFactory(this.getMeecoApiConfiguration());
    const itemApi = vaf(this.getAuthObject()).ItemApi;

    const item = await itemApi.itemsPost({
      template_name: 'custom',
      item: {
        label: 'ppmessage',
        slots_attributes: encslots,
        classification_nodes_attributes: [
          {
            node_name: this.getConnectionClassificationNode(connection),
            scheme_name: 'tag'
          }
        ]
      }
    });

    const itemService = new ItemService(this.getMeecoApiConfiguration());
    return await itemService.get(this.getAuthObject(), item.item.id);
  }

  public async getMessages(connection: Connection, nextPageAfter?: string) {
    const vaf = vaultAPIFactory(this.getMeecoApiConfiguration());

    const itemApi = vaf(this.getAuthObject()).ItemApi;
    const classificationNodes: string =
      this.getConnectionClassificationNode(connection);

    console.log('classificationNodes', classificationNodes);

    if (nextPageAfter) {
      return await itemApi.itemsGet(
        undefined,
        undefined,
        undefined,
        classificationNodes,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        nextPageAfter,
        20
      );
    }
    return await itemApi.itemsGet(
      undefined,
      undefined,
      undefined,
      classificationNodes,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      20
    );
  }
}
