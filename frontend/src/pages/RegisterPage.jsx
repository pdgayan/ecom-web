import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AUTH_URL } from "../api";

const initialForm = {
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
};

export default function RegisterPage() {
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  function handleChange(field) {
    return (e) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };
  }

  function validate() {
    if (
      !form.first_name.trim() ||
      !form.last_name.trim() ||
      !form.email.trim() ||
      !form.password
    ) {
      return "First name, last name, email and password are required.";
    }

    if (form.password !== form.confirmPassword) {
      return "Passwords do not match.";
    }

    return "";
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    const validationError = validate();

    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${AUTH_URL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          first_name: form.first_name.trim(),
          last_name: form.last_name.trim(),
          email: form.email.trim(),
          password: form.password,
          phone: form.phone.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Unable to register. Please try again.");
        return;
      }

      setSuccessMessage("Registration successful. Redirecting to login...");
      setForm(initialForm);

      setTimeout(() => {
        navigate("/login");
      }, 1200);
    } catch (err) {
      console.error("Register error:", err);
      setError("Unable to reach the server. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="auth-screen">
      <div className="auth-panel">
        <div className="eyebrow">Ecommerce portal</div>
        <h1>Create an account</h1>
        <p>Fill in your details to get started.</p>

        {error && <div className="form-error">{error}</div>}
        {successMessage && (
          <div className="form-success">{successMessage}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>First Name</label>
              <input
                type="text"
                value={form.first_name}
                onChange={handleChange("first_name")}
                placeholder="Jane"
                autoFocus
                required
              />
            </div>
            <div className="form-group">
              <label>Last Name</label>
              <input
                type="text"
                value={form.last_name}
                onChange={handleChange("last_name")}
                placeholder="Doe"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={form.email}
              onChange={handleChange("email")}
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="form-group">
            <label>Phone</label>
            <input
              type="tel"
              value={form.phone}
              onChange={handleChange("phone")}
              placeholder="+1 555 123 4567"
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={form.password}
              onChange={handleChange("password")}
              placeholder="Create a password"
              required
            />
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              value={form.confirmPassword}
              onChange={handleChange("confirmPassword")}
              placeholder="Re-enter your password"
              required
            />
          </div>

          <button
            className="btn btn-primary btn-wide"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? "Creating account..." : "Register"}
          </button>
        </form>

        <p className="login-hint">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}