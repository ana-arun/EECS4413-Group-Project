import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

function Navbar() {
  const { user, logout, cartCount = 0, token } = useAuth();
  const isAuthenticated = !!token;

  return (
    <header className="navbar">
      <div className="navbar-left">
        <Link to="/" className="navbar-logo">
          <span className="logo-icon">🛒</span>
          <span className="logo-text">CampusTech Store</span>
        </Link>
      </div>

      <nav className="navbar-center">
        <NavLink to="/" end className="nav-link">
          Catalog
        </NavLink>
        <NavLink to="/cart" className="nav-link">
          Cart
          {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
        </NavLink>
        <NavLink to="/sell" className="nav-link">
          Sell
        </NavLink>
        {token && user?.isAdmin && (
          <NavLink to="/admin" className="nav-link">Admin</NavLink>
        )}
      </nav>

      <div className="navbar-right">
        {isAuthenticated ? (
          <>
            <Link to="/profile" className="profile-chip">
              {user?.avatar ? (
                <img src={user.avatar} alt="avatar" className="profile-avatar-img" />
              ) : (
                <span className="profile-avatar">{user?.name ? user.name.charAt(0).toUpperCase() : 'U'}</span>
              )}
              <span className="profile-name">{user?.name ?? 'User'}</span>
            </Link>
            <button type="button" className="btn-secondary" onClick={logout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn-ghost">
              Login
            </Link>
            <Link to="/register" className="btn-primary">
              Register
            </Link>
          </>
        )}
      </div>
    </header>
  );
}

export default Navbar;