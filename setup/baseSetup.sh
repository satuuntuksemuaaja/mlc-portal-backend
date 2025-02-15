#!/bin/bash
relativePath=$(pwd)
echo $relativePath

echo "Enter environment:";
read ENVIRONMENT;

# Create env folder
mkdir $ENVIRONMENT
# Create env files and copy base file in it.  
touch $ENVIRONMENT/$ENVIRONMENT-setupdb.sql
cp $relativePath/base/base-setupdb.sql $relativePath/$ENVIRONMENT/$ENVIRONMENT-setupdb.sql

touch $ENVIRONMENT/$ENVIRONMENT-configureschema.sql
cp $relativePath/base/base-configureschema.sql $relativePath/$ENVIRONMENT/$ENVIRONMENT-configureschema.sql

touch $ENVIRONMENT/$ENVIRONMENT-tables.sql
cp $relativePath/base/base-tables.sql $relativePath/$ENVIRONMENT/$ENVIRONMENT-tables.sql

touch $ENVIRONMENT/$ENVIRONMENT-permissions.sql
cp $relativePath/base/base-permissions.sql $relativePath/$ENVIRONMENT/$ENVIRONMENT-permissions.sql


echo "Enter postgres host by default it will use localhost:";
read HOST_NAME;

echo "Enter user name:";
read USER_NAME; 

echo "Enter password:";
read USER_PASSWORD; 

echo "Enter databse:";
read DB_NAME; 

echo "Enter databse schema:";
read SCHEMA_NAME; 

if [ !HOST_NAME ]
then
    HOST_NAME='localhost'
fi

# # FOR MAC
sed -i '' -e "s/USER_NAME/$USER_NAME/g" $relativePath/$ENVIRONMENT/$ENVIRONMENT-setupdb.sql
sed -i '' -e "s/USER_PASSWORD/$USER_PASSWORD/g" $relativePath/$ENVIRONMENT/$ENVIRONMENT-setupdb.sql
sed -i '' -e "s/DB_NAME/$DB_NAME/g" $relativePath/$ENVIRONMENT/$ENVIRONMENT-setupdb.sql
sed -i '' -e "s/USER_NAME/$USER_NAME/g" $relativePath/$ENVIRONMENT/$ENVIRONMENT-configureschema.sql
sed -i '' -e "s/DB_NAME/$DB_NAME/g" $relativePath/$ENVIRONMENT/$ENVIRONMENT-configureschema.sql
sed -i '' -e "s/SCHEMA_NAME/$SCHEMA_NAME/g" $relativePath/$ENVIRONMENT/$ENVIRONMENT-configureschema.sql
sed -i '' -e "s/SCHEMA_NAME/$SCHEMA_NAME/g" $relativePath/$ENVIRONMENT/$ENVIRONMENT-tables.sql
sed -i '' -e "s/USER_NAME/$USER_NAME/g" $relativePath/$ENVIRONMENT/$ENVIRONMENT-permissions.sql
sed -i '' -e "s/SCHEMA_NAME/$SCHEMA_NAME/g" $relativePath/$ENVIRONMENT/$ENVIRONMENT-permissions.sql


# # SQL SCRIPTS.
# psql postgres -h $HOST_NAME -f $ENVIRONMENT-setupdb.sql
# psql -h $HOST_NAME $DB_NAME -f $ENVIRONMENT-configureschema.sql
# psql -h $HOST_NAME $DB_NAME -f $ENVIRONMENT-tables.sql
# psql -h $HOST_NAME $DB_NAME -f $ENVIRONMENT-permissions.sql


# FOR UBUNTU
# SETUP
# sed -i "s/USER_NAME/$USER_NAME/g" $relativePath/$ENVIRONMENT/$ENVIRONMENT-setupdb.sql
# sed -i "s/USER_PASSWORD/$USER_PASSWORD/g" $relativePath/$ENVIRONMENT/$ENVIRONMENT-setupdb.sql
# sed -i "s/DB_NAME/$DB_NAME/g" $relativePath/$ENVIRONMENT/$ENVIRONMENT-setupdb.sql
# sed -i "s/USER_NAME/$USER_NAME/g" $relativePath/$ENVIRONMENT/$ENVIRONMENT-configureschema.sql
# sed -i "s/DB_NAME/$DB_NAME/g" $relativePath/$ENVIRONMENT/$ENVIRONMENT-configureschema.sql
# sed -i "s/SCHEMA_NAME/$SCHEMA_NAME/g" $relativePath/$ENVIRONMENT/$ENVIRONMENT-configureschema.sql
# sed -i "s/SCHEMA_NAME/$SCHEMA_NAME/g" $relativePath/$ENVIRONMENT/$ENVIRONMENT-tables.sql
# sed -i "s/USER_NAME/$USER_NAME/g" $relativePath/$ENVIRONMENT/$ENVIRONMENT-permissions.sql
# sed -i "s/SCHEMA_NAME/$SCHEMA_NAME/g" $relativePath/$ENVIRONMENT/$ENVIRONMENT-permissions.sql


# SQL SCRIPTS.
#sudo -i -u postgres psql-h $HOST_NAME  -c "DROP DATABASE IF EXISTS $DB_NAME"; 
#sudo -i -u postgres psql -h $HOST_NAME -c "drop user $USER_NAME";

# sudo -i -u postgres psql -h $HOST_NAME -f $relativePath/$ENVIRONMENT/$ENVIRONMENT-setupdb.sql
# sudo -i -u postgres psql -h $HOST_NAME $DB_NAME -f $relativePath/$ENVIRONMENT/$ENVIRONMENT-configureschema.sql
# sudo -i -u postgres psql -h $HOST_NAME $DB_NAME -f $relativePath/$ENVIRONMENT/$ENVIRONMENT-tables.sql
# sudo -i -u postgres psql -h $HOST_NAME $DB_NAME -f $relativePath/$ENVIRONMENT/$ENVIRONMENT-permissions.sql


