/**
 *
 * Test accounts for an organisation
 *
 */
export interface OrgTestData {
  /**
   * Valid Admin Agent
   */
  getAdminAgent(): string;

  /**
   * Valid Admin Agent from pluto org
   */
  getAdminPlutoAgent(): string;

  /**
   * Valid User Agent
   */
  getUserAgent(): string;

  /**
   * Admin Agent with status set to archived
   */
  getArchivedAdminAgent(): string;

  /**
   * User Agent with status set to archived
   */
  getArchivedUserAgent(): string;

  /**
   * Agent in B2C, but not configured in the Organisation
   */
  getNonConfiguredAgent(): string;
  /**
   * Valid User Agent from pluto org
   */
  getUserPlutoAgent(): string;
}
