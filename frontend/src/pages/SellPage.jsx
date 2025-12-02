import React, { useState, useEffect } from 'react';
import api, { postMultipart } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';

function SellPage() {
  const { token } = useAuth();
  const [form, setForm] = useState({
    name: '',
    description: '',
    category: '',
    brand: '',
    price: '',
    quantity: '',
    imageUrl: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [status, setStatus] = useState(null); // { type: 'success'|'error', message: string }
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  useEffect(() => {
    if (!imageFile) {
      if (imagePreview) {
        try { URL.revokeObjectURL(imagePreview); } catch (_) {}
      }
      setImagePreview(null);
      return;
    }
    const url = URL.createObjectURL(imageFile);
    setImagePreview(url);
    return () => {
      try { URL.revokeObjectURL(url); } catch (_) {}
    };
  }, [imageFile]);

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus(null);

    // Basic validation
    if (!form.name || !form.price || !form.quantity) {
      setStatus({ type: 'error', message: 'Name, price, and quantity are required.' });
      return;
    }

    setIsSubmitting(true);
    try {
      if (imageFile) {
        const fd = new FormData();
        fd.append('name', form.name);
        fd.append('description', form.description || '');
        fd.append('category', form.category || '');
        fd.append('brand', form.brand || '');
        fd.append('price', String(form.price));
        fd.append('quantity', String(form.quantity));
        fd.append('image', imageFile, imageFile.name);
        await postMultipart('/items', fd);
      } else {
        const payload = {
          ...form,
          price: Number(form.price),
          quantity: Number(form.quantity),
        };
        await api.post('/items', payload);
      }

      setStatus({ type: 'success', message: 'Item listed successfully!' });
      setForm({ name: '', description: '', category: '', brand: '', price: '', quantity: '', imageUrl: '' });
      setImageFile(null);
    } catch (err) {
      console.error('Error listing item:', err);
      const message = err?.message || err?.response?.data?.message || 'Failed to list item. Please try again.';
      setStatus({ type: 'error', message });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Sell an Item</h1>
        <p>List a product on CampusTech Store with your own price and quantity.</p>
      </div>

      <form className="card form-card" onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-field">
            <label htmlFor="name">Item name*</label>
            <input
              id="name"
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="brand">Brand</label>
            <input
              id="brand"
              name="brand"
              type="text"
              value={form.brand}
              onChange={handleChange}
            />
          </div>

          <div className="form-field">
            <label htmlFor="category">Category</label>
            <input
              id="category"
              name="category"
              type="text"
              placeholder="e.g., computer, book"
              value={form.category}
              onChange={handleChange}
            />
          </div>

          <div className="form-field">
            <label htmlFor="price">Price (CAD)*</label>
            <input
              id="price"
              name="price"
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="quantity">Quantity*</label>
            <input
              id="quantity"
              name="quantity"
              type="number"
              min="1"
              step="1"
              value={form.quantity}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-field form-field-full">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              rows="3"
              value={form.description}
              onChange={handleChange}
            />
          </div>

          <div className="form-field form-field-full">
            <label htmlFor="imageFile">Image file</label>
            <input
              id="imageFile"
              name="imageFile"
              type="file"
              accept="image/png,image/jpeg"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
            />
            {imagePreview && (
              <div style={{marginTop:8}}>
                <img src={imagePreview} alt="preview" style={{maxHeight:120,borderRadius:8}} />
              </div>
            )}
          </div>
        </div>

        {status && (
          <div
            className={
              status.type === 'success' ? 'status status-success' : 'status status-error'
            }
          >
            {status.message}
          </div>
        )}

        <button type="submit" className="btn-primary" disabled={isSubmitting}>
          {isSubmitting ? 'Listing…' : 'List Item'}
        </button>
      </form>
    </div>
  );
}

export default SellPage;