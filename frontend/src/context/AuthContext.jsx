import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);      // { id, name, email, isAdmin }
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);

  // Load from localStorage on first mount
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  // refresh cart count when token changes or on cartUpdated events
  useEffect(() => {
    let mounted = true;
    async function refresh() {
      try {
        if (token) {
          const res = await api.get('/cart');
          const cart = res.data;
          const count = cart.items.reduce((s, it) => s + (it.quantity || 0), 0);
          if (mounted) setCartCount(count);
        } else {
          // guest cart stored in localStorage under 'guest_cart'
          const guest = JSON.parse(localStorage.getItem('guest_cart') || '[]');
          const count = guest.reduce((s, it) => s + (it.quantity || 0), 0);
          if (mounted) setCartCount(count);
        }
      } catch (e) {
        // ignore
      }
    }
    refresh();

    const onUpdate = () => refresh();
    window.addEventListener('cartUpdated', onUpdate);
    return () => {
      mounted = false;
      window.removeEventListener('cartUpdated', onUpdate);
    };
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { token: jwt, user: userObj } = res.data;
    setToken(jwt);
    setUser(userObj);
    // store user and token
    localStorage.setItem('token', jwt);
    localStorage.setItem('user', JSON.stringify(userObj));
    // update cart count after login
    try {
      // merge any guest cart into server cart
      const raw = localStorage.getItem('guest_cart') || '[]';
      const guest = JSON.parse(raw);
      if (guest && guest.length > 0) {
        for (const g of guest) {
          try {
            await api.post('/cart/add', { itemId: g.itemId, quantity: g.quantity });
          } catch (_) {}
        }
        localStorage.removeItem('guest_cart');
      }

      const cartRes = await api.get('/cart');
      const cart = cartRes.data;
      const count = cart.items.reduce((s, it) => s + (it.quantity || 0), 0);
      setCartCount(count);
      // notify any listeners
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (_) {}
  };

  const register = async (payload) => {
    // Accept either (name,email,password) or a payload object
    let body = {};
    if (typeof payload === 'object') {
      body = payload;
    } else {
      const [name, email, password] = arguments;
      body = { name, email, password };
    }
    // First register, then login for convenience
    await api.post('/auth/register', body);
    await login(body.email, body.password);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setCartCount(0);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading, setUser, cartCount }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}