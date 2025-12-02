import React, { useEffect, useState, useMemo } from 'react';
import api from '../api.js';
import ItemCard from '../components/ItemCard.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

function HomePage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [brandFilter, setBrandFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name-asc');

  const { user, token } = useAuth();
  const { addToast } = useToast();

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await api.get('/items');
        setItems(res.data);
      } catch (err) {
        console.error('Failed loading items:', err);
        const msg = err.message || 'Error loading items from server.';
        addToast(msg, 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, [addToast]);

  const categories = useMemo(
    () => Array.from(new Set(items.map((i) => i.category))).filter(Boolean),
    [items]
  );
  const brands = useMemo(
    () => Array.from(new Set(items.map((i) => i.brand))).filter(Boolean),
    [items]
  );

  const filteredItems = useMemo(() => {
    let result = [...items];

    if (search.trim()) {
      const s = search.toLowerCase();
      result = result.filter(
        (i) =>
          i.name.toLowerCase().includes(s) ||
          i.description.toLowerCase().includes(s) ||
          (i.category && i.category.toLowerCase().includes(s)) ||
          (i.brand && i.brand.toLowerCase().includes(s))
      );
    }

    if (categoryFilter !== 'all') {
      result = result.filter((i) => i.category === categoryFilter);
    }

    if (brandFilter !== 'all') {
      result = result.filter((i) => i.brand === brandFilter);
    }

    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'name-desc':
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      default:
        // name-asc
        result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [items, search, categoryFilter, brandFilter, sortBy]);

  const handleAddToCart = async (item) => {
    // Support guest cart as well
    if (!token) {
      try {
        const raw = localStorage.getItem('guest_cart') || '[]';
        const guest = JSON.parse(raw);
        const found = guest.find((g) => g.itemId === item._id);
        if (found) found.quantity = (found.quantity || 0) + 1;
        else guest.push({ itemId: item._id, quantity: 1 });
        localStorage.setItem('guest_cart', JSON.stringify(guest));
        window.dispatchEvent(new Event('cartUpdated'));
        addToast('Added to cart', 'success');
      } catch (err) {
        console.error(err);
        addToast('Error adding to cart', 'error');
      }
      return;
    }

    try {
      await api.post('/cart/add', { itemId: item._id, quantity: 1 });
      addToast('Added to cart', 'success');
    } catch (err) {
      console.error(err);
      addToast('Error adding to cart', 'error');
    }
  };

  if (loading) {
    return (
      <div className="page">
        <h1>Catalog</h1>
        <p>Loading items...</p>
      </div>
    );
  }

  return (
    <div className="page">
      <h1>Catalog</h1>

      <div className="catalog-controls">
        <input
          placeholder="Search by name or description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="all">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <select
          value={brandFilter}
          onChange={(e) => setBrandFilter(e.target.value)}
        >
          <option value="all">All brands</option>
          {brands.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>

        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="name-asc">Sort: Name (A → Z)</option>
          <option value="name-desc">Sort: Name (Z → A)</option>
          <option value="price-asc">Sort: Price (low → high)</option>
          <option value="price-desc">Sort: Price (high → low)</option>
        </select>
      </div>

      <div className="grid">
        {filteredItems.map((item) => (
          <ItemCard key={item._id} item={item} onAddToCart={handleAddToCart} />
        ))}
      </div>
    </div>
  );
}

export default HomePage;