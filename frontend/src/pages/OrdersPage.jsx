import React, { useEffect, useState } from 'react';
import api from '../api.js';

function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadOrders = async () => {
    try {
      const res = await api.get('/orders');
      setOrders(res.data);
    } catch (err) {
      console.error(err);
      alert('Error loading orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  if (loading) {
    return (
      <div className="page">
        <h1>Orders</h1>
        <p>Loading orders...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="page">
        <h1>Orders</h1>
        <p>You have no orders yet.</p>
      </div>
    );
  }

  return (
    <div className="page">
      <h1>Orders</h1>
      <div className="orders-list">
        {orders.map((order) => (
          <div key={order._id} className="order-card">
            <div style={{ fontWeight: 600 }}>
              Order #{order._id.substring(order._id.length - 6)}
            </div>
            <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>
              Placed on {new Date(order.createdAt).toLocaleString()}
            </div>
            <ul style={{ marginTop: '0.5rem', paddingLeft: '1.25rem' }}>
              {order.items.map((oi) => (
                <li key={oi._id || oi.item?._id}>
                  {oi.item?.name || 'Item'} — {oi.quantity} × ${oi.priceAtPurchase ?? oi.item?.price ?? 0}
                </li>
              ))}
            </ul>
            <div style={{ marginTop: '0.5rem', fontWeight: 600 }}>
              Total: ${order.totalAmount}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default OrdersPage;