import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../AppContext";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("buyer");
  const { login } = useApp();
  const navigate = useNavigate();

  function handleSubmit(e) {
    e.preventDefault();
    const user = { id: username || role, username, role };
    login(user, password || "demo-token");
    navigate(role === "seller" ? "/dashboard" : "/products");
  }

  return (
    <div className="auth-screen">
      <div className="auth-panel">
        <div className="eyebrow">Ecommerce demo</div>
        <h1>Choose your role</h1>
        <p>
          Use any username and password. Seller goes to product management,
          buyer goes to browsing.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="role-switch">
            <button
              type="button"
              className={role === "buyer" ? "role-chip active" : "role-chip"}
              onClick={() => setRole("buyer")}
            >
              Buyer
            </button>
            <button
              type="button"
              className={role === "seller" ? "role-chip active" : "role-chip"}
              onClick={() => setRole("seller")}
            >
              Seller
            </button>
          </div>

          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="alice or bob"
              required
              autoFocus
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="any password works"
              required
            />
          </div>
          <button className="btn btn-primary btn-wide" type="submit">
            Enter {role === "seller" ? "Seller Dashboard" : "Product Catalog"}
          </button>
        </form>

        <p className="login-hint">Any username/password is accepted for now.</p>
      </div>
    </div>
  );
}
