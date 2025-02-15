import { MeecoInvitationService } from '../../src/service/meeco.invitation.service';
import { MeecoConnectionService } from '../../src/service/meeco.connection.service';
import { MeecoItemService } from '../../src/service/meeco.item.service';
import { MeecoShareService } from '../../src/service/meeco.share.service';
import { v5 as uuidv5 } from 'uuid';

import {
  SymmetricKey,
  vaultAPIFactory,
  InvitationService,
  ShareService,
  SlotHelpers,
  SharingMode,
  AcceptanceRequest,
  IShareOptions,
  _cryppoService
} from '@meeco/sdk';

const fs = require('fs');
const seed = '1b671a64-40d5-491e-99b0-da01ff1f3341';

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

async function createAndShareMessage(
  message: string,
  connIdFrom: string,
  connIdTo: string,
  auth
) {
  const slots = [];

  slots.push({ name: 'message', label: 'message', value: message });

  const encslots = await Promise.all(
    slots.map((slot) => {
      return SlotHelpers.encryptSlot(
        {
          data_encryption_key: auth.data_encryption_key
        },
        slot
      );
    })
  );

  const key = [connIdFrom, connIdTo].sort().join('$$$$$$');

  const vaf = vaultAPIFactory(meeco);
  const itemApi = vaf(auth).ItemApi;

  const item = await itemApi.itemsPost({
    template_name: 'custom',
    item: {
      label: 'ppmessage',
      slots_attributes: encslots,
      classification_nodes_attributes: [
        {
          node_name: 'mlcpp_msg',
          scheme_name: 'tag'
        },
        {
          node_name: 'mlcpp_msg' + uuidv5(key, seed),
          scheme_name: 'tag'
        }
      ]
    }
  });

  const shareService = new ShareService(meeco, console.log);

  const options = {
    sharing_mode: SharingMode.Owner,
    acceptance_required: AcceptanceRequest.NotRequired
  } as IShareOptions;

  const result = await shareService.shareItem(
    auth,
    connIdFrom,
    item.item.id,
    options
  );

  if (result.shares && result.shares.length > 0) {
    return result.shares[0];
  }
}

describe('Messages Test', () => {
  beforeAll(() => {});

  it('load Test', async () => {
    const vaf = vaultAPIFactory(meeco);
    const api = vaf(tomAuth).ItemApi;

    const acmeConnections = await new MeecoConnectionService('ACME').loadAll();
    console.log(acmeConnections);
    const newConnToTom = acmeConnections.connections.find(
      (e) => e.the_other_user.user_id === '227744e0-c70f-4e26-a32c-a8c4ddd28025'
    );
    expect(newConnToTom).toBeDefined();
    expect(newConnToTom?.own.id).toBeDefined();

    const classificationnode =
      'mlcppmsg_def_channel' +
      uuidv5(
        [
          newConnToTom?.own.id ? newConnToTom?.own.id : '',
          newConnToTom?.the_other_user.id ? newConnToTom?.the_other_user.id : ''
        ]
          .sort()
          .join('$$$$$$'),
        seed
      );

    const resp = await api.itemsGet(
      undefined,
      undefined,
      undefined,
      classificationnode,
      undefined,
      '',
      '',
      undefined,
      undefined,
      undefined,
      3
    );
    console.log(resp);
  });

  it('E2E Test', async () => {
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
    const res = await m.invite('tom new conn');

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

    const shrSvc = new MeecoShareService('ACME');
    // ACME Creatting a new item
    const mis = new MeecoItemService('ACME');

    await createAndShareMessage(
      'Message 1',
      newConnToTom?.own.id ? newConnToTom?.own.id : '',
      newConnToTom?.the_other_user.id ? newConnToTom?.the_other_user.id : '',
      mis.getAuthObject()
    );
    await createAndShareMessage(
      'Reply 1',
      newConnToTom?.the_other_user.id ? newConnToTom?.the_other_user.id : '',
      newConnToTom?.own.id ? newConnToTom?.own.id : '',
      tomAuth
    );

    await createAndShareMessage(
      'Message 2',
      newConnToTom?.own.id ? newConnToTom?.own.id : '',
      newConnToTom?.the_other_user.id ? newConnToTom?.the_other_user.id : '',
      mis.getAuthObject()
    );
    await createAndShareMessage(
      'Reply 2',
      newConnToTom?.the_other_user.id ? newConnToTom?.the_other_user.id : '',
      newConnToTom?.own.id ? newConnToTom?.own.id : '',
      tomAuth
    );

    await createAndShareMessage(
      'Message 3',
      newConnToTom?.own.id ? newConnToTom?.own.id : '',
      newConnToTom?.the_other_user.id ? newConnToTom?.the_other_user.id : '',
      mis.getAuthObject()
    );
    await createAndShareMessage(
      'Reply 3',
      newConnToTom?.the_other_user.id ? newConnToTom?.the_other_user.id : '',
      newConnToTom?.own.id ? newConnToTom?.own.id : '',
      tomAuth
    );

    // share with tom
    // expect(await mis.hasSharedItemWithUser(item.id, tomId)).toBe(false);
    // const shr = await shrSvc.shareItem(item.id, newConnToTom?.own.id ? newConnToTom?.own.id : "");
    // console.log(shr);

    // // verify outbound share
    // expect(shr).toBeDefined();
    // expect(shr.id).toBeDefined();
    // expect(shr.item_id).toBe(item.id);
    // expect(shr.owner_id).toBe(newConnToTom?.own.user_id);
    // expect(shr.recipient_id).toBe(newConnToTom?.the_other_user.user_id);

    // verify inbond share
    // const shareService = new ShareService(meeco);
    // const tomShare = await shareService.getSharedItem(tomAuth, shr.id);
    // expect(tomShare).toBeDefined();
    // console.log(tomShare);

    // verify via api lookup
    // expect(await mis.hasSharedItemWithUser(item.id, tomId)).toBe(true);

    // const id = (newConnToTom?.the_other_user?.user_id ? newConnToTom?.the_other_user?.user_id : "")
    // const items = await mis.getItemsSharedWithConnection(id);

    // const found = items.find(e => e.id === item.id);
    // expect(found).toBeDefined();
    // if (found) {
    //   expect(found.attachments).toBeDefined();
    //   expect(found.attachments.length).toBe(1);
    // }

    // const reloaded2 = await mis.getItem(item.id);
    // console.log(reloaded2);

    // expect(reloaded).toBeDefined();
  });
});
