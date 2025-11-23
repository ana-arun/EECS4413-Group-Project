# CampusTech Store - Setup Guide

This guide will help you set up and run the EECS4413 Group Project on your local machine.

## Prerequisites

Before you begin, make sure you have the following installed on your machine:

### Required Software

1. **Node.js** (v18 or higher recommended)
   - Download from: https://nodejs.org/
   - Verify installation: `node --version`
   - This will also install npm (Node Package Manager)

2. **Git**
   - Download from: https://git-scm.com/
   - Verify installation: `git --version`

3. **A Code Editor** (recommended: VS Code)
   - Download from: https://code.visualstudio.com/

## Initial Setup

### 1. Clone the Repository

```bash
git clone https://github.com/ana-arun/EECS4413-Group-Project.git
cd EECS4413-Group-Project
```

### 2. Install Dependencies

The project has two parts: **backend** (server) and **frontend** (client). You need to install dependencies for both.

#### Install Backend Dependencies

```bash
cd backend
npm install
```

This will install all required packages including:
- Express (web server)
- Mongoose (MongoDB database)
- JWT for authentication
- CORS for cross-origin requests
- Multer for file uploads
- And more...

#### Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

This will install:
- React (UI library)
- Vite (build tool)
- React Router (navigation)
- And more...

## Running the Application

You need to run **both** the backend and frontend servers simultaneously. Open **two separate terminal windows**.

### Terminal 1: Start the Backend Server

```bash
cd backend
npm run dev
```

**Expected Output:**
```
[nodemon] starting `node server.js`
MongoDB connected to eecs4413-cluster
Sample items seeded successfully
Server listening on http://localhost:4000
```

✅ The backend should now be running on **http://localhost:4000**

### Terminal 2: Start the Frontend Server

```bash
cd frontend
npm run dev
```

**Expected Output:**
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5174/
➜  Network: use --host to expose
```

✅ The frontend should now be running on **http://localhost:5174**

### 3. Access the Application

Open your web browser and go to:
```
http://localhost:5174
```

You should see the **CampusTech Store** homepage with the catalog of items.

## Database Connection

The project uses **MongoDB Atlas** (cloud database). The connection string is already configured in `backend/server.js`:

```javascript
process.env.MONGODB_URI = 'mongodb+srv://eecs4413user:Eecs4413DB2024@eecs4413-cluster.fpabm1l.mongodb.net/?appName=eecs4413-cluster';
```

**You don't need to set up a local database** - the app connects to our shared cloud database automatically.

## Testing the Application

### Create an Account

1. Click **"Register"** in the navigation bar
2. Fill in your details (name, email, password, shipping address)
3. Click **"Register"**
4. You'll be automatically logged in

### Browse Products

- View the catalog on the homepage
- Use filters to search by category, brand, or name
- Click on items to see details

### Add Items to Cart

- Click **"Add to Cart"** on any item
- Click **"Cart"** in the navigation to view your cart
- Adjust quantities or remove items

### Place an Order

1. Go to your cart
2. Click **"Checkout"**
3. Fill in shipping and payment information
4. Click **"Place Order"**
5. View your orders in the **"Orders"** page

### Sell an Item (Authenticated Users)

1. Click **"Sell"** in the navigation
2. Fill in product details
3. Upload an image (optional)
4. Click **"Create Listing"**

## Project Structure

```
EECS4413-Group-Project/
│
├── backend/                 # Server-side code
│   ├── config/             # Database configuration
│   ├── controllers/        # Business logic
│   ├── dao/                # Data access layer
│   ├── middleware/         # Authentication middleware
│   ├── models/             # Database schemas
│   ├── routes/             # API endpoints
│   ├── uploads/            # Uploaded images
│   ├── server.js           # Main server file
│   └── package.json        # Backend dependencies
│
└── frontend/               # Client-side code
    ├── src/
    │   ├── components/     # Reusable UI components
    │   ├── context/        # React context (auth, toast)
    │   ├── pages/          # Page components
    │   ├── api.js          # API client
    │   ├── App.jsx         # Main app component
    │   └── main.jsx        # Entry point
    ├── index.html
    └── package.json        # Frontend dependencies
