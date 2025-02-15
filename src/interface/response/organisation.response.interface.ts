export interface OrganisationResponse {
  id: string;
  name: string;
  websiteUrl: string;
  status: string;
  primaryDomain: string;
  logoThumbnail: string;
  bffRegistered: boolean;
  key: string;
  welcomeMessageTemplate: string;
}

export interface GetOrganisationResponse {
  org: {
    id: string;
    name: string;
    websiteUrl: string;
    status: string;
    primaryDomain: string;
    logoThumbnail: string;
    signupKey: string;
    key: string;
    welcomeMessageTemplate: string;
  };
  security: {
    roles: {
      roleId: number;
      role: string;
    };
  };
}

export interface PublicGetOrganisationResponse {
  name: string;
  key: string;
}
