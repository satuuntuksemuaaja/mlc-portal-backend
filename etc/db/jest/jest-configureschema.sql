GRANT CONNECT ON DATABASE mlcpp TO mlcppapp;

CREATE SCHEMA "mlcppapp_test";

GRANT USAGE ON SCHEMA mlcppapp_test TO mlcppapp;

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA mlcppapp_test TO mlcppapp;