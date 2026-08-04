import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../AppContext";

export default function Navbar() {
  const { user, logout } = useApp();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <nav className="navbar">
      <Link
        to={user?.role === "seller" ? "/dashboard" : "/products"}
        className="navbar-brand"
      >
        Ecom Catalog
      </Link>

      <div className="navbar-links">
        {!user && (
          <Link to="/login" className="nav-link">
            Login
          </Link>
        )}
        {user?.role === "buyer" && (
          <Link to="/products" className="nav-link">
            Products
          </Link>
        )}
        {user?.role === "seller" && (
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
