
-- Grant access on prob DB to user
GRANT CONNECT ON DATABASE DB_NAME TO USER_NAME;

-- Schema for prob DB
CREATE SCHEMA SCHEMA_NAME;

-- Grant usage on schema to user
GRANT USAGE ON SCHEMA SCHEMA_NAME TO USER_NAME;

-- Grant access to perform CRUD opeartion on all the table on scheam to user
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA SCHEMA_NAME TO USER_NAME;
