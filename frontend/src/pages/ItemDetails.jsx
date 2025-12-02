import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api, { API_ROOT } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

export default function ItemDetails() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const { user, token } = useAuth();
  const { addToast } = useToast();

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(`/items/${id}`);
        setItem(res.data);
      } catch (err) {
        console.error('Error loading item details', err);
        setStatus(err.message || 'Error loading item');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleAdd = async () => {
    // guest support
    if (!token) {
      try {
        const raw = localStorage.getItem('guest_cart') || '[]';
        const guest = JSON.parse(raw);
        const found = guest.find((g) => g.itemId === item._id);
        if (found) found.quantity = (found.quantity || 0) + 1;
        else guest.push({ itemId: item._id, quantity: 1 });
        localStorage.setItem('guest_cart', JSON.stringify(guest));
        window.dispatchEvent(new Event('cartUpdated'));
        addToast('Added to cart ✅', 'success');
      } catch (err) {
        console.error('Error updating guest cart', err);
        addToast('Failed to add to cart', 'error');
      }
      return;
    }

    try {
      setStatus('');
      await api.post('/cart/add', { itemId: item._id, quantity: 1 });
      addToast('Added to cart ✅', 'success');
      // dispatch a global cart update event used elsewhere
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (err) {
      console.error(err);
      addToast('Failed to add to cart', 'error');
    }
  };

  if (loading) return <div className="page">Loading item…</div>;
  if (!item) return <div className="page">Item not found</div>;

  return (
    <div className="page">
      <div className="page-header">
        <h1>{item.name}</h1>
        <p className="muted">{item.brand} • {item.category}</p>
      </div>

      <div className="card" style={{display:'grid',gridTemplateColumns:'320px 1fr',gap:20}}>
        <div>
          <div style={{height:240,background:'#f3f4f6',borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center'}}>
            {item.imageUrl ? (
                  // allow absolute or relative urls; prefix backend root when needed
                  <img
                    src={item.imageUrl.startsWith('/') ? `${API_ROOT}${item.imageUrl}` : item.imageUrl}
                    alt={item.name}
                    style={{maxWidth:'100%',maxHeight:'100%',borderRadius:6}}
                  />
                ) : (
                  <div className="muted">No image</div>
                )}
          </div>

          <div style={{marginTop:12}}>
            <div style={{fontWeight:700,fontSize:20}}>${item.price}</div>
            <div className="muted">{item.quantity} available</div>
          </div>
        </div>

        <div>
          <h3 style={{marginTop:0}}>Description</h3>
          <p style={{color:'#374151'}}>{item.description || 'No description provided.'}</p>

          <div style={{marginTop:18}}>
            <button className="btn-primary" onClick={handleAdd} disabled={item.quantity <= 0}>
              {item.quantity > 0 ? 'Add to Cart' : 'Out of stock'}
            </button>
            {status && <div style={{marginTop:10}} className={status.includes('Failed')||status.includes('Error') ? 'error-text' : 'status-text'}>{status}</div>} 
          </div>
        </div>
      </div>
    </div>
  );
}
