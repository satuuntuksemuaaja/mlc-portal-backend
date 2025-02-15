relativePath=$(pwd)

# FOR MAC
psql postgres -c 'DROP DATABASE IF EXISTS mlcpp'; 
psql postgres -c 'drop user mlcppapp';

psql postgres -f jest-setupdb.sql
psql mlcpp -f jest-configureschema.sql
psql mlcpp -f jest-tables.sql
psql mlcpp -f jest-permissions.sql
psql mlcpp -f jest-data.sql

# FOR UBUNTU
# sudo -i -u postgres psql -c 'DROP DATABASE IF EXISTS mlcpp'; 
# sudo -i -u postgres psql -c 'drop user mlcppapp';

# sudo -i -u postgres psql -f $relativePath/jest-setupdb.sql
# sudo -i -u postgres psql mlcpp -f $relativePath/jest-configureschema.sql
# sudo -i -u postgres psql mlcpp -f $relativePath/jest-tables.sql
# sudo -i -u postgres psql mlcpp -f $relativePath/jest-permissions.sql
# sudo -i -u postgres psql mlcpp -f $relativePath/jest-data.sql
