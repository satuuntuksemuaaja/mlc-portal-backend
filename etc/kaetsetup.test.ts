// import { MeecoInvitationService } from '../../src/service/meeco.invitation.service';
// import { MeecoConnectionService } from '../../src/service/meeco.connection.service';
// import { MeecoItemService } from '../../src/service/meeco.item.service';
// import { MeecoShareService } from '../../src/service/meeco.share.service';
// import { MeecoAttachmentService } from '../../src/service/meeco.file.service';

// import {
//   SymmetricKey,
//   vaultAPIFactory,
//   InvitationService,
//   ItemService,
//   ShareService
// } from '@meeco/sdk';

// describe('KATE setup test', () => {
//   beforeAll(() => {});

//   it('KATE setup test', async () => {
//     const kateAuth = {
//       vault_access_token: 'Mp99weW22_t8wR7x6Sat',
//       oidc_token: undefined,
//       delegation_id: undefined,
//       data_encryption_key: SymmetricKey.fromSerialized(
//         'Q4DTmlsb8e4FXfMLlmSn7wn6bGlI4-3VMLR_MQjL7k4='
//       ),
//       key_encryption_key: SymmetricKey.fromSerialized(
//         'KoYKn1OT6oc6Akeixj_cISxZTQLCTgnDlROFBmoR6dA='
//       ),
//       keystore_access_token:
//         'xDpMB_UUrw_gvRcbdsJbYxulyjIFnIoQuhudNKLa9DM=.rAWCbZBURmIdUN8EA5gWkVcnaj5FzGKWYuUSz9cjcp0=',
//       passphrase_derived_key: SymmetricKey.fromSerialized(
//         'R2V6H3TKExyeom8rT4kChy-p69gYDr_Cyj-KZ8FIhC8='
//       ),
//       secret:
//         '1.w9rz79.NF8qfU-VCvz4b-oTYbs9-WTttLQ-q5TfgU-Z49PZj-78UvAw-cw2smA-zb4y2B-F76JcC-8rd'
//     };

//     const meeco = {
//       vault: {
//         url: 'https://sandbox.meeco.me/vault',
//         subscription_key: '24651cc96ff94b1b9751a0a1a5fc3de1'
//       },
//       keystore: {
//         url: 'https://sandbox.meeco.me/keystore',
//         subscription_key: '24651cc96ff94b1b9751a0a1a5fc3de1'
//       }
//     };

//     // Run once.

//     // const m = new MeecoInvitationService('ACME');
//     // const res = await m.invite('Kate');
//     // const invs = new InvitationService(meeco);
//     // const result = await invs.accept(
//     //   kateAuth,
//     //   "Acme",
//     //   res.token
//     // );
//     // expect(true).toBe(true);

//     const acmeConnections = await new MeecoConnectionService('ACME').loadAll();
//     acmeConnections.connections.forEach((e) => {
//       console.log('-------------------------');
//       console.log(e.own, e.the_other_user);
//       console.log('-------------------------');
//     });
//   });
// });
