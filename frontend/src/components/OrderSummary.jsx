import React from 'react';

export default function OrderSummary({ order }) {
  if (!order) return null;

  return (
    <div className="card" style={{ marginTop: 18 }}>
      <h2>Order Summary</h2>
      <div style={{ marginBottom: 8 }}>
        <strong>Order ID:</strong> {order._id}
      </div>
      <div style={{ marginBottom: 8 }}>
        <strong>Placed:</strong> {new Date(order.createdAt).toLocaleString()}
      </div>
      <div style={{ marginBottom: 8 }}>
        <strong>Shipping:</strong>
        <div style={{ marginLeft: 8 }}>{order.shipping?.fullName}</div>
        <div style={{ marginLeft: 8 }}>{order.shipping?.address}, {order.shipping?.city} {order.shipping?.postalCode}, {order.shipping?.country}</div>
      </div>
      <div>
        <strong>Items</strong>
        <ul>
          {order.items.map((it) => (
            <li key={it._id || it.item?._id}>
              {it.item?.name || 'Item'} — {it.quantity} × ${it.priceAtPurchase ?? it.item?.price}
            </li>
          ))}
        </ul>
      </div>
      <div style={{ marginTop: 8, fontWeight: 700 }}>Total: ${order.totalAmount}</div>
    </div>
  );
}
