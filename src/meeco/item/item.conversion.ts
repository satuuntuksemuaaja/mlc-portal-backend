import { MeecoItem } from './item.model';
import { DecryptedItem } from '@meeco/sdk';
import { ItemsResponse } from '@meeco/vault-api-sdk';
import { MimeHelper } from '../../util/mime';

export class MeecoItemConversion {
  /**
   * Converts a meeco item to a generic item.
   * @param item the meeco item
   * @returns an item
   */
  convert(item: DecryptedItem): MeecoItem {
    const converted = {
      label: item.label ? item.label : null,
      id: item.id ? item.id : null,
      shareId: item.share_id ? item.share_id : null,
      ownerId: item.owner_id ? item.owner_id : null,
      own: item.own ? item.own : null,
      created: item.item?.created_at ? item.item.created_at : null,
      modified: item.item?.updated_at ? item.item.updated_at : null,
      classifications: [],
      values: [],
      attachments: []
    } as MeecoItem;

    item.classification_nodes.forEach((e) => {
      converted.classifications.push(e.name);
    });

    item.slots?.forEach((slot) => {
      if (slot.slot_type_name !== 'attachment') {
        // dont push attachment slots down as values
        converted.values.push({
          k: slot.name,
          v: slot.value
        });
      }
    });

    if (item.attachments) {
      item.attachments.forEach((att) => {
        converted.attachments.push({
          id: att.id,
          mime:
            att.content_type === 'text/plain'
              ? MimeHelper.getMime(att.filename)
              : att.content_type,
          name: att.filename,
          itemId: item.id,
          own: item.own
        });
      });
    }
    return converted;
  }

  async convertItems(items: ItemsResponse, dek): Promise<MeecoItem[]> {
    console.log(items.items);
    const decrypted = await Promise.all(
      items.items.map((i) => {
        const slots = items.slots.filter((s) => s.item_id == i.id);
        const attachSlots = slots?.filter((s) => s.attachment_id);

        if (i.own) {
          return DecryptedItem.fromAPI(
            { data_encryption_key: dek },
            {
              attachments: items.attachments.filter((e) =>
                attachSlots.find((s) => s.attachment_id === e.id)
              ),
              classification_nodes: items.classification_nodes.filter((e) =>
                i.classification_node_ids.find((cn) => cn === e.id)
              ),
              item: i,
              slots: items.slots.filter((e) => e.item_id === i.id),
              thumbnails: items.thumbnails
            }
          ).then(e => this.convert(e));
        }else {
          const mi = {
            label: i.label ? i.label : null,
            id: i.id ? i.id : null,
            shareId: i.share_id ? i.share_id : null,
            ownerId: i.owner_id ? i.owner_id : null,
            own: false,
            created: i?.created_at ? i.created_at : null,
            modified: i?.updated_at ? i.updated_at : null,
            classifications: [],
            values: [],
            attachments: []            
          } as MeecoItem;

          return new Promise<MeecoItem>((resolve, reject) => {
              resolve(mi);
          }).then(e => e);
        }
      })
    );

    return decrypted;
  }
}
