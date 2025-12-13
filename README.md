# EECS4413 CampusTech Store

A full-stack e-commerce application for buying and selling campus tech products, built with React (Vite), Node.js/Express, and MongoDB.

## Features

### Customer Features
- **Authentication**: Register, login, logout with JWT tokens
- **Product Catalog**: Browse, search, filter (by category/brand), and sort products
- **Product Details**: View detailed product information with images and inventory levels
- **Shopping Cart**: Add/remove items, adjust quantities (works for guests and logged-in users)
- **Checkout**: Complete orders with shipping and payment info, automatic inventory updates
- **Profile Management**: View and update account information, billing details, and order history
- **Image Upload**: Sellers can list products with image uploads

### Admin Features
- **Order Management**: View all orders, filter by customer/product/date
- **Inventory Management**: Update product quantities, add/remove listings
- **Customer Management**: View and edit customer information
- **Sales Analytics**: Track orders and customer purchase history

## Tech Stack

**Frontend:**
- React 18 with Vite
- React Router for navigation
- Context API for state management
- CSS for styling

**Backend:**
- Node.js with Express
- MongoDB with Mongoose ODM
- JWT authentication
- Multer for file uploads
- bcryptjs for password hashing

**Architecture:**
- MVC pattern with clear separation of concerns
- DAO (Data Access Object) pattern
- RESTful API design

## Quick Start

### Option 1: Docker (Recommended - One Command!) + git installed

