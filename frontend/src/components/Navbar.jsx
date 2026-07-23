import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../AppContext';

export default function Navbar() {
  const { user, logout } = useApp();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <nav className="navbar">
      <Link to="/products" className="navbar-brand">🛒 ShopMS</Link>

      {user && (
        <div className="navbar-links">
          <Link to="/products" className="nav-link">Products</Link>
          <Link to="/cart"     className="nav-link">Cart</Link>
          <Link to="/orders"   className="nav-link">Orders</Link>
          <span className="nav-user">👤 {user.username}</span>
          <button className="btn-logout" onClick={handleLogout}>Logout</button>
        </div>
      )}
    </nav>
  );
}
