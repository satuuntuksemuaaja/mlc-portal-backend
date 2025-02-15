import { SymmetricKey } from '@meeco/sdk';

export class MeecoServices {
  protected organisationKey: string;

  constructor(organisationKey: string) {
    this.organisationKey = organisationKey.toLocaleUpperCase();
  }

  private getEnvVal(prefix: string, org: string): string {
    // TODO connect to Vault and load
    const k1 = process.env[prefix + '.' + org];
    const k2 = process.env[prefix + '_' + org];

    if (k1) {
      return k1;
    }else if (k2) {
      return k2;
    }
  }

  private loadAuthToken(): string {
    // TODO connect to Vault and load
    return this.getEnvVal('KV_MEECO_TOKEN', this.organisationKey);
  }

  private loadKeyStoreToken(): string {
    // TODO connect to Vault and load
    return this.getEnvVal('KV_MEECO_KSTOKEN', this.organisationKey);
  }

  protected loadDek(): SymmetricKey {
    // TODO connect to Vault and load
    return SymmetricKey.fromSerialized(this.loadRawDek());
  }

  private loadRawDek(): string {
    // TODO connect to Vault and load
    return this.getEnvVal('KV_MEECO_DEK', this.organisationKey);
  }

  protected loadKek(): SymmetricKey {
    // TODO connect to Vault and load
    return SymmetricKey.fromSerialized(this.loadRawKek());
  }

  private loadRawKek(): string {
    // TODO connect to Vault and load
    return this.getEnvVal('KV_MEECO_KEK', this.organisationKey);
  }

  protected loadPdk(): SymmetricKey {
    // TODO connect to Vault and load
    return SymmetricKey.fromSerialized(this.loadRawPdk());
  }

  private loadRawPdk(): string {
    // TODO connect to Vault and load
    return this.getEnvVal('KV_MEECO_PDK', this.organisationKey);
  }

  private loadSecret(): string {
    // TODO connect to Vault and load
    return this.getEnvVal('KV_MEECO_PASS', this.organisationKey);
  }

  public getAuthObject() {
    return {
      vault_access_token: this.loadAuthToken(),
      oidc_token: undefined,
      delegation_id: undefined,
      data_encryption_key: this.loadDek(),
      key_encryption_key: this.loadKek(),
      keystore_access_token: this.loadKeyStoreToken(),
      passphrase_derived_key: this.loadPdk(),
      secret: this.loadSecret(),
      subscription_key: process.env['MEECO_SUBSCRIPTION_KEY']
    };
  }

  public getMeecoApiConfiguration(): MeecoApi {
    return {
      vault: {
        url: process.env['MEECO_VAULT_URL'],
        subscription_key: process.env['MEECO_SUBSCRIPTION_KEY'],
      },
      keystore: {
        url: process.env['MEECO_KEYSTORE_URL'],
        subscription_key: process.env['MEECO_SUBSCRIPTION_KEY'],
      },
      subscription_key: process.env['MEECO_SUBSCRIPTION_KEY'],
    };
  }
}

export interface MeecoApi {
  readonly vault: {
    readonly url: string;
    readonly subscription_key: string;
  };
  readonly keystore: {
    readonly url: string;
    readonly subscription_key: string;
  };
  readonly subscription_key: string;
}