// src/api.js
export const API_ROOT = 'http://localhost:4000';
const BASE_URL = `${API_ROOT}/api`;

async function rawRequest(path, opts = {}) {
  const res = await fetch(`${BASE_URL}${path}`, opts);
  if (!res.ok) {
    let msg = 'Request failed';
    try {
      const data = await res.json();
      msg = data.message || msg;
    } catch (e) {}
    const err = new Error(msg);
    err.status = res.status;
    throw err;
  }

  if (res.status === 204) return null;
  return res.json();
}

function getAuthHeader() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function buildOpts(method = 'GET', body = null, extraHeaders = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...extraHeaders,
  };

  const opts = { method, headers };
  if (body != null) opts.body = JSON.stringify(body);
  return opts;
}

const api = {
  async get(path) {
    const data = await rawRequest(path, buildOpts('GET'));
    return { data };
  },
  async post(path, body) {
    const data = await rawRequest(path, buildOpts('POST', body));
    return { data };
  },
  async put(path, body) {
    const data = await rawRequest(path, buildOpts('PUT', body));
    return { data };
  },
  async delete(path) {
    const data = await rawRequest(path, buildOpts('DELETE'));
    return { data };
  },
};

export default api;

// helper for multipart/form-data posts (file uploads)
export async function postMultipart(path, formData) {
  const token = localStorage.getItem('token');
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers,
    body: formData
  });
  if (!res.ok) {
    let msg = `Request failed (${res.status})`;
    try {
      const data = await res.json();
      // prefer structured message
      if (data && data.message) msg = data.message;
      else if (typeof data === 'string') msg = data;
    } catch (e) {
      // ignore parse errors
    }
    const err = new Error(msg);
    err.status = res.status;
    throw err;
  }
  if (res.status === 204) return null;
  try {
    return await res.json();
  } catch (e) {
    return null;
  }
}

// helper for multipart/form-data puts (file uploads)
export async function putMultipart(path, formData) {
  const token = localStorage.getItem('token');
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'PUT',
    headers,
    body: formData
  });
  if (!res.ok) {
    let msg = `Request failed (${res.status})`;
    try {
      const data = await res.json();
      if (data && data.message) msg = data.message;
      else if (typeof data === 'string') msg = data;
    } catch (e) {
      // ignore parse errors
    }
    const err = new Error(msg);
    err.status = res.status;
    throw err;
  }
  if (res.status === 204) return null;
  try {
    return await res.json();
  } catch (e) {
    return null;
  }
}

// Backwards-compatible named helpers (optional)
export async function request(path, options = {}) {
  return rawRequest(path, options);
}

export async function fetchItems(params = {}) {
  const qs = new URLSearchParams(params).toString();
  return rawRequest(`/items${qs ? `?${qs}` : ''}`, buildOpts('GET'));
}

// Named helpers kept for compatibility with existing imports
export async function getCart(token) {
  const hdr = token ? { Authorization: `Bearer ${token}` } : {};
  return rawRequest('/cart', buildOpts('GET', null, hdr));
}

export async function addToCart(token, { itemId, quantity }) {
  // support both signatures: addToCart(token, { itemId, quantity })
  const hdr = token ? { Authorization: `Bearer ${token}` } : {};
  return rawRequest('/cart/add', buildOpts('POST', { itemId, quantity }, hdr));
}

export async function checkout(token, { shipping, payment, saveBilling = false }) {
  const hdr = token ? { Authorization: `Bearer ${token}` } : {};
  return rawRequest('/orders/checkout', buildOpts('POST', { shipping, payment, saveBilling }, hdr));
}

export async function setCartQuantity(token, { itemId, quantity }) {
  const hdr = token ? { Authorization: `Bearer ${token}` } : {};
  return rawRequest('/cart/set', buildOpts('POST', { itemId, quantity }, hdr));
}

export async function getProfile(token) {
  const hdr = token ? { Authorization: `Bearer ${token}` } : {};
  return rawRequest('/users/me', buildOpts('GET', null, hdr));
}

export async function updateProfile(token, data) {
  const hdr = token ? { Authorization: `Bearer ${token}` } : {};
  return rawRequest('/users/me', buildOpts('PUT', data, hdr));
}