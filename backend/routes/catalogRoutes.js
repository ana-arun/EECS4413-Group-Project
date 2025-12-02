// routes/catalogRoutes.js
const express = require('express');
const router = express.Router();
const Item = require('../models/Item');
const { authRequired } = require('../middleware/authMiddleware');
const path = require('path');

// configure multer to store uploads in backend/uploads (optional dependency)
let upload;
try {
  const multer = require('multer');
  const uploadDir = path.join(__dirname, '..', 'uploads');
  const fs = require('fs');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
      // create a unique filename: timestamp-originalname
      const unique = `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '')}`;
      cb(null, unique);
    }
  });
  // accept only PNG and JPEG and limit size to 5MB
  function fileFilter(req, file, cb) {
    const allowed = ['image/png', 'image/jpeg', 'image/jpg'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Only PNG and JPG images are allowed'));
  }
  upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });
} catch (e) {
  console.warn('multer not installed — image upload disabled. Run `npm install multer` in backend to enable.');
  // create a dummy upload with a single() that returns a middleware which passes through
  upload = {
    single: () => (req, res, next) => {
      // continue without file support
      next();
    }
  };
}

// GET /api/items  – existing catalog with optional filters
router.get('/', async (req, res) => {
  try {
    const { search, category, brand, sort } = req.query;
    const filter = {};

    if (search) {
      filter.$or = [
        { name: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') }
      ];
    }
    if (category && category !== 'all') {
      filter.category = category;
    }
    if (brand && brand !== 'all') {
      filter.brand = brand;
    }

    let query = Item.find(filter);

    if (sort === 'priceAsc') query = query.sort({ price: 1 });
    else if (sort === 'priceDesc') query = query.sort({ price: -1 });
    else if (sort === 'nameDesc') query = query.sort({ name: -1 });
    else query = query.sort({ name: 1 }); // default A→Z

    const items = await query.exec();
    res.json(items);
  } catch (err) {
    console.error('Error fetching items:', err);
    res.status(500).json({ message: 'Error loading items' });
  }
});

// NEW: GET /api/items/my  – items created by logged-in user
router.get('/my', authRequired, async (req, res) => {
  try {
    const items = await Item.find({ owner: req.user.id }).sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    console.error('Error fetching my items:', err);
    res.status(500).json({ message: 'Error loading your items' });
  }
});

// NEW: POST /api/items  – create a product listing (admin-only) with optional image upload
// Accepts multipart/form-data with fields: name, description, category, brand, price, quantity
// and optional file field 'image'
router.post('/', authRequired, upload.single('image'), async (req, res) => {
  try {
    // Allow any authenticated user to create an item (they become the owner)
    // Previously this endpoint was admin-only; sellers (authenticated users) can now list items.

    const body = req.body || {};
    // helpful debug: if body is empty, likely upload middleware not parsing multipart/form-data
    if (!req.body) {
      console.warn('POST /api/items called with empty req.body — content-type:', req.headers['content-type']);
      return res.status(400).json({ message: 'Missing form fields. Ensure request is multipart/form-data and multer is installed on the server.' });
    }

    const { name, description, category, brand, price, quantity } = body;

    if (!name || !category || price == null) {
      return res.status(400).json({ message: 'name, category and price are required' });
    }

    let imageUrl = '';
    if (req.file) {
      // serveable URL
      imageUrl = `/uploads/${req.file.filename}`;
    }

    const item = new Item({
      name,
      description: description || '',
      category,
      brand: brand || '',
      price: Number(price),
      quantity: Number(quantity) || 0,
      imageUrl: imageUrl || (req.body.imageUrl || ''),
      owner: req.user.id
    });

    const saved = await item.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error('Error creating item:', err && err.stack ? err.stack : err);
    const msg = err && err.message ? `Error creating item: ${err.message}` : 'Error creating item';
    res.status(500).json({ message: msg });
  }
});

// GET /api/items/:id  – single item details
router.get('/:id', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json(item);
  } catch (err) {
    console.error('Error fetching item by id:', err);
    res.status(500).json({ message: 'Error loading item' });
  }
});

// PUT /api/items/:id  – admin can edit a product (name, description, price, image, etc.)
// MUST come before /:id/inventory to avoid route conflicts
router.put('/:id', authRequired, upload.single('image'), async (req, res) => {
  try {
    if (!req.user.isAdmin) return res.status(403).json({ message: 'Admin access required' });
    
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    const body = req.body || {};
    
    // Update fields if provided
    if (body.name) item.name = body.name;
    if (body.description !== undefined) item.description = body.description;
    if (body.category) item.category = body.category;
    if (body.brand !== undefined) item.brand = body.brand;
    if (body.price !== undefined) item.price = Number(body.price);
    if (body.quantity !== undefined) item.quantity = Number(body.quantity);
    
    // Update image if new file uploaded
    if (req.file) {
      item.imageUrl = `/uploads/${req.file.filename}`;
    }

    const saved = await item.save();
    res.json(saved);
  } catch (err) {
    console.error('Error updating item:', err);
    const msg = err && err.message ? `Error updating item: ${err.message}` : 'Error updating item';
    res.status(500).json({ message: msg });
  }
});

// PUT /api/items/:id/inventory  – admin can adjust inventory (quick update)
router.put('/:id/inventory', authRequired, async (req, res) => {
  try {
    if (!req.user.isAdmin) return res.status(403).json({ message: 'Admin access required' });
    const { quantity } = req.body;
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    item.quantity = Number(quantity || 0);
    await item.save();
    res.json(item);
  } catch (err) {
    console.error('Error updating inventory:', err);
    res.status(500).json({ message: 'Error updating inventory' });
  }
});

// DELETE /api/items/:id  – admin can remove a listing
router.delete('/:id', authRequired, async (req, res) => {
  try {
    if (!req.user.isAdmin) return res.status(403).json({ message: 'Admin access required' });
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    // remove the item document
    await Item.deleteOne({ _id: item._id });

    res.json({ message: 'Item deleted' });
  } catch (err) {
    console.error('Error deleting item:', err);
    res.status(500).json({ message: 'Error deleting item' });
  }
});

module.exports = router;