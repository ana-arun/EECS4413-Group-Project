// src/pages/CartPage.jsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api, { getCart, addToCart, checkout, getProfile, setCartQuantity } from '../api';
import OrderSummary from '../components/OrderSummary.jsx';
import { useNavigate } from 'react-router-dom';

export default function CartPage() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [orderSummary, setOrderSummary] = useState(null);

  const [shipping, setShipping] = useState({
    fullName: '',
    address: '',
    city: '',
    postalCode: '',
    country: ''
  });

  const [card, setCard] = useState({
    number: '',
    name: '',
    expMonth: '',
    expYear: '',
    cvv: ''
  });

  const [saveBilling, setSaveBilling] = useState(false);

  const loadCart = async () => {
    try {
      setLoading(true);
      // Always load cart (handles guest cart too)
      if (token) {
        const data = await getCart(token);
        setCart(data);
      } else {
        // load guest cart from localStorage and fetch item details
        const raw = localStorage.getItem('guest_cart') || '[]';
        const guest = JSON.parse(raw);
        if (!guest || guest.length === 0) {
          setCart({ items: [] });
        } else {
          const items = await Promise.all(
            guest.map(async (g) => {
              const res = await api.get(`/items/${g.itemId}`);
              return { item: res.data, quantity: g.quantity };
            })
          );
          setCart({ items });
        }
      }
    } catch (err) {
      console.error(err);
      setStatus(err.message || 'Error loading cart');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();

    // If logged in, prefill shipping from profile
    async function loadProfileIfAny() {
      try {
        if (token) {
          const p = await getProfile(token);
          if (p) {
            setShipping((s) => ({
              fullName: p.name || s.fullName,
              address: p.address || s.address,
              city: p.city || s.city,
              postalCode: p.postalCode || s.postalCode,
              country: p.country || s.country
            }));
            if (p.billing) {
              setCard((c) => ({
                ...c,
                number: '', // do not prefill full number
                name: p.name || c.name,
                expMonth: p.billing.expMonth || c.expMonth,
                expYear: p.billing.expYear || c.expYear
              }));
              // populate last4 to show masked info if desired
            }
          }
        }
      } catch (err) {
        // ignore profile load errors
      }
    }

    loadProfileIfAny();
  }, [token]);

  const changeQty = async (itemId, delta) => {
    try {
      if (!token) {
        const raw = localStorage.getItem('guest_cart') || '[]';
        const guest = JSON.parse(raw);
        const found = guest.find((g) => g.itemId === itemId);
        if (found) {
          found.quantity = (found.quantity || 0) + delta;
          if (found.quantity <= 0) {
            const idx = guest.findIndex((g) => g.itemId === itemId);
            if (idx >= 0) guest.splice(idx, 1);
          }
        }
        localStorage.setItem('guest_cart', JSON.stringify(guest));
        window.dispatchEvent(new Event('cartUpdated'));
        loadCart();
        return;
      }

      await addToCart(token, { itemId, quantity: delta });
      loadCart();
    } catch (err) {
      console.error(err);
      setStatus(err.message || 'Error updating cart');
    }
  };

  const setQty = async (itemId, qty) => {
    try {
      qty = Number(qty) || 0;
      if (!token) {
        const raw = localStorage.getItem('guest_cart') || '[]';
        const guest = JSON.parse(raw);
        const found = guest.find((g) => g.itemId === itemId);
        if (found) {
          if (qty <= 0) {
            const idx = guest.findIndex((g) => g.itemId === itemId);
            if (idx >= 0) guest.splice(idx, 1);
          } else {
            found.quantity = qty;
          }
        } else {
          if (qty > 0) guest.push({ itemId, quantity: qty });
        }
        localStorage.setItem('guest_cart', JSON.stringify(guest));
        window.dispatchEvent(new Event('cartUpdated'));
        loadCart();
        return;
      }

      await setCartQuantity(token, { itemId, quantity: qty });
      loadCart();
    } catch (err) {
      console.error(err);
      setStatus(err.message || 'Error updating cart');
    }
  };

  const total = cart
    ? cart.items.reduce((sum, ci) => sum + ci.item.price * ci.quantity, 0)
    : 0;

  const handleShippingChange = (e) => {
    const { name, value } = e.target;
    setShipping((s) => ({ ...s, [name]: value }));
  };

  const handleCardChange = (e) => {
    const { name, value } = e.target;
    setCard((c) => ({ ...c, [name]: value }));
  };

  function getCardBrand(num) {
    const n = num.replace(/\s+/g, '');
    if (/^4[0-9]{12}(?:[0-9]{3})?$/.test(n)) return 'Visa';
    if (/^5[1-5][0-9]{14}$/.test(n)) return 'Mastercard';
    if (/^3[47][0-9]{13}$/.test(n)) return 'Amex';
    return 'Card';
  }

  const handleCheckout = async () => {
    setStatus('');

    if (!cart || cart.items.length === 0) {
      setStatus('Cart is empty');
      return;
    }

    // basic validation
    if (
      !shipping.fullName ||
      !shipping.address ||
      !shipping.city ||
      !shipping.postalCode ||
      !shipping.country
    ) {
      setStatus('Please fill in all shipping fields.');
      return;
    }

    const cleanNumber = card.number.replace(/\s+/g, '');
    if (cleanNumber.length < 12) {
      setStatus('Please enter a valid card number (dev-only, fake is fine).');
      return;
    }

    try {
      // require login to complete checkout
      if (!token) {
        // redirect to login and preserve return path
        navigate('/login', { state: { from: '/cart' } });
        return;
      }
      const payment = {
        cardBrand: getCardBrand(cleanNumber),
        last4: cleanNumber.slice(-4)
      };

      const res = await checkout(token, { shipping, payment, saveBilling });
      const savedOrder = res.data;
      setOrderSummary(savedOrder);
      setStatus('Order placed successfully ✅');
      // clear cart view and notify app to refresh badge
      setCart({ ...cart, items: [] });
      // clear guest cart just in case
      localStorage.removeItem('guest_cart');
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (err) {
      console.error(err);
      setStatus(err.message || (err.response && err.response.data && err.response.data.message) || 'Error during checkout');
    }
  };

  if (loading) return <div className="page-container">Loading cart…</div>;

  return (
    <div className="page-container">
      <h1>Cart</h1>

      {(!cart || cart.items.length === 0) && <p>Your cart is empty.</p>}

      {orderSummary && <OrderSummary order={orderSummary} />}

      {cart && cart.items.length > 0 && (
        <>
          <div className="card cart-card">
            {cart.items.map((ci) => (
              <div key={ci.item._id} className="cart-row">
                <div className="cart-row-main">
                  <div className="cart-item-name">{ci.item.name}</div>
                  <div className="cart-item-price">${ci.item.price}</div>
                </div>
                <div className="cart-row-controls">
                  <button onClick={() => changeQty(ci.item._id, -1)}>-</button>
                  <input
                    type="number"
                    min={0}
                    defaultValue={ci.quantity}
                    onBlur={(e) => setQty(ci.item._id, e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { setQty(ci.item._id, e.target.value); } }}
                    style={{ width: 64, textAlign: 'center' }}
                  />
                  <button onClick={() => changeQty(ci.item._id, +1)}>+</button>
                  <button onClick={() => setQty(ci.item._id, 0)}>Remove</button>
                </div>
              </div>
            ))}

            <div className="cart-total">
              <span>Total:</span>
              <strong>${total}</strong>
            </div>
          </div>

          {/* Checkout form */}
          <h2 style={{ marginTop: '2rem' }}>Checkout</h2>
          <div className="checkout-grid">
            <div className="card form-card">
              <h3>Shipping Information</h3>
              <div className="form-row">
                <label>Full Name</label>
                <input
                  name="fullName"
                  value={shipping.fullName}
                  onChange={handleShippingChange}
                />
              </div>
              <div className="form-row">
                <label>Address</label>
                <input
                  name="address"
                  value={shipping.address}
                  onChange={handleShippingChange}
                />
              </div>
              <div className="form-grid-3">
                <div className="form-row">
                  <label>City</label>
                  <input
                    name="city"
                    value={shipping.city}
                    onChange={handleShippingChange}
                  />
                </div>
                <div className="form-row">
                  <label>Postal Code</label>
                  <input
                    name="postalCode"
                    value={shipping.postalCode}
                    onChange={handleShippingChange}
                  />
                </div>
                <div className="form-row">
                  <label>Country</label>
                  <input
                    name="country"
                    value={shipping.country}
                    onChange={handleShippingChange}
                  />
                </div>
              </div>
            </div>

            <div className="card form-card">
              <h3>Payment (dev-only)</h3>
              <div className="form-row">
                <label>Card Number</label>
                <input
                  name="number"
                  value={card.number}
                  onChange={handleCardChange}
                  placeholder="1111 2222 3333 4444"
                />
              </div>
              <div className="form-row">
                <label>Name on Card</label>
                <input
                  name="name"
                  value={card.name}
                  onChange={handleCardChange}
                />
              </div>
              <div className="form-grid-3">
                <div className="form-row">
                  <label>Exp. Month</label>
                  <input
                    name="expMonth"
                    value={card.expMonth}
                    onChange={handleCardChange}
                    placeholder="MM"
                  />
                </div>
                <div className="form-row">
                  <label>Exp. Year</label>
                  <input
                    name="expYear"
                    value={card.expYear}
                    onChange={handleCardChange}
                    placeholder="YY"
                  />
                </div>
                <div className="form-row">
                  <label>CVV</label>
                  <input
                    name="cvv"
                    value={card.cvv}
                    onChange={handleCardChange}
                    placeholder="123"
                  />
                </div>
              </div>

              <div style={{ marginTop: 12 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input type="checkbox" checked={saveBilling} onChange={(e) => setSaveBilling(e.target.checked)} />
                  <span>Save this card to my account</span>
                </label>
              </div>

              <button className="btn-primary" onClick={handleCheckout}>
                Place Order
              </button>
            </div>
          </div>
        </>
      )}

      {status && <p className="status-text" style={{ marginTop: '1rem' }}>{status}</p>}
    </div>
  );
}