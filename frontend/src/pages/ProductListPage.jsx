import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CATALOG_URL } from "../api";

function getFallbackImage(productId) {
  return `https://picsum.photos/seed/${encodeURIComponent(productId)}/1200/800`;
}

export default function ProductListPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${CATALOG_URL}/products`)
      .then((r) => r.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Could not load products. Is catalog-service running?");
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="spinner">Loading products…</div>;
  if (error) return <div className="alert alert-error">{error}</div>;

  return (
    <>
      <div className="page-header">
        <div>
          <div className="eyebrow">Buyer view</div>
          <h1 className="page-title">Products</h1>
        </div>
      </div>
      <div className="products-grid">
        {products.map((product) => (
          <Link
            key={product.id}
            to={`/products/${product.id}`}
            className="product-card-link"
          >
            <article className="product-card">
              <img
                src={product.image_url || getFallbackImage(product.id)}
                alt={product.name}
                onError={(event) => {
                  const fallback = getFallbackImage(product.id);
                  if (event.currentTarget.src !== fallback) {
                    event.currentTarget.src = fallback;
                  }
                }}
              />
              <div className="product-card-body">
                <div className="product-card-category">{product.category}</div>
                <div className="product-card-name">{product.name}</div>
                <div className="product-card-footer">
                  <span className="price">
                    ${Number(product.price || 0).toFixed(2)}
                  </span>
                  <span className="stock-badge">
                    {product.stock ?? 0} in stock
                  </span>
                </div>
              </div>
            </article>
          </Link>
        ))}
      </div>
    </>
  );
}
