GRANT USAGE ON SCHEMA mlcppapp_test TO mlcppapp;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA mlcppapp_test TO mlcppapp;

REVOKE DELETE,UPDATE("orgId") ON mlcppapp_test.agent FROM mlcppapp;
REVOKE DELETE,UPDATE("orgId","serviceId","vaultId") ON mlcppapp_test.client FROM mlcppapp;
REVOKE INSERT,DELETE,UPDATE ON mlcppapp_test.organisation FROM mlcppapp;
GRANT UPDATE("name","websiteUrl","logoThumbnail", "bffRegistered", "welcomeMessageTemplate") ON mlcppapp_test.organisation TO mlcppapp;
REVOKE DELETE,INSERT, UPDATE ON mlcppapp_test.role FROM mlcppapp;
REVOKE DELETE ON mlcppapp_test.clientterm FROM mlcppapp;
REVOKE DELETE, UPDATE ON mlcppapp_test.audit FROM mlcppapp;
REVOKE DELETE ON mlcppapp_test.activities FROM mlcppapp;