---------------------------------------------Organisation---------------------------------------------
--Acme ORG
INSERT INTO mlcppapp.organisation
("id", "status", "serviceId", "name", "websiteUrl", "primaryDomain", "signupKey", "key", "bffRegistered", "logoThumbnail")
VALUES('cd0bcea6-551d-11ed-bdc3-0242ac120002', 'active', NULL, 'ACME', 'https://www.acme.com', '@gmail.com', 'abcd1234', 'acme', false, NULL);


---------------------------------------------Roles---------------------------------------------

-- ACME ROLES
INSERT INTO mlcppapp.role
("id", "orgId", "name", "created", "lastModified")
VALUES(1001, 'cd0bcea6-551d-11ed-bdc3-0242ac120002', 'User', NULL, NULL);

INSERT INTO mlcppapp.role
("id", "orgId", "name", "created", "lastModified")
VALUES(1002, 'cd0bcea6-551d-11ed-bdc3-0242ac120002', 'Administrator', NULL, NULL);

---------------------------------------------Agent---------------------------------------------

-- Admin Agent for Acme ORG
INSERT INTO mlcppapp.agent
("id", "roleId", "orgId", "name", "email", "status", "photo", "created", "lastModified")
VALUES('353f8c6a-551e-11ed-bdc3-0242ac120002', 1002, 'cd0bcea6-551d-11ed-bdc3-0242ac120002', 'Acme Admin agent', 'ryanhendo+pp-acme-admin@gmail.com', 'active', '', now(), now());

-- User Agent for Acme ORG
INSERT INTO mlcppapp.agent
("id", "roleId", "orgId", "name", "email", "status", "photo", "created", "lastModified")
VALUES('55adee42-551e-11ed-bdc3-0242ac120002', 1001, 'cd0bcea6-551d-11ed-bdc3-0242ac120002', 'Acme User agent', 'ryanhendo+pp-acme-user@gmail.com', 'active', '', now(), now());

-- Archived Admin Agent for Acme ORG
INSERT INTO mlcppapp.agent
("id", "roleId", "orgId", "name", "email", "status", "photo", "created", "lastModified")
VALUES('71c0c4c4-551e-11ed-bdc3-0242ac120002', 1002, 'cd0bcea6-551d-11ed-bdc3-0242ac120002', 'Archived Acme Admin Agent', 'ryanhendo+pp-acme-archivedadmin@gmail.com', 'archived', '', now(), now());

-- Archived User Agent for Acme ORG
INSERT INTO mlcppapp.agent
("id", "roleId", "orgId", "name", "email", "status", "photo", "created", "lastModified")
VALUES('7af7f526-551e-11ed-bdc3-0242ac120002', 1001, 'cd0bcea6-551d-11ed-bdc3-0242ac120002', 'Archived Acme User Agent', 'ryanhendo+pp-acme-archiveduser@gmail.com', 'archived', '', now(), now());