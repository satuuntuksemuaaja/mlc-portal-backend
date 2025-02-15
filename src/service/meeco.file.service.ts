import {
  DecryptedItem,
  ItemService,
  ItemUpdate,
  SymmetricKey,
  vaultAPIFactory
} from '@meeco/sdk';
import { MeecoServices } from './meeco.service';
import { EncryptionKey } from '@meeco/cryppo';
import { AttachmentService } from '@meeco/file-storage-node';

/**
 * Creates a new invitation record in Meeco
 */
export class MeecoAttachmentService extends MeecoServices {
  /**
   *
   * @param filePath The path to the file on disk
   * @param fileName The name of the file e.g. clouds.png
   * @param item The item to attach the file to
   */
  async upload(filePath: string, fileName: string, item: DecryptedItem) {
    console.log('start upload');

    const dek = EncryptionKey.generateRandom();

    const uploadedFile = await new AttachmentService(
      this.getMeecoApiConfiguration().vault.url
    ).upload({
      filePath: filePath,
      authConfig: this.getAuthObject(),
      key: dek
    });

    console.log('Upload complete', uploadedFile);

    // todo migrate applyClassificationToSlot to here?
    const itemUpdateData = new ItemUpdate(item.id, {
      slots: [
        {
          label: '',
          name: fileName,
          description: fileName,
          slot_type_name: 'attachment',
          attachment_id: uploadedFile.id,
          value: dek.serialize
        }
      ],
      label: item.label
    });

    const itemService: ItemService = new ItemService(
      this.getMeecoApiConfiguration()
    );
    try {
      console.log('Updating Item with attachment slot data');

      const updated = await itemService.update(
        this.getAuthObject(),
        itemUpdateData
      );

      console.log('Update Complete');

      return updated;
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  async download(attachmentId: string, key: EncryptionKey) {
    console.log('start download', attachmentId);

    const uploadedFile = await new AttachmentService(
      this.getMeecoApiConfiguration().vault.url
    ).download({
      id: attachmentId,
      key: key,
      authConfig: this.getAuthObject()
    });

    console.log('end download');

    return uploadedFile;
  }

  public async delete(attachmentId: string) {
    const vaf = vaultAPIFactory(this.getMeecoApiConfiguration());
    const attachmentAPI = vaf(this.getAuthObject()).AttachmentApi;
    await attachmentAPI.attachmentsIdDelete(attachmentId);
  }
}

export default MeecoAttachmentService;
