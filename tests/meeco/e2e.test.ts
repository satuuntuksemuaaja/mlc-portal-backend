import { MeecoInvitationService } from '../../src/service/meeco.invitation.service';
import { MeecoConnectionService } from '../../src/service/meeco.connection.service';
import { MeecoItemService } from '../../src/service/meeco.item.service';
import { MeecoShareService } from '../../src/service/meeco.share.service';
import { MeecoAttachmentService } from '../../src/service/meeco.file.service';
import { EncryptionKey } from '@meeco/cryppo';

import {
  SymmetricKey,
  vaultAPIFactory,
  InvitationService,
  ItemService,
  ShareService
} from '@meeco/sdk';

import fs from 'fs';

describe('Create E2E Test', () => {
  beforeAll(() => {});

  it('E2E Test', async () => {
    const tomAuth = {
      vault_access_token: 'hMdTXcvyj7KiUUixRcQJ',
      oidc_token: undefined,
      delegation_id: undefined,
      data_encryption_key: SymmetricKey.fromSerialized(
        'JC86OiU_Tc65lw_ebYpoLS13BfCRok1ESgxZlxw-Qzs='
      ),
      key_encryption_key: SymmetricKey.fromSerialized(
        '72QhQwmhp8pftcqKElHy4PgM-NMvsfdMubmhiDO5slg='
      ),
      keystore_access_token:
        '5xh9y_LkDc4Y7c69M4_3Yjiaa1-_fS9rFEXo0LH9H1U=.A-fkS1meRuYCEimTUgbVh3Lhy_FT4zOCwdCTrlYl14k=',
      passphrase_derived_key: SymmetricKey.fromSerialized(
        'H7Ty7xb-5qEDU13Gqe68L04VNiH9zgIBCb6tZtbIUSs='
      ),
      secret:
        '1.P9GxY1.894dKW-uLYEwW-PpDT55-Er42p8-KShs6P-x9y6pa-LaXACJ-cCvznt-MBrdp3-5wNwpA-5iiSTH'
    };

    const meeco = {
      vault: {
        url: 'https://sandbox.meeco.me/vault',
        subscription_key: '24651cc96ff94b1b9751a0a1a5fc3de1'
      },
      keystore: {
        url: 'https://sandbox.meeco.me/keystore',
        subscription_key: '24651cc96ff94b1b9751a0a1a5fc3de1'
      }
    };

    const vaf = vaultAPIFactory(meeco);

    // USER IDS
    // ---------
    // ACME: 98db8f9d-2f35-4e2b-93d8-4fd07e247de0
    // TOM: 227744e0-c70f-4e26-a32c-a8c4ddd28025
    const tomId = '227744e0-c70f-4e26-a32c-a8c4ddd28025';
    const tomConnApi = vaf(tomAuth).ConnectionApi;

    // cleanup
    let tomsConnections = await tomConnApi.connectionsGet();
    console.log(tomsConnections);
    const connection = tomsConnections.connections.find(
      (e) => e.the_other_user.user_id === '98db8f9d-2f35-4e2b-93d8-4fd07e247de0'
    );
    if (connection) {
      console.log('DELETING EXISTING');
      await tomConnApi.connectionsIdDelete(connection.own.id);
      tomsConnections = await tomConnApi.connectionsGet();
      const emptyconnection = tomsConnections.connections.find(
        (e) =>
          e.the_other_user.user_id === '98db8f9d-2f35-4e2b-93d8-4fd07e247de0'
      );
      expect(emptyconnection).toBeUndefined();
    }

    const m = new MeecoInvitationService('ACME');
    const res = await m.invite('test123');

    // now accept as Tom -- manual accept here as we currently don't support in bound connections.

    const invs = new InvitationService(meeco);
    // try {
    const result = await invs.accept(tomAuth, 'Acme', res.token);

    // tom
    tomsConnections = await vaf(tomAuth).ConnectionApi.connectionsGet();
    console.log(tomsConnections);
    const newConnToAcme = tomsConnections.connections.find(
      (e) => e.the_other_user.user_id === '98db8f9d-2f35-4e2b-93d8-4fd07e247de0'
    );
    expect(newConnToAcme).toBeDefined();
    expect(newConnToAcme?.own.id).toBeDefined();

    // acme
    const acmeConnections = await new MeecoConnectionService('ACME').loadAll();
    console.log(acmeConnections);
    const newConnToTom = acmeConnections.connections.find(
      (e) => e.the_other_user.user_id === '227744e0-c70f-4e26-a32c-a8c4ddd28025'
    );
    expect(newConnToTom).toBeDefined();
    expect(newConnToTom?.own.id).toBeDefined();

    // ACME Creatting a new item
    const mis = new MeecoItemService('ACME');
    const item = await mis.createItem('test item', 'notes here');
    console.log(item);

    // attach files (TBC)
    const mas = new MeecoAttachmentService('ACME');
    const f = await mas.upload('etc/a.png', 'test.png', item);

    const reloaded = await mis.getItem(item.id);
    console.log(reloaded);

    const slot = reloaded.slots.find((e) => e.attachment_id);
    const dl = await mas.download(
      reloaded.attachments[0].id,
      EncryptionKey.fromSerialized(slot?.value ? slot?.value : '')
    );

    const path = '/tmp/a-dl.png';
    fs.createWriteStream(path).write(dl.data);

    // share with tom
    const shrSvc = new MeecoShareService('ACME');

    expect(await mis.hasSharedItemWithUser(item.id, tomId)).toBe(false);
    const shr = await shrSvc.shareItem(
      item.id,
      newConnToTom?.own.id ? newConnToTom?.own.id : ''
    );

    console.log(shr);

    // verify outbound share
    expect(shr).toBeDefined();
    expect(shr.id).toBeDefined();
    expect(shr.item_id).toBe(item.id);
    expect(shr.owner_id).toBe(newConnToTom?.own.user_id);
    expect(shr.recipient_id).toBe(newConnToTom?.the_other_user.user_id);

    // verify inbond share
    const shareService = new ShareService(meeco);
    const tomShare = await shareService.getSharedItem(tomAuth, shr.id);
    expect(tomShare).toBeDefined();
    console.log(tomShare);

    // verify via api lookup
    expect(await mis.hasSharedItemWithUser(item.id, tomId)).toBe(true);

    const id = newConnToTom?.the_other_user?.user_id
      ? newConnToTom?.the_other_user?.user_id
      : '';
    const items = await mis.getItemsSharedWithConnection(id);

    const found = items.find((e) => e.id === item.id);
    expect(found).toBeDefined();
    if (found) {
      expect(found.attachments).toBeDefined();
      expect(found.attachments.length).toBe(1);
    }

    const reloaded2 = await mis.getItem(item.id);
    console.log(reloaded2);

    expect(reloaded).toBeDefined();
  });
});
