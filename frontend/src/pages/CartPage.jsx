import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../AppContext";
import { CART_URL, CATALOG_URL } from "../api";

export default function CartPage() {
  const { user } = useApp();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState(null);

  const loadCart = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${CART_URL}/cart/${user.id}`);
      const data = await res.json();
      const rawItems = data.items || [];

      const enriched = await Promise.all(
        rawItems.map(async (item) => {
          try {
            const pr = await fetch(`${CATALOG_URL}/products/${item.productId}`);
            const pd = await pr.json();
            return {
              ...item,
              name: pd.name,
              price: pd.price,
              image_url: pd.image_url,
              category: pd.category,
            };
          } catch {
            return { ...item, name: item.productId, price: 0 };
          }
        }),
      );
      setItems(enriched);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [user.id]);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  async function removeItem(productId) {
    setRemoving(productId);
    await fetch(`${CART_URL}/cart/${user.id}/remove/${productId}`, {
      method: "DELETE",
    });
    setRemoving(null);
    loadCart();
  }

  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);

  if (loading) return <div className="spinner">Loading your basket…</div>;

  if (items.length === 0) {
    return (
      <div className="empty-state card">
        <div className="eyebrow">Basket</div>
        <h2>Your basket is empty</h2>
        <p style={{ marginBottom: "1.2rem" }}>
          Add a few dishes before checkout.
        </p>
        <button
          className="btn btn-primary"
          onClick={() => navigate("/products")}
        >
          Browse Menu
        </button>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <section className="catalog-hero card">
        <div className="hero-copy">
          <div className="eyebrow">Basket</div>
          <h1 className="page-title">Your selected dishes</h1>
          <p>Review quantities and head to checkout when you’re ready.</p>
        </div>
        <div className="hero-metrics">
          <div className="metric-card">
            <span className="metric-value">{items.length}</span>
            <span className="metric-label">Items</span>
          </div>
          <div className="metric-card accent">
            <span className="metric-value">${total.toFixed(2)}</span>
            <span className="metric-label">Basket total</span>
          </div>
        </div>
      </section>

      <div className="cart-layout">
        <div className="card cart-items-card">
          <div className="section-head">
            <h2>Basket items</h2>
          </div>

          <div className="cart-items-list">
            {items.map((item) => (
              <article key={item.productId} className="cart-item">
                <img
                  src={
                    item.image_url ||
                    `https://picsum.photos/seed/${encodeURIComponent(item.productId)}/240/180`
                  }
                  alt={item.name}
                />
                <div className="cart-item-body">
                  <div className="cart-item-top">
                    <div>
                      <div className="product-card-badge">
                        {item.category || "Dish"}
                      </div>
                      <h3>{item.name}</h3>
                    </div>
                    <div className="price">
                      ${Number(item.price || 0).toFixed(2)}
                    </div>
                  </div>

                  <div className="cart-item-meta">
                    <span>Qty: {item.quantity}</span>
                    <span>
                      Subtotal: ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>

                  <div className="cart-item-actions">
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => removeItem(item.productId)}
                      disabled={removing === item.productId}
                    >
                      {removing === item.productId ? "Removing…" : "Remove"}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        <aside className="checkout-summary-box card">
          <div className="eyebrow">Checkout</div>
          <h3>Order summary</h3>
          <div className="summary-total">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
          <p className="summary-note">
            Freshly prepared meals, saved for your next step.
          </p>
          <button
            className="btn btn-success btn-wide"
            onClick={() => navigate("/checkout", { state: { items } })}
          >
            Proceed to Checkout
          </button>
        </aside>
      </div>
    </div>
  );
}
