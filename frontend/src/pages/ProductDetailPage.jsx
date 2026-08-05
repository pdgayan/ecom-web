import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useApp } from "../AppContext";
import { CATALOG_URL, CART_URL } from "../api";

export default function ProductDetailPage() {
  const { id } = useParams();
  const { user } = useApp();
  const navigate = useNavigate();
  const [product, setProd] = useState(null);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  function getFallbackImage(productId) {
    return `https://picsum.photos/seed/${encodeURIComponent(productId)}/1200/800`;
  }

  useEffect(() => {
    fetch(`${CATALOG_URL}/products/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setProd(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Product not found.");
        setLoading(false);
      });
  }, [id]);

  async function addToCart() {
    setAdding(true);
    setMsg("");
    try {
      const res = await fetch(`${CART_URL}/cart/${user.id}/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id, quantity: qty }),
      });
      if (!res.ok) throw new Error("Failed to add to cart");
      setMsg("✅ Added to cart!");
    } catch {
      setMsg("❌ Could not add to cart.");
      setAdding(false);
    }
  }

  async function buyNow() {
    setAdding(true);
    setError("");
    try {
      // Best-effort add to server cart (non-blocking for checkout flow)
      try {
        await fetch(`${CART_URL}/cart/${user.id}/add`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId: product.id, quantity: qty }),
        });
      } catch {}

      // Navigate to checkout with this single item
      navigate("/checkout", {
        state: {
          items: [
            {
              productId: product.id,
              name: product.name,
              price: product.price,
              quantity: qty,
            },
          ],
        },
      });
    } catch (err) {
      setError("Could not start checkout.");
    } finally {
      setAdding(false);
    }
  }

  if (loading) return <div className="spinner">Loading…</div>;
  if (error) return <div className="alert alert-error">{error}</div>;

  return (
    <>
      <Link to="/products" className="back-link">
        ← Back to Products
      </Link>
      <div className="product-detail">
        <img
          src={product.image_url || getFallbackImage(product.id)}
          alt={product.name}
          onError={(e) => {
            const fallback = getFallbackImage(product.id);
            if (e.currentTarget.src !== fallback)
              e.currentTarget.src = fallback;
          }}
        />
        <div className="product-detail-info">
          <div className="category-tag">{product.category}</div>
          <h1>{product.name}</h1>
          <div className="big-price">${product.price.toFixed(2)}</div>
          <p className="description">{product.description}</p>
          <p
            style={{
              fontSize: "0.82rem",
              color: "var(--muted)",
              marginBottom: "1rem",
            }}
          >
            {product.stock} in stock
          </p>

          <div className="qty-row">
            <label>Qty:</label>
            <input
              className="qty-input"
              type="number"
              value={qty}
              min={1}
              max={product.stock}
              onChange={(e) => setQty(parseInt(e.target.value) || 1)}
            />
          </div>

          {msg && (
            <div
              className={`alert ${msg.startsWith("✅") ? "alert-success" : "alert-error"}`}
            >
              {msg}
            </div>
          )}

          {error && <div className="alert alert-error">{error}</div>}

          <div style={{ display: "flex", gap: "0.8rem" }}>
            <button
              className="btn btn-primary"
              onClick={addToCart}
              disabled={adding}
            >
              {adding ? "Adding…" : "Add to Cart"}
            </button>
            <button
              className="btn btn-success"
              onClick={buyNow}
              disabled={adding}
            >
              {adding ? "Processing…" : "Buy Now"}
            </button>
            <button
              className="btn btn-outline"
              onClick={() => navigate("/cart")}
            >
              View Cart
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
