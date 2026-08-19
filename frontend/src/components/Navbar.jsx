import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../AppContext";

export default function Navbar() {
  const { user, logout } = useApp();
  const navigate = useNavigate();
  const isSellerRole = user?.role === "seller" || user?.role === "admin";
  const isBuyerRole = user?.role === "buyer" || user?.role === "customer";

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <nav className="navbar">
      <Link
        to={isSellerRole ? "/dashboard" : "/products"}
        className="navbar-brand"
      >
        Ecom
      </Link>

      <div className="navbar-links">
        {!user && (
          <Link to="/login" className="nav-link">
            Login
          </Link>
        )}
        {isBuyerRole && (
          <Link to="/products" className="nav-link">
            Products
          </Link>
        )}
        {isSellerRole && (
          <Link to="/dashboard" className="nav-link">
            Dashboard
          </Link>
        )}
        {user && (
          <span className="nav-user">
            {user.role}: {user.username}
          </span>
        )}
        {user && (
          <button className="btn-logout" onClick={handleLogout}>
            Logout
          </button>
        )}
      </div>
    </nav>
  );
}
