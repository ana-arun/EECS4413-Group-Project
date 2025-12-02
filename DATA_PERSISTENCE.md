# Data Persistence Guide

This project is configured to persist **all data** including uploads, user accounts, orders, and shopping carts.

## 🔒 What's Already Protected

### For Your Local Development:
- **MongoDB Data**: Stored in Docker volume `mongo-data` (persists across container restarts)
- **Uploaded Images**: Stored in `backend/uploads/` (persists and tracked in Git)

### For Your Team:
- **Uploaded Images**: Already committed to Git repository
- **Database Backup**: Can be exported and shared via Git

## 📦 Sharing Your Complete Database

When you want to share your **exact database state** (users, orders, products) with teammates:

### Step 1: Export Current Database
```bash
./export-database.sh
```

This creates a backup in `mongodb-backup/` folder.

### Step 2: Commit to Git
```bash
git add mongodb-backup/
git commit -m "Update database backup with latest data"
git push
```

### Step 3: Teammates Pull & Run
When teammates pull your code and run `docker-compose up`, they will:
1. ✅ Get all uploaded images (from `backend/uploads/`)
2. ✅ Automatically import your database backup on first run
3. ✅ Have the exact same users, orders, and data as you

## 🔄 Updating the Shared Database

Whenever you want to share new data:
1. Run `./export-database.sh`
2. Commit and push the updated backup
3. Teammates need to:
   ```bash
   docker-compose down -v  # Delete old data
   git pull                # Get new backup
   docker-compose up       # Import new backup
   ```

## ⚠️ Important Notes

- **First Run**: Database backup is imported automatically
- **Subsequent Runs**: Existing data is preserved, backup is NOT re-imported
- **Clean Slate**: To start fresh, run `docker-compose down -v` (deletes volumes)
- **Uploads**: Always tracked in Git, automatically available to everyone

## 🛠️ Manual Database Operations

### Export Database
```bash
docker exec eecs4413-mongo mongodump \
  --username admin --password password123 \
  --authenticationDatabase admin \
  --db eecs4413store \
  --out /data/db/backup
```

### Import Database
```bash
docker exec eecs4413-mongo mongorestore \
  --username admin --password password123 \
  --authenticationDatabase admin \
  /data/db/backup/
```

### Access MongoDB Shell
```bash
docker exec -it eecs4413-mongo mongosh \
  --username admin --password password123 \
  --authenticationDatabase admin eecs4413store
```

## 📊 What Gets Persisted

| Data Type | Storage Method | Shared via Git | Persists Locally |
|-----------|---------------|----------------|------------------|
| User Accounts | MongoDB Volume | Via backup | ✅ Yes |
| Orders | MongoDB Volume | Via backup | ✅ Yes |
| Shopping Carts | MongoDB Volume | Via backup | ✅ Yes |
| Products/Items | MongoDB Volume | Via backup | ✅ Yes |
| Uploaded Images | Bind Mount | ✅ Yes | ✅ Yes |

## 🎯 Quick Commands

```bash
# Start everything
docker-compose up

# Stop but keep data
docker-compose down

# Stop and delete all data (fresh start)
docker-compose down -v

# Export database for sharing
./export-database.sh

# View logs
docker-compose logs -f
```
