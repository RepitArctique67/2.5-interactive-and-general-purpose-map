#!/bin/bash

# Configuration
BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DB_CONTAINER="cartographie_db_prod"
DB_USER="postgres"
DB_NAME="cartographie_db"

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Perform backup
echo "Starting backup for $DB_NAME at $TIMESTAMP..."
docker exec -t $DB_CONTAINER pg_dump -U $DB_USER $DB_NAME > $BACKUP_DIR/db_backup_$TIMESTAMP.sql

# Check if backup was successful
if [ $? -eq 0 ]; then
  echo "Backup completed successfully: $BACKUP_DIR/db_backup_$TIMESTAMP.sql"
  
  # Optional: Compress the backup
  gzip $BACKUP_DIR/db_backup_$TIMESTAMP.sql
  echo "Backup compressed."
  
  # Optional: Remove backups older than 7 days
  find $BACKUP_DIR -type f -name "db_backup_*.sql.gz" -mtime +7 -exec rm {} \;
  echo "Old backups cleaned up."
else
  echo "Backup failed!"
  exit 1
fi
