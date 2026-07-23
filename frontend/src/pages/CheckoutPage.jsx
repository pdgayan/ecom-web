import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../AppContext';
import { ORDER_URL, CART_URL } from '../api';

export default function CheckoutPage() {
  const { user }        = useApp();
  const location        = useLocation();
  const navigate        = useNavigate();
  const items           = location.state?.items || [];
  const [placing, setPlacing] = useState(false);
  const [error, setError]     = useState('');

  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);

  async function placeOrder() {
    setPlacing(true);
    setError('');
    try {
      const res = await fetch(`${ORDER_URL}/orders`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          userId: user.id,
          items:  items.map(i => ({
            productId: i.productId,
            name:      i.name,
            quantity:  i.quantity,
            price:     i.price,
          })),
        }),
      });
      const order = await res.json();
      if (!res.ok) throw new Error(order.error || 'Failed to place order');

      // Clear the cart after successful order
      await fetch(`${CART_URL}/cart/${user.id}/clear`, { method: 'DELETE' });

      navigate('/order-confirm', { state: { order } });
    } catch (err) {
      setError(err.message);
      setPlacing(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="empty-state">
        <h2>Nothing to checkout</h2>
        <p style={{ marginBottom: '1rem' }}>Your cart appears to be empty.</p>
        <button className="btn btn-primary" onClick={() => navigate('/cart')}>Go to Cart</button>
      </div>
    );
  }

  return (
    <>
      <h1 className="page-title">Checkout</h1>
      <div className="checkout-layout">
        {/* Left: item review */}
        <div className="card" style={{ padding: '1.2rem' }}>
          <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}>Review Your Items</h3>
          {items.map(item => (
            <div key={item.productId} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.55rem 0', borderBottom: '1px solid var(--border)', fontSize: '0.88rem' }}>
              <span>{item.name} × {item.quantity}</span>
              <span>${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.8rem', fontWeight: 700 }}>
            Total: ${total.toFixed(2)}
          </div>
        </div>

        {/* Right: summary + CTA */}
        <div className="checkout-summary-box">
          <h3>Order Summary</h3>
          {items.map(item => (
            <div key={item.productId} className="summary-item">
              <span>{item.name}</span>
              <span>${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div className="summary-total">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>

          <div style={{ marginTop: '1.2rem', fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '1rem' }}>
            💳 Payment will be processed automatically via the payment service.
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <button
            className="btn btn-success"
            style={{ width: '100%' }}
            onClick={placeOrder}
            disabled={placing}
          >
            {placing ? 'Placing Order…' : '✅ Place Order'}
          </button>
        </div>
      </div>
    </>
  );
}
