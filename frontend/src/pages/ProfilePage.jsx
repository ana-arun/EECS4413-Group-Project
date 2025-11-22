// src/pages/ProfilePage.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getProfile, updateProfile } from '../api';
import { useToast } from '../context/ToastContext.jsx';

export default function ProfilePage() {
  const { token, user, setUser } = useAuth();
  const [form, setForm] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: '',
    avatar: ''
  });
  const [status, setStatus] = useState('');
  const { addToast } = useToast ? useToast() : { addToast: () => {} };

  useEffect(() => {
    async function load() {
      try {
        const data = await getProfile(token);
        setForm({
          name: data.name || '',
          phone: data.phone || '',
          address: data.address || '',
          city: data.city || '',
          postalCode: data.postalCode || '',
          country: data.country || '',
          avatar: data.avatar || ''
        });
      } catch (err) {
        console.error(err);
      }
    }
    if (token) load();
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('');
    try {
      const updated = await updateProfile(token, form);
      setStatus('Profile updated ✅');
      // sync auth context display name and avatar
      setUser(updated);
      localStorage.setItem('user', JSON.stringify(updated));
      if (addToast) addToast('Profile updated', 'success');
    } catch (err) {
      setStatus(err.message || 'Error updating profile');
      if (addToast) addToast('Failed to update profile', 'error');
    }
  };

  return (
    <div className="page-container">
      <h1>My Profile</h1>

      <form className="card form-card" onSubmit={handleSubmit}>
        <div className="form-row">
          <label>Name</label>
          <input name="name" value={form.name} onChange={handleChange} />
        </div>

        <div className="form-row">
          <label>Avatar URL</label>
          <input name="avatar" value={form.avatar} onChange={handleChange} placeholder="https://...jpg or leave empty" />
        </div>

        <div className="form-row">
          <label>Phone</label>
          <input name="phone" value={form.phone} onChange={handleChange} />
        </div>

        <div className="form-row">
          <label>Address</label>
          <input name="address" value={form.address} onChange={handleChange} />
        </div>

        <div className="form-grid-3">
          <div className="form-row">
            <label>City</label>
            <input name="city" value={form.city} onChange={handleChange} />
          </div>
          <div className="form-row">
            <label>Postal Code</label>
            <input name="postalCode" value={form.postalCode} onChange={handleChange} />
          </div>
          <div className="form-row">
            <label>Country</label>
            <input name="country" value={form.country} onChange={handleChange} />
          </div>
        </div>

        <button type="submit" className="btn-primary">
          Save Profile
        </button>

        <div style={{ marginTop: 12 }}>
          <Link to="/orders" className="btn-ghost">View My Orders</Link>
        </div>

        {status && <p className="status-text">{status}</p>}
      </form>
    </div>
  );
}