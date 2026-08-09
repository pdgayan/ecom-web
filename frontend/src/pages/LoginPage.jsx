import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../AppContext";
import { AUTH_URL } from "../api";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useApp();
  const navigate = useNavigate();

  function redirectByRole(role) {
    if (role === "seller" || role === "admin") {
      navigate("/dashboard");
    } else {
      navigate("/products");
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Email and password are required.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${AUTH_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Unable to log in. Please try again.");
        return;
      }

      login(data.user, data.token);
      redirectByRole(data.user.role);
    } catch (err) {
      console.error("Login error:", err);
      setError("Unable to reach the server. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="auth-screen">
      <div className="auth-panel">
        <div className="eyebrow">Ecommerce portal</div>
        <h1>Sign in</h1>
        <p>Enter your credentials to access your account.</p>

        {error && <div className="form-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoFocus
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>
          <button
            className="btn btn-primary btn-wide"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Login"}
          </button>
        </form>

        <p className="login-hint">
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}
