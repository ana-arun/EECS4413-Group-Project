#!/bin/bash
# Export current database to be shared with team

echo "🔄 Exporting database from MongoDB container..."

# Create backup directory if it doesn't exist
mkdir -p mongodb-backup

# Export the database
docker exec eecs4413-mongo mongodump \
  --username admin \
  --password password123 \
  --authenticationDatabase admin \
  --db eecs4413store \
  --out /data/db/temp-backup

# Copy backup from container to local
docker cp eecs4413-mongo:/data/db/temp-backup/eecs4413store ./mongodb-backup/

# Clean up temp backup in container
docker exec eecs4413-mongo rm -rf /data/db/temp-backup

echo "✅ Database exported to ./mongodb-backup/eecs4413store/"
echo ""
echo "📝 Next steps:"
echo "   1. git add mongodb-backup/"
echo "   2. git commit -m 'Update database backup'"
echo "   3. git push"
echo ""
echo "When teammates clone the repo and run docker-compose up,"
echo "they'll automatically get this database state!"
