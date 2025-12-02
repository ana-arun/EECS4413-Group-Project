// frontend/src/components/ItemCard.jsx

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api, { API_ROOT } from '../api';
import { useToast } from '../context/ToastContext.jsx';

export default function ItemCard({ item }) {
  const { token } = useAuth();
  const { addToast } = useToast();
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');

  const handleAddToCart = async () => {
    // Support guest cart stored in localStorage when not logged in
    if (!token) {
      try {
        const raw = localStorage.getItem('guest_cart') || '[]';
        const guest = JSON.parse(raw);
        const found = guest.find((g) => g.itemId === item._id);
        if (found) {
          found.quantity = (found.quantity || 0) + 1;
        } else {
          guest.push({ itemId: item._id, quantity: 1 });
        }
        localStorage.setItem('guest_cart', JSON.stringify(guest));
        // notify app to refresh badge
        window.dispatchEvent(new Event('cartUpdated'));
        addToast('Added to cart ✅', 'success');
      } catch (err) {
        console.error('Error updating guest cart', err);
        addToast('Failed to add to cart', 'error');
      }
      return;
    }

    try {
      setAdding(true);
      setError('');
      await api.post('/cart/add', { itemId: item._id, quantity: 1 });
      window.dispatchEvent(new Event('cartUpdated'));
      addToast('Added to cart ✅', 'success');
    } catch (err) {
      console.error('Error adding to cart:', err.message || err);
      setError('Error adding to cart');
      addToast('Failed to add to cart', 'error');
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="item-card">
      <div className="item-tag">{item.category?.toUpperCase()}</div>
      {item.imageUrl ? (
        <div style={{height:140,display:'flex',alignItems:'center',justifyContent:'center',marginBottom:8}}>
          <Link to={`/items/${item._id}`} style={{display:'block',width:'100%',height:'100%'}}>
            <img
              src={item.imageUrl.startsWith('/') ? `${API_ROOT}${item.imageUrl}` : item.imageUrl}
              alt={item.name}
              style={{maxHeight:140,maxWidth:'100%',borderRadius:6,display:'block',margin:'0 auto'}}
            />
          </Link>
        </div>
      ) : null}
      <h3 className="item-name">
        <Link to={`/items/${item._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>{item.name}</Link>
      </h3>
      <div className="item-brand">{item.brand}</div>
      <p className="item-description">{item.description}</p>
      <div className="item-price">${item.price}</div>
      <button className="primary-button" onClick={handleAddToCart} disabled={adding}>
        {adding ? 'Adding...' : 'Add to Cart'}
      </button>
      {error && <div className="item-error">{error}</div>}
    </div>
  );
}