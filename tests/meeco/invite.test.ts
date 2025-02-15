import { OrganizationService } from '@meeco/sdk';
import { MeecoInvitationService } from '../../src/service/meeco.invitation.service';

describe('Create Invitation Tests', () => {
  beforeAll(async () => {
    jest.setTimeout(600000);
  });

  it('Invitation Test', async () => {
    const m = new MeecoInvitationService('ACME');
    const res = await m.invite('test123');

    expect(
      await m
        .getAuthObject()
        .data_encryption_key.decryptString(res.encrypted_recipient_name)
    ).toBe('test123');

    m.delete(res.id);
  });
});
