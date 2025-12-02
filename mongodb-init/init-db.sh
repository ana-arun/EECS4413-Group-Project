#!/bin/bash
# This script runs when MongoDB container starts for the first time

# Wait for MongoDB to be ready
until mongosh --host localhost --username admin --password password123 --authenticationDatabase admin --eval "db.adminCommand('ping')" &> /dev/null; do
  echo "Waiting for MongoDB to start..."
  sleep 2
done

# Check if database already has data
DATA_EXISTS=$(mongosh --host localhost --username admin --password password123 --authenticationDatabase admin --eval "db.getSiblingDB('eecs4413store').items.countDocuments()" --quiet)

if [ "$DATA_EXISTS" -eq "0" ]; then
  echo "No data found. Restoring from backup..."
  if [ -d "/docker-entrypoint-initdb.d/backup/eecs4413store" ]; then
    mongorestore --username admin --password password123 --authenticationDatabase admin /docker-entrypoint-initdb.d/backup/
    echo "Database restored successfully!"
  else
    echo "No backup found. Starting with empty database."
  fi
else
  echo "Database already contains data. Skipping restore."
fi
