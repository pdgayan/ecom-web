import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../AppContext';
import { CART_URL, CATALOG_URL } from '../api';

export default function CartPage() {
  const { user }        = useApp();
  const navigate        = useNavigate();
  const [items, setItems]     = useState([]);   // enriched with product details
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState(null);

  const loadCart = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${CART_URL}/cart/${user.id}`);
      const data = await res.json();
      const rawItems = data.items || [];

      // Enrich with product details from catalog
      const enriched = await Promise.all(rawItems.map(async item => {
        try {
          const pr = await fetch(`${CATALOG_URL}/products/${item.productId}`);
          const pd = await pr.json();
          return { ...item, name: pd.name, price: pd.price, image_url: pd.image_url };
        } catch {
          return { ...item, name: item.productId, price: 0 };
        }
      }));
      setItems(enriched);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [user.id]);

  useEffect(() => { loadCart(); }, [loadCart]);

  async function removeItem(productId) {
    setRemoving(productId);
    await fetch(`${CART_URL}/cart/${user.id}/remove/${productId}`, { method: 'DELETE' });
    setRemoving(null);
    loadCart();
  }

  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);

  if (loading) return <div className="spinner">Loading cart…</div>;

  if (items.length === 0) {
    return (
      <div className="empty-state">
        <h2>Your cart is empty</h2>
        <p style={{ marginBottom: '1.2rem' }}>Add some products first!</p>
        <button className="btn btn-primary" onClick={() => navigate('/products')}>Browse Products</button>
      </div>
    );
  }

  return (
    <>
      <h1 className="page-title">Your Cart</h1>
      <div className="card" style={{ padding: '0.5rem' }}>
        <table className="cart-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Price</th>
              <th>Qty</th>
              <th>Subtotal</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.productId}>
                <td style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
                  {item.image_url && (
                    <img src={item.image_url} alt={item.name} style={{ width: 48, height: 36, objectFit: 'cover', borderRadius: 6 }} />
                  )}
                  <span>{item.name}</span>
                </td>
                <td>${item.price.toFixed(2)}</td>
                <td>{item.quantity}</td>
                <td><strong>${(item.price * item.quantity).toFixed(2)}</strong></td>
                <td>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => removeItem(item.productId)}
                    disabled={removing === item.productId}
                  >
                    {removing === item.productId ? '…' : 'Remove'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="cart-footer">
          <span className="cart-total">Total: <strong>${total.toFixed(2)}</strong></span>
          <button className="btn btn-success" onClick={() => navigate('/checkout', { state: { items } })}>
            Proceed to Checkout →
          </button>
        </div>
      </div>
    </>
  );
}
