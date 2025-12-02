# Cloud MongoDB Setup

This project now uses **MongoDB Atlas** (cloud database) so everyone on your team sees the same live data.

## 🚀 Quick Start for Teammates

```bash
# 1. Clone the repository
git clone https://github.com/ana-arun/EECS4413-Group-Project.git
cd EECS4413-Group-Project

# 2. Install Docker Desktop (if not installed)
# Download from: https://www.docker.com/products/docker-desktop/

# 3. Start the application
docker-compose up

# 4. Open http://localhost in your browser
```

That's it! No database setup needed - everyone connects to the same cloud database.

## ☁️ **What Changed**

- **Before**: Each person had their own local MongoDB (separate data)
- **Now**: Everyone shares the same MongoDB Atlas cloud database (live data)

## 🎯 **What This Means**

✅ **Real-time collaboration**: When someone adds a product, everyone sees it  
✅ **Same user accounts**: Everyone can login with the same credentials  
✅ **Shared orders**: All order history is synchronized  
✅ **No data loss**: Database is hosted in the cloud, always available  

## 📸 **Uploaded Images**

Product images are still stored locally in `backend/uploads/` and tracked in Git, so everyone gets the same images.

## 🔐 **Database Access**

The MongoDB Atlas connection string is configured in `docker-compose.yml`. The database is already set up with:
- 2 user accounts
- 13 products
- Order history
- Shopping carts

## 🛠️ **For Developers**

The database credentials are embedded in the docker-compose.yml file. In a production environment, you would use environment variables and keep credentials secret.

**Current setup:**
- **Database**: MongoDB Atlas (cloud)
- **Uploads**: Local file system (synced via Git)
- **Connection**: Automatic via Docker Compose

## ❓ **Troubleshooting**

If the app doesn't start:
1. Make sure Docker Desktop is running
2. Run `docker-compose down` then `docker-compose up` again
3. Check logs with `docker-compose logs backend`

## 📊 **Database Structure**

- **Users**: Account credentials and profiles
- **Items**: Product catalog
- **Orders**: Purchase history
- **Carts**: Shopping cart data
