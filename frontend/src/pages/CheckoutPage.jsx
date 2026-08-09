import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useApp } from "../AppContext";
import { ORDER_URL, CART_URL } from "../api";

export default function CheckoutPage() {
  const { user } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const items = location.state?.items || [];
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");

  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);

  async function placeOrder() {
    setPlacing(true);
    setError("");
    try {
      const res = await fetch(`${ORDER_URL}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          items: items.map((i) => ({
            productId: i.productId,
            name: i.name,
          setPlacing(false);
            quantity: i.quantity,
            price: i.price,
          })),
        }),
      });
          <div className="empty-state card">
            <div className="eyebrow">Checkout</div>
            <h2>Nothing to checkout</h2>
            <p style={{ marginBottom: "1rem" }}>Your basket appears to be empty.</p>
            <button className="btn btn-primary" onClick={() => navigate("/cart")}>
              Go to Basket
            </button>
    } catch (err) {
      setError(err.message);
      setPlacing(false);
    }
  }
        <div className="checkout-page">
          <section className="catalog-hero card">
            <div className="hero-copy">
              <div className="eyebrow">Checkout</div>
              <h1 className="page-title">Review and place your order</h1>
              <p>Everything is ready. Confirm your basket and finish the order.</p>
            </div>
            <div className="hero-metrics">
              <div className="metric-card">
                <span className="metric-value">{items.length}</span>
                <span className="metric-label">Items</span>
              </div>
              <div className="metric-card accent">
                <span className="metric-value">${total.toFixed(2)}</span>
                <span className="metric-label">Order total</span>
              </div>
            </div>
          </section>

          <div className="checkout-layout">
            <div className="card checkout-review-card">
              <div className="section-head">
                <h2>Review your dishes</h2>
              </div>

              <div className="checkout-review-list">
                {items.map((item) => (
                  <div key={item.productId} className="checkout-review-item">
                    <div>
                      <div className="product-card-badge">{item.category || "Dish"}</div>
                      <div className="checkout-review-name">
                        {item.name} × {item.quantity}
                      </div>
                    </div>
                    <div className="price">
                      ${(Number(item.price || 0) * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="checkout-summary-box">
              <div className="eyebrow">Summary</div>
              <h3>Order summary</h3>
              {items.map((item) => (
                <div key={item.productId} className="summary-item">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.name}
                      onError={(e) => {
                        e.currentTarget.style.opacity = 0.65;
                      }}
                    />
                  ) : (
                    <div className="summary-fallback" />
                  )}
                  <div style={{ flex: "1 1 auto" }}>
                    <div style={{ fontWeight: 700 }}>{item.name}</div>
                    <div style={{ fontSize: "0.85rem", color: "var(--muted)" }}>
                      Qty: {item.quantity}
                    </div>
                  </div>
                  <div style={{ fontWeight: 700 }}>
                    ${(Number(item.price || 0) * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
              <div className="summary-total">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>

              <div className="summary-note">
                Payment will be processed automatically via the payment service.
              </div>

              {error && <div className="alert alert-error">{error}</div>}

              <button
                className="btn btn-success btn-wide"
                onClick={placeOrder}
                disabled={placing}
              >
                {placing ? "Placing order…" : "Place Order"}
              </button>
            </div>
          </div>
        </div>

          {error && <div className="alert alert-error">{error}</div>}

          <button
            className="btn btn-success"
            style={{ width: "100%" }}
            onClick={placeOrder}
            disabled={placing}
          >
            {placing ? "Placing Order…" : "✅ Place Order"}
          </button>
        </div>
      </div>
    </>
  );
}
