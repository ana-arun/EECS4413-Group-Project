import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { updateProfile } from '../api.js';

function RegisterPage() {
  const { register, token } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('');
  // billing metadata (metadata only; no full card numbers stored)
  const [cardBrand, setCardBrand] = useState('');
  const [cardLast4, setCardLast4] = useState('');
  const [expMonth, setExpMonth] = useState('');
  const [expYear, setExpYear] = useState('');
  const [showBillingPrompt, setShowBillingPrompt] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await register({
        name,
        email,
        password,
        phone,
        address,
        city,
        postalCode,
        country,
        // billing is optional and will be requested after registration
      });
      setShowBillingPrompt(true);
    } catch (err) {
      console.error(err);
      setError('Could not register. Try a different email.');
    }
  };

  const handleSaveBilling = async () => {
    try {
      if (!token) throw new Error('Not authenticated');
      await updateProfile(token, {
        billing: {
          cardBrand: cardBrand || '',
          last4: cardLast4 || '',
          expMonth: expMonth || '',
          expYear: expYear || ''
        }
      });
      setShowBillingPrompt(false);
      navigate('/');
    } catch (err) {
      console.error('Failed to save billing', err);
      setError('Failed to save billing info. You can add it later from your profile.');
    }
  };

  const handleSkipBilling = () => {
    setShowBillingPrompt(false);
    navigate('/');
  };

  return (
    <div className="page auth-page">
      <h1>Register</h1>
      <form className="card-form" onSubmit={handleSubmit}>
        <label>
          Name
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </label>

        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>

        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>

        <label>
          Phone
          <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </label>

        <label>
          Address
          <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} />
        </label>

        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
          <label style={{ width: '60%' }}>
            City
            <input style={{ width: '100%' }} type="text" value={city} onChange={(e) => setCity(e.target.value)} />
          </label>
          <label style={{ width: '20%' }}>
            Postal Code
            <input style={{ width: '100%' }} type="text" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} />
          </label>
          <label style={{ width: '20%' }}>
            Country
            <input style={{ width: '100%' }} type="text" value={country} onChange={(e) => setCountry(e.target.value)} />
          </label>
        </div>

        {error && <div className="error">{error}</div>}

        <button type="submit" className="btn-primary">
          Register
        </button>

        <div style={{ fontSize: '0.9rem' }}>
          Already have an account? <Link to="/login">Login</Link>
        </div>
      </form>
      {showBillingPrompt && (
        <div className="card" style={{ position: 'fixed', left: '50%', top: '20%', transform: 'translateX(-50%)', width: 420, zIndex: 1000 }}>
          <h3>Add billing (optional)</h3>
          <p className="muted">You can add billing metadata now to speed up checkout, or skip and add later from your profile.</p>
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <label style={{ flex: 1 }}>
              Card Brand
              <input value={cardBrand} onChange={(e) => setCardBrand(e.target.value)} placeholder="Visa, Mastercard" />
            </label>
            <label style={{ width: 120 }}>
              Last 4
              <input value={cardLast4} onChange={(e) => setCardLast4(e.target.value)} placeholder="1234" />
            </label>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <label style={{ width: 120 }}>
              Exp MM
              <input value={expMonth} onChange={(e) => setExpMonth(e.target.value)} placeholder="MM" />
            </label>
            <label style={{ width: 120 }}>
              Exp YY
              <input value={expYear} onChange={(e) => setExpYear(e.target.value)} placeholder="YY" />
            </label>
            <div style={{ flex: 1 }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
            <button className="btn-ghost" onClick={handleSkipBilling}>Skip</button>
            <button className="btn-primary" onClick={handleSaveBilling}>Save</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default RegisterPage;