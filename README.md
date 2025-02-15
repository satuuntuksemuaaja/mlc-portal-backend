# My life capsule
My life capsule created on mvc pattern with node,azure function,postgres and sequelize written in typescript

# Prerequisite
- node (14.20.0)
- typescript (4.7.4)
- azure function core tools (3.11.0)
- postgres 
- sequelize-cli

# Installation
- install Azure Functions Core Tools
  - https://docs.microsoft.com/en-us/azure/azure-functions/functions-run-local?tabs=v4%2Cmacos%2Ccsharp%2Cportal%2Cbash#install-the-azure-functions-core-tools
- `npm i -g azure-function-core-tools`
- `npm install`

# Running functions locally
- `npm start`

# Unit Testing
 - Install a fresh instance of postgres, or ensure you can connect locallly using `psql postgres`
 - `npm run jest`
  - First, this will delete and re-build the database
  - Second, this will run all the test cases in the project.

# Production database setup
 - Install a fresh instance of postgres, or ensure you can connect using `psql postgres`
 - `npm run prodbsetup`
  - First, this will take the postgres host, user name, password, db name and schema as input.
  - Second, this will create production user, databse, db schema and tables with respect to input values.

## Sequelize & Database Setup (DEV)
- npm install --save-dev sequelize-cli
- Install postgres locally
 - Mac: brew install postgresql
 - brew services start postgresql
- Install DB and Sample data 
 - psql postgres
 - Run queries in etc\db\SETUP.sql
 - Install sample data etc\db\test-data.sql

# Setup local environment
- run `npm i`
- run `sudo npm install -g azurite`
- run `azurite -s -l c:\azurite -d c:\azurite\debug.log` everytime before `npm start`
- run `npm run localdbsetup`
- change db schema in `local.setting.json` to mlcppapp_test
- run npm start 
  - # implementation 
  - https://bitbucket.org/ryanhendmlc/mlc-partner-portal-back-end/src/master/setup-video/

# How to do logging?
- Import `azure-function-log-intercept`
`import intercept from 'azure-function-log-intercept';`

- Intercept the context
    
    module.exports = async function (context) {
        intercept(context);// console.log works now!
    };
    
- Write consoles like you normally do
    `console.log('Logging something')`

# Formating
- to format the code we'll be using eslint.

    To run linter run - `npm run lint`

    To run and fix lint issues - `npm run lint-and-fix`

# Folder structure
  -- [project folder]
        - [azure function]  -> all the azure function will be present on root
        - [dist]  -> this will contain all the script file
        - [etc] -> all the extra data such as database
        - [src]
          - [config] -> all the configuration file where needed like database configuration
          - [controller] -> all the controller files as per model to handels all the routes
          - [images] -> this folder will contain all the images
          - [logger] -> log files
          - [migration] -> all the migration files for database
          - [model] -> all the models of all the table we will create in database
          - [repository] -> all the files to perform opertaion on database as per models
          - [request] -> to create and extend the request 
          - [response] -> to create the schema for the request
          - [service] -> all the service file for controller
          - [util] -> all the file with the code which is used in multiple places
          - config.js -> configuration as per enviornment like development,staging,production

# Database Scripts
- To generate the datebase for different enviornment run `basedbsetup`
- Enter enviornment you creating. it will create folder with enviornment name along with some files
- Enter host,user,password,database,schema
  - # note
  - Default it will create with localhost

# HTTP Error codes
- 400 Bad Request
- 401 Unauthorized
- 403 Forbidden
- 404 Not Found
- 409 Conflict
- 422 Unprocessable Entity
- 500 Internal Server Error
- 503 Service Unavailable

# Joi validation
create joi validation for request body,params and query with the entity name,type,length,required,optional etc.you can see some exaple in src/joiValidation

# Bff Integration
- To run bff API make sure have bff token and pass token in header
 - # Inbound Authentication
 - pass `KV_BFF_INBOUND_AUTH_TOKEN` from `local.setting.json` in `token` in header 
 - # Outbound Authentication
 - pass `KV_BFF_OUTBOUND_AUTH_HEADER_TOKEN` from `local.setting.json` in `token` in header

# What is azurite ?
- Azurite is the future storage emulator platform Azurite supersedes the Azure Storage Emulator. Azurite will continue to be updated to support the latest versions of Azure Storage APIs, here we have used it to store our cronjob on local

# Cron jobs
- First, cron job runs in every 30 minutes to check if organisation is bff registered if not it make it registered
- Second, cron job runs in every 60 minutes to check if active client subscription is expired and if yes it renew the subscription. and expire the subscription for archived client 

# Setup postman collection
- import collection from https://bitbucket.org/ryanhendmlc/mlc-partner-portal-back-end/src/master/postman/
- replace or create enviornment in collection with
  - mlc_local - http://localhost:7071
  - mlc_dev - https://fa-partnerportal-dev-001.azurewebsites.net
  - mlcAuthorization - with valid user token