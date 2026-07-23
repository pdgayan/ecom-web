import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CATALOG_URL } from '../api';

export default function ProductListPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  useEffect(() => {
    fetch(`${CATALOG_URL}/products`)
      .then(r => r.json())
      .then(data => { setProducts(data); setLoading(false); })
      .catch(() => { setError('Could not load products. Is catalog-service running?'); setLoading(false); });
  }, []);

  if (loading) return <div className="spinner">Loading products…</div>;
  if (error)   return <div className="alert alert-error">{error}</div>;

  return (
    <>
      <h1 className="page-title">Products</h1>
      <div className="products-grid">
        {products.map(product => (
          <Link key={product.id} to={`/products/${product.id}`} className="product-card">
            <img src={product.image_url} alt={product.name} />
            <div className="product-card-body">
              <div className="product-card-category">{product.category}</div>
              <div className="product-card-name">{product.name}</div>
              <div className="product-card-footer">
                <span className="price">${product.price.toFixed(2)}</span>
                <span className="stock-badge">{product.stock} left</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
