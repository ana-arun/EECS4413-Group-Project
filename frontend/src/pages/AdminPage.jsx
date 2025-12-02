import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import api, { postMultipart, putMultipart } from '../api';

export default function AdminPage() {
  const { token, user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [items, setItems] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('orders');
  const [filters, setFilters] = useState({ user: '', item: '', from: '', to: '' });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUserOrders, setSelectedUserOrders] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [editImageFile, setEditImageFile] = useState(null);
  const [editImagePreview, setEditImagePreview] = useState(null);

  useEffect(() => {
    if (!user || !user.isAdmin) return;
    async function loadAll() {
      setLoading(true);
      try {
        const [oRes, iRes, uRes] = await Promise.all([
          api.get('/orders/admin/all'),
          api.get('/items'),
          api.get('/users/admin/list')
        ]);
        setOrders(oRes.data || []);
        setItems(iRes.data || []);
        setUsers(uRes.data || []);
      } catch (err) {
        console.error('Admin load error', err);
      } finally {
        setLoading(false);
      }
    }
    loadAll();
  }, [user]);

  if (!user || !user.isAdmin) {
    return (
      <div className="page">
        <h1>Admin</h1>
        <p>Access denied — admin only.</p>
      </div>
    );
  }

  const refreshOrders = async () => {
    try {
      const q = new URLSearchParams();
      if (filters.user) q.set('user', filters.user);
      if (filters.item) q.set('item', filters.item);
      if (filters.from) q.set('from', filters.from);
      if (filters.to) q.set('to', filters.to);
      const res = await api.get(`/orders/admin/all?${q.toString()}`);
      setOrders(res.data || []);
    } catch (err) {
      console.error('Failed to refresh orders', err);
    }
  };

  const updateInventory = async (itemId, qty) => {
    try {
      await api.put(`/items/${itemId}/inventory`, { quantity: Number(qty) });
      const it = await api.get('/items');
      setItems(it.data || []);
    } catch (err) {
      console.error('Inventory update failed', err);
    }
  };

  // Add new item (admin only) with image upload
  const [newItem, setNewItem] = useState({ name: '', category: '', brand: '', price: '', quantity: 0 });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const addNewItem = async (e) => {
    e.preventDefault();
    try {
      // client-side validation for file type and size
      if (imageFile) {
        const allowed = ['image/png', 'image/jpeg', 'image/jpg'];
        if (!allowed.includes(imageFile.type)) {
          throw new Error('Only PNG and JPG images are allowed');
        }
        const max = 5 * 1024 * 1024; // 5MB
        if (imageFile.size > max) {
          throw new Error('Image is too large. Max size is 5MB');
        }
      }
      const fd = new FormData();
      fd.append('name', newItem.name);
      fd.append('category', newItem.category);
      fd.append('brand', newItem.brand || '');
      fd.append('price', String(newItem.price));
      fd.append('quantity', String(newItem.quantity || 0));
      if (imageFile) fd.append('image', imageFile, imageFile.name);

      // ensure token present
      const t = localStorage.getItem('token');
      if (!t) throw new Error('Not authenticated. Please login as admin before adding items.');

      await postMultipart('/items', fd);
      const it = await api.get('/items');
      setItems(it.data || []);
      setNewItem({ name: '', category: '', brand: '', price: '', quantity: 0 });
      setImageFile(null);
      setImagePreview(null);
      alert('Item added');
    } catch (err) {
      console.error('Failed to add item', err);
      // show detailed message when available
      const msg = err && err.message ? err.message : 'Failed to add item';
      alert(`Error creating item: ${msg}`);
    }
  };

  const handleFileInput = (file) => {
    if (!file) {
      setImageFile(null);
      setImagePreview(null);
      return;
    }
    setImageFile(file);
    try {
      if (imagePreview) {
        try { URL.revokeObjectURL(imagePreview); } catch (_) {}
      }
      const url = URL.createObjectURL(file);
      setImagePreview(url);
    } catch (e) {
      setImagePreview(null);
    }
  };

  const updateUser = async (id, data) => {
    try {
      await api.put(`/users/admin/${id}`, data);
      const u = await api.get('/users/admin/list');
      setUsers(u.data || []);
    } catch (err) {
      console.error('Update user failed', err);
    }
  };

  return (
    <div className="page">
      <h1>Admin Dashboard</h1>

      {tab === 'inventory' && (
        <section className="card" style={{ marginBottom: 12 }}>
          <h3>Add Listing</h3>
          <form onSubmit={addNewItem} style={{ display: 'grid', gap: 8 }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <input placeholder="Name" value={newItem.name} onChange={(e) => setNewItem((s) => ({ ...s, name: e.target.value }))} required style={{ flex: 2 }} />
              <input placeholder="Category" value={newItem.category} onChange={(e) => setNewItem((s) => ({ ...s, category: e.target.value }))} required style={{ flex: 1 }} />
              <input placeholder="Brand" value={newItem.brand} onChange={(e) => setNewItem((s) => ({ ...s, brand: e.target.value }))} style={{ flex: 1 }} />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input placeholder="Price" type="number" step="0.01" value={newItem.price} onChange={(e) => setNewItem((s) => ({ ...s, price: e.target.value }))} required style={{ width: 140 }} />
              <input placeholder="Quantity" type="number" value={newItem.quantity} onChange={(e) => setNewItem((s) => ({ ...s, quantity: e.target.value }))} style={{ width: 140 }} />
              <input type="file" accept="image/png,image/jpeg" onChange={(e) => handleFileInput(e.target.files?.[0] || null)} />
              <button className="btn-primary" type="submit">Add</button>
            </div>
          </form>
          {imagePreview && (
            <div style={{ marginTop: 8 }}>
              <strong>Preview:</strong>
              <div style={{ marginTop: 6 }}>
                <img src={imagePreview} alt="preview" style={{ maxHeight: 120, borderRadius: 6 }} />
              </div>
            </div>
          )}
        </section>
      )}

      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <button className={tab === 'orders' ? 'btn-primary' : 'btn-ghost'} onClick={() => setTab('orders')}>Orders</button>
        <button className={tab === 'inventory' ? 'btn-primary' : 'btn-ghost'} onClick={() => setTab('inventory')}>Inventory</button>
        <button className={tab === 'customers' ? 'btn-primary' : 'btn-ghost'} onClick={() => setTab('customers')}>Customers</button>
      </div>

      {tab === 'orders' && (
        <section className="card">
          <h3>Orders</h3>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <select value={filters.user} onChange={(e) => setFilters((f) => ({ ...f, user: e.target.value }))}>
              <option value="">All users</option>
              {users.map(u => <option key={u._id} value={u._id}>{u.name} ({u.email})</option>)}
            </select>
            <select value={filters.item} onChange={(e) => setFilters((f) => ({ ...f, item: e.target.value }))}>
              <option value="">All products</option>
              {items.map(it => <option key={it._id} value={it._id}>{it.name}</option>)}
            </select>
            <input type="date" value={filters.from} onChange={(e) => setFilters((f) => ({ ...f, from: e.target.value }))} />
            <input type="date" value={filters.to} onChange={(e) => setFilters((f) => ({ ...f, to: e.target.value }))} />
            <button className="btn-primary" onClick={refreshOrders}>Filter</button>
          </div>

          {loading ? <p>Loading…</p> : (
            <div>
              {orders.map(o => (
                <div key={o._id} style={{ padding: 8, borderBottom: '1px solid #eee' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontWeight: 700 }}>Order #{o._id.substring(o._id.length - 6)}</div>
                      <div className="muted">{new Date(o.createdAt).toLocaleString()}</div>
                    </div>
                    <div>
                      <button className="btn-ghost" onClick={() => setSelectedOrder(o)}>Details</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {selectedOrder && (
            <div style={{ marginTop: 12 }} className="card">
              <h4>Order Details</h4>
              <div><strong>User:</strong> {selectedOrder.user}</div>
              <div><strong>Placed:</strong> {new Date(selectedOrder.createdAt).toLocaleString()}</div>
              <div style={{ marginTop: 8 }}>
                <strong>Items</strong>
                <ul>
                  {selectedOrder.items.map(it => (
                    <li key={it._id || it.item._id}>{it.item?.name || 'Item'} — {it.quantity} × ${it.priceAtPurchase ?? it.item?.price}</li>
                  ))}
                </ul>
              </div>
              <div style={{ marginTop: 8 }}><strong>Total:</strong> ${selectedOrder.totalAmount}</div>
              <div style={{ marginTop: 8 }}>
                <button className="btn-secondary" onClick={() => setSelectedOrder(null)}>Close</button>
              </div>
            </div>
          )}
        </section>
      )}

      {tab === 'inventory' && (
        <section className="card">
          <h3>Inventory</h3>
          <div style={{ display: 'grid', gap: 10 }}>
            {items.map(it => (
              <div key={it._id} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <div style={{ flex: 1, cursor: 'pointer', color: '#2563eb', textDecoration: 'underline' }} onClick={() => {
                  setEditingItem({
                    _id: it._id,
                    name: it.name || '',
                    description: it.description || '',
                    category: it.category || '',
                    brand: it.brand || '',
                    price: it.price || 0,
                    quantity: it.quantity || 0,
                    imageUrl: it.imageUrl || ''
                  });
                  setEditImageFile(null);
                  setEditImagePreview(null);
                }}>{it.name} — <span className="muted">{it.brand}</span></div>
                <input type="number" defaultValue={it.quantity} style={{ width: 90 }} onBlur={(e) => updateInventory(it._id, e.target.value)} />
                <button className="btn-ghost" onClick={() => {
                  setEditingItem({
                    _id: it._id,
                    name: it.name || '',
                    description: it.description || '',
                    category: it.category || '',
                    brand: it.brand || '',
                    price: it.price || 0,
                    quantity: it.quantity || 0,
                    imageUrl: it.imageUrl || ''
                  });
                  setEditImageFile(null);
                  setEditImagePreview(null);
                }}>Edit</button>
                <button className="btn-ghost" onClick={async () => {
                  if (!confirm(`Delete listing "${it.name}"? This cannot be undone.`)) return;
                  try {
                    await api.delete(`/items/${it._id}`);
                    const itRes = await api.get('/items');
                    setItems(itRes.data || []);
                    // Also refresh orders and users in case UI depends on them
                    try {
                      const oRes = await api.get('/orders/admin/all');
                      setOrders(oRes.data || []);
                    } catch (_) {}
                    // notify other components (cart badge) that cart data may have changed
                    window.dispatchEvent(new Event('cartUpdated'));
                  } catch (err) {
                    console.error('Delete failed', err);
                    alert('Failed to delete item');
                  }
                }}>Delete</button>
              </div>
            ))}
          </div>

          {editingItem && (
            <div style={{ marginTop: 16, padding: 12, border: '2px solid #2563eb', borderRadius: 8 }}>
              <h4>Edit Product</h4>
              <div style={{ display: 'grid', gap: 10 }}>
                <div>
                  <label>Name</label>
                  <input value={editingItem.name} onChange={(e) => setEditingItem(s => ({ ...s, name: e.target.value }))} />
                </div>
                <div>
                  <label>Description</label>
                  <textarea value={editingItem.description} onChange={(e) => setEditingItem(s => ({ ...s, description: e.target.value }))} rows={3} style={{ width: '100%' }} />
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <div style={{ flex: 1 }}>
                    <label>Category</label>
                    <input value={editingItem.category} onChange={(e) => setEditingItem(s => ({ ...s, category: e.target.value }))} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label>Brand</label>
                    <input value={editingItem.brand} onChange={(e) => setEditingItem(s => ({ ...s, brand: e.target.value }))} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <div>
                    <label>Price</label>
                    <input type="number" step="0.01" value={editingItem.price} onChange={(e) => setEditingItem(s => ({ ...s, price: e.target.value }))} style={{ width: 140 }} />
                  </div>
                  <div>
                    <label>Quantity</label>
                    <input type="number" value={editingItem.quantity} onChange={(e) => setEditingItem(s => ({ ...s, quantity: e.target.value }))} style={{ width: 140 }} />
                  </div>
                </div>
                <div>
                  <label>Change Image (optional)</label>
                  <input type="file" accept="image/png,image/jpeg" onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    if (!file) {
                      setEditImageFile(null);
                      setEditImagePreview(null);
                      return;
                    }
                    setEditImageFile(file);
                    try {
                      if (editImagePreview) {
                        try { URL.revokeObjectURL(editImagePreview); } catch (_) {}
                      }
                      const url = URL.createObjectURL(file);
                      setEditImagePreview(url);
                    } catch (e) {
                      setEditImagePreview(null);
                    }
                  }} />
                  {editImagePreview && (
                    <div style={{ marginTop: 6 }}>
                      <img src={editImagePreview} alt="preview" style={{ maxHeight: 120, borderRadius: 6 }} />
                    </div>
                  )}
                  {!editImagePreview && editingItem.imageUrl && (
                    <div style={{ marginTop: 6 }}>
                      <strong>Current:</strong>
                      <img src={`http://localhost:4000${editingItem.imageUrl}`} alt="current" style={{ maxHeight: 120, borderRadius: 6, marginLeft: 8 }} />
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn-primary" onClick={async () => {
                    try {
                      const fd = new FormData();
                      fd.append('name', editingItem.name);
                      fd.append('description', editingItem.description);
                      fd.append('category', editingItem.category);
                      fd.append('brand', editingItem.brand);
                      fd.append('price', String(editingItem.price));
                      fd.append('quantity', String(editingItem.quantity));
                      if (editImageFile) {
                        fd.append('image', editImageFile, editImageFile.name);
                      }
                      await putMultipart(`/items/${editingItem._id}`, fd);
                      const itRes = await api.get('/items');
                      setItems(itRes.data || []);
                      setEditingItem(null);
                      setEditImageFile(null);
                      setEditImagePreview(null);
                      alert('Product updated');
                    } catch (err) {
                      console.error('Update failed', err);
                      alert(`Failed to update: ${err.message || 'Unknown error'}`);
                    }
                  }}>Save Changes</button>
                  <button className="btn-ghost" onClick={() => {
                    setEditingItem(null);
                    setEditImageFile(null);
                    setEditImagePreview(null);
                  }}>Cancel</button>
                </div>
              </div>
            </div>
          )}
        </section>
      )}

      {tab === 'customers' && (
        <section className="card">
          <h3>Customers</h3>
          <div style={{ display: 'grid', gap: 12 }}>
            {users.map(u => (
              <div key={u._id} style={{ padding: 8, borderBottom: '1px solid #eee' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontWeight: 700 }}>{u.name} <span className="muted">({u.email})</span></div>
                    <div className="muted">{u.address} {u.city} {u.postalCode} {u.country}</div>
                  </div>
                  <div>
                      <button className="btn-ghost" onClick={async () => {
                        try {
                          const res = await api.get(`/orders/admin/all?user=${u._id}`);
                          setSelectedUserOrders(res.data || []);
                          setSelectedUser(u);
                          // prepare editing form
                          setEditingUser({
                            name: u.name || '',
                            phone: u.phone || '',
                            address: u.address || '',
                            city: u.city || '',
                            postalCode: u.postalCode || '',
                            country: u.country || '',
                            billing: {
                              cardBrand: u.billing?.cardBrand || '',
                              last4: u.billing?.last4 || '',
                              expMonth: u.billing?.expMonth || '',
                              expYear: u.billing?.expYear || ''
                            }
                          });
                          setTab('customers');
                        } catch (err) {
                          console.error('Failed to load user orders', err);
                        }
                      }}>Details</button>
                      <button className="btn-ghost" onClick={async () => {
                        // quick view orders only
                        try {
                          const res = await api.get(`/orders/admin/all?user=${u._id}`);
                          setSelectedUserOrders(res.data || []);
                          setSelectedUser(u);
                        } catch (err) {
                          console.error('Failed to load user orders', err);
                        }
                      }}>View Orders</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {selectedUser && (
            <div style={{ marginTop: 12 }} className="card">
              <h4>Customer: {selectedUser.name} ({selectedUser.email})</h4>
              <div style={{ display: 'grid', gap: 8 }}>
                <div>
                  <strong>Shipping</strong>
                  <div>{selectedUser.address} {selectedUser.city} {selectedUser.postalCode} {selectedUser.country}</div>
                </div>
                <div>
                  <strong>Billing</strong>
                  <div>{selectedUser.billing?.cardBrand || ''} •••• {selectedUser.billing?.last4 || ''} </div>
                </div>

                {/* Editing form: shown when editingUser is set */}
                {editingUser && (
                  <div style={{ marginTop: 8 }}>
                    <h5>Edit Customer</h5>
                    <div style={{ display: 'grid', gap: 8 }}>
                      <div>
                        <label>Name</label>
                        <input value={editingUser.name} onChange={(e) => setEditingUser((s) => ({ ...s, name: e.target.value }))} />
                      </div>
                      <div>
                        <label>Phone</label>
                        <input value={editingUser.phone} onChange={(e) => setEditingUser((s) => ({ ...s, phone: e.target.value }))} />
                      </div>
                      <div>
                        <label>Address</label>
                        <input value={editingUser.address} onChange={(e) => setEditingUser((s) => ({ ...s, address: e.target.value }))} />
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <input style={{ flex: 1 }} value={editingUser.city} placeholder="City" onChange={(e) => setEditingUser((s) => ({ ...s, city: e.target.value }))} />
                        <input style={{ width: 140 }} value={editingUser.postalCode} placeholder="Postal" onChange={(e) => setEditingUser((s) => ({ ...s, postalCode: e.target.value }))} />
                        <input style={{ width: 140 }} value={editingUser.country} placeholder="Country" onChange={(e) => setEditingUser((s) => ({ ...s, country: e.target.value }))} />
                      </div>

                      <div>
                        <h6>Billing (metadata only)</h6>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <input value={editingUser.billing.cardBrand} placeholder="Card Brand" onChange={(e) => setEditingUser((s) => ({ ...s, billing: { ...s.billing, cardBrand: e.target.value } }))} />
                          <input value={editingUser.billing.last4} placeholder="Last4" onChange={(e) => setEditingUser((s) => ({ ...s, billing: { ...s.billing, last4: e.target.value } }))} />
                          <input value={editingUser.billing.expMonth} placeholder="MM" onChange={(e) => setEditingUser((s) => ({ ...s, billing: { ...s.billing, expMonth: e.target.value } }))} />
                          <input value={editingUser.billing.expYear} placeholder="YY" onChange={(e) => setEditingUser((s) => ({ ...s, billing: { ...s.billing, expYear: e.target.value } }))} />
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn-primary" onClick={async () => {
                          try {
                            await updateUser(selectedUser._id, {
                              name: editingUser.name,
                              phone: editingUser.phone,
                              address: editingUser.address,
                              city: editingUser.city,
                              postalCode: editingUser.postalCode,
                              country: editingUser.country,
                              billing: editingUser.billing
                            });
                            // refresh user list
                            const u = await api.get('/users/admin/list');
                            setUsers(u.data || []);
                            // refresh selectedUser object to reflect changes
                            const latest = (u.data || []).find(x => x._id === selectedUser._id) || null;
                            setSelectedUser(latest);
                            setEditingUser(null);
                          } catch (err) {
                            console.error('Failed to save user', err);
                            alert('Failed to save user');
                          }
                        }}>Save</button>

                        <button className="btn-ghost" onClick={() => setEditingUser(null)}>Cancel</button>
                      </div>
                    </div>
                  </div>
                )}

                <div style={{ marginTop: 8 }}>
                  <h5>Purchase History</h5>
                  {selectedUserOrders.length === 0 ? <div className="muted">No orders</div> : (
                    <div>
                      {selectedUserOrders.map(o => (
                        <div key={o._id} style={{ padding: 6, borderBottom: '1px solid #eee' }}>
                          <div style={{ fontWeight: 700 }}>Order #{o._id.substring(o._id.length - 6)} — {new Date(o.createdAt).toLocaleString()}</div>
                          <div>Items: {o.items.map(it => `${it.item?.name || 'Item'} x${it.quantity}`).join(', ')}</div>
                          <div>Total: ${o.totalAmount}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </section>
      )}

    </div>
  );
}