```

## API Endpoints

The backend provides the following REST API endpoints:

### Authentication
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Login

### Catalog
- `GET /api/items` - Get all items (with filters)
- `GET /api/items/:id` - Get single item
- `POST /api/items` - Create new listing (authenticated)
- `GET /api/items/my` - Get user's listings

### Cart
- `GET /api/cart` - Get user's cart
- `POST /api/cart/add` - Add item to cart
- `POST /api/cart/set` - Update item quantity
- `DELETE /api/cart/remove/:itemId` - Remove item

### Orders
- `POST /api/orders/checkout` - Place an order
- `GET /api/orders/my` - Get user's orders

### User Profile
- `GET /api/users/me` - Get user profile
- `PUT /api/users/me` - Update profile

## Troubleshooting

### Backend won't start

**Problem:** Error connecting to MongoDB
```
MongooseError: Could not connect to any servers
```

**Solution:** Check your internet connection. The app needs internet access to connect to MongoDB Atlas.

---

**Problem:** Port 4000 already in use
```
Error: listen EADDRINUSE: address already in use :::4000
```

**Solution:** Kill the process using port 4000:
```bash
# On Mac/Linux:
lsof -ti:4000 | xargs kill -9

# On Windows:
netstat -ano | findstr :4000
taskkill /PID <PID> /F
```

### Frontend won't start

**Problem:** Port 5174 already in use

**Solution:** Vite will automatically try the next available port (5175, 5176, etc.)

---

**Problem:** "Failed to fetch" errors in browser

**Solution:** Make sure the backend server is running on port 4000. Check Terminal 1.

### Dependencies issues

**Problem:** Missing dependencies or module not found errors

**Solution:** Delete `node_modules` and reinstall:

```bash
# In backend/
rm -rf node_modules package-lock.json
npm install

# In frontend/
rm -rf node_modules package-lock.json
npm install
```

### Image uploads not working

**Problem:** Images won't upload when creating listings

**Solution:** Make sure `multer` is installed in the backend:
```bash
cd backend
npm install multer
```

## Common Development Commands

### Backend Commands
```bash
npm run dev      # Start with nodemon (auto-restart on changes)
npm start        # Start normally
```

### Frontend Commands
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
```

## Environment Variables (Optional)

The project currently has hardcoded credentials for development. For production or if you want to use your own database, create a `.env` file:

### Backend `.env` (optional)
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
PORT=4000
```

### Frontend `.env` (optional)
```
VITE_API_URL=http://localhost:4000
```

## Git Workflow

### Pulling Latest Changes

Before starting work, always pull the latest changes:
```bash
git pull origin main
```

### Creating a Branch

Create a feature branch for your work:
```bash
git checkout -b feature/your-feature-name
```

### Committing Changes

```bash
git add .
git commit -m "Description of your changes"
git push origin feature/your-feature-name
```

### Creating a Pull Request

1. Push your branch to GitHub
2. Go to the repository on GitHub
3. Click "Pull Requests" → "New Pull Request"
4. Select your branch and create the PR
5. Wait for team review before merging

## Additional Notes

- **Don't commit `node_modules/`** - These folders are already in `.gitignore`
- **Sample data** is automatically seeded when the backend starts
- **Admin features** require an admin account (contact team lead)
- The **guest cart** feature allows users to add items before logging in

## Need Help?

If you encounter issues not covered in this guide:

1. Check the browser console (F12) for error messages
2. Check the terminal output for both backend and frontend
3. Make sure both servers are running
4. Try restarting both servers
5. Contact the team on Discord/Slack

## Quick Start Checklist

- [ ] Node.js installed
- [ ] Repository cloned
- [ ] Backend dependencies installed (`cd backend && npm install`)
- [ ] Frontend dependencies installed (`cd frontend && npm install`)
- [ ] Backend server running (`cd backend && npm run dev`)
- [ ] Frontend server running (`cd frontend && npm run dev`)
- [ ] Browser opened to http://localhost:5174
- [ ] Can see catalog items
- [ ] Successfully registered/logged in

---

**Happy Coding! 🚀**

*Last Updated: November 23, 2025*