**Requirements:**
- Docker Desktop installed ([Download](https://www.docker.com/products/docker-desktop)), no need to sign up just have it open and that is all that is needed and just run the below commands in your terminal.

**Steps:**
```bash
# Clone the repository
git clone https://github.com/ana-arun/EECS4413-Group-Project.git
cd EECS4413-Group-Project

# Start everything with one command
docker-compose up

# Access the application
http://localhost

```

**Default Admin Account:**
- Email: `campustech@my.yorku.ca`
- Password: 12345678

**To stop:**
```bash
docker compose down
```

**To reset database:**
```bash
docker compose down -v
docker compose up --build
```

### Option 2: Local Development

**Requirements:**
- Node.js 16+ and npm
- MongoDB (local or Atlas)

**Backend Setup:**
```bash
cd backend
npm install

# Set environment variables (macOS/Linux)
export MONGODB_URI="mongodb://localhost:27017/eecs4413store"
export JWT_SECRET="your_secret_key_here"
export ADMIN_EMAIL="campustech@my.yorku.ca"

# Start the backend
npm run dev
# Server runs on http://localhost:4000
```

**Frontend Setup:**
```bash
cd frontend
npm install

# Start the frontend
npm run dev
# Opens on http://localhost:5173
```

**MongoDB Options:**
- **Local MongoDB:** Install MongoDB Community Edition and run `mongod`
- **MongoDB Atlas:** Create a free cluster at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) and use the connection string

## Environment Variables

**Backend (.env or export):**
```bash
MONGODB_URI=mongodb://localhost:27017/eecs4413store
JWT_SECRET=supersecret_eecs4413_store_123
ADMIN_EMAIL=campustech@my.yorku.ca
PORT=4000
```

**Frontend:**
The API base URL is configured in `src/api.js` (defaults to `http://localhost:4000/api`)

## Project Structure

```
eecs4413-store/
├── backend/
│   ├── config/          # Database configuration
│   ├── controllers/     # Route controllers (MVC)
│   ├── dao/            # Data Access Objects
│   ├── middleware/     # Auth middleware
│   ├── models/         # Mongoose schemas
│   ├── routes/         # API routes
│   ├── uploads/        # Uploaded product images
│   └── server.js       # Express app entry point
├── frontend/
│   ├── src/
│   │   ├── assets/     # Static assets
│   │   ├── components/ # React components
│   │   ├── context/    # Context providers
│   │   ├── pages/      # Page components
│   │   └── api.js      # API client
│   └── index.html
└── docker-compose.yml  # Docker orchestration
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Products
- `GET /api/items` - List products (with filters/search/sort)
- `GET /api/items/:id` - Get product details
- `POST /api/items` - Create product (authenticated sellers)
- `PUT /api/items/:id/inventory` - Update inventory (admin)
- `DELETE /api/items/:id` - Delete product (admin)

### Cart
- `GET /api/cart` - Get user's cart
- `POST /api/cart/add` - Add item to cart
- `POST /api/cart/set` - Set item quantity

### Orders
- `POST /api/orders/checkout` - Place order
- `GET /api/orders` - Get user's orders
- `GET /api/orders/admin/all` - Get all orders (admin)

### Users
- `GET /api/users/me` - Get profile
- `PUT /api/users/me` - Update profile
- `GET /api/users/admin/list` - List all users (admin)
- `PUT /api/users/admin/:id` - Update user (admin)

## Usage Guide

### For Customers:

1. **Browse Products:** Visit the homepage to see all products
2. **Search & Filter:** Use search bar and filters to find specific items
3. **Add to Cart:** Click "Add to Cart" on any product (works without login)
4. **Checkout:** Click cart icon → fill shipping/payment → place order
5. **View Orders:** After login, check "Orders" page for purchase history

### For Sellers:

1. **Register/Login:** Create an account
2. **List Product:** Go to "Sell" page → fill product details → upload image
3. **Manage Listings:** View your products in the catalog

### For Admins:

1. **Login:** Use the configured admin email
2. **Admin Dashboard:** Access "Admin" link in navbar
3. **View Orders:** See all orders with filtering options
4. **Manage Inventory:** Update product quantities
5. **Manage Customers:** View and edit customer information

## Development Notes

### Payment Processing
- Currently simulated (dev-only)
- Use card ending in `0000` to simulate declined payment
- Any other card number is accepted

### Image Uploads
- Supported formats: PNG, JPEG
- Maximum size: 5MB
- Images stored in `backend/uploads/`
- Served via `/uploads/` route

### Admin Configuration
- Admin is automatically granted to the user with email matching `ADMIN_EMAIL`
- Default: `campustech@my.yorku.ca`
- Change by setting `ADMIN_EMAIL` environment variable

### Guest Cart
- Cart persists in localStorage for non-logged-in users
- Automatically merges with server cart upon login

## Deployment

### Docker Production Deployment

**Heroku/Railway/Render:**
```bash
# Use the docker-compose.yml or individual Dockerfiles
# Set environment variables in platform dashboard
```

**AWS/Azure/GCP:**
```bash
# Push images to container registry
docker build -t your-registry/eecs4413-backend ./backend
docker build -t your-registry/eecs4413-frontend ./frontend
docker push your-registry/eecs4413-backend
docker push your-registry/eecs4413-frontend
```

### Cloud Hosting Options

**Backend + Database:**
- [Railway](https://railway.app) - Easy deployment with MongoDB addon
- [Render](https://render.com) - Free tier with MongoDB Atlas
- [Heroku](https://heroku.com) - Classic PaaS with MongoDB addon

**Frontend:**
- [Vercel](https://vercel.com) - Automatic React deployment
- [Netlify](https://netlify.com) - Static site hosting
- [GitHub Pages](https://pages.github.com) - Free static hosting

**Database:**
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) - Free tier available

## Testing

**Test User Accounts:**
```
Admin: campustech@my.yorku.ca (use any password on register)
Customer: Create any account with different email
```

**Test Payment:**
```
Accepted: Any card number except ending in 0000
Declined: Card number ending in 0000
```

**Sample Products:**
The database seeds with sample products on first run (iPad, Laptop, Little Prince book)

## Troubleshooting

**Backend won't start:**
- Check MongoDB is running (`docker ps` or local `mongod`)
- Verify `MONGODB_URI` environment variable is set correctly
- Run `npm install` in backend folder

**Frontend can't connect:**
- Ensure backend is running on port 4000
- Check `src/api.js` has correct `API_ROOT`
- Clear browser cache and localStorage

**Image upload fails:**
- Verify `multer` is installed: `npm list multer` in backend
- Check backend terminal for errors
- Ensure `backend/uploads` directory exists and is writable

**Port conflicts:**
- Backend: Change `PORT` in environment or docker-compose.yml
- Frontend: Change in vite.config.js
- MongoDB: Change port mapping in docker-compose.yml

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## License

This project is for educational purposes (EECS4413 course project).


## Acknowledgments

- York University EECS4413 Course
- MongoDB Atlas for database hosting
- React and Vite communities
