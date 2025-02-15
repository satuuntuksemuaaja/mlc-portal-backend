import { OrganizationService } from '@meeco/sdk';
import { MeecoServices } from '../../src/service/meeco.service';

describe('Correct Key Conversion', () => {
  beforeAll(async () => {
    jest.setTimeout(600000);
  });

  it('Decrypt Keys', async () => {
    const m = new MeecoServices('ACME');
    const auth = m.getAuthObject();

    const orig = 'test 123 $#';

    expect(
      await auth.passphrase_derived_key.decryptString(
        await auth.passphrase_derived_key.encryptString(orig)
      )
    ).toBe(orig);
    expect(
      await auth.data_encryption_key.decryptString(
        await auth.data_encryption_key.encryptString(orig)
      )
    ).toBe(orig);
    expect(
      await auth.key_encryption_key.decryptString(
        await auth.key_encryption_key.encryptString(orig)
      )
    ).toBe(orig);
  });
});
