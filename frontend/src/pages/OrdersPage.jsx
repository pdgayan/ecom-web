import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../AppContext';
import { ORDER_URL } from '../api';

export default function OrdersPage() {
  const { user }        = useApp();
  const navigate        = useNavigate();
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${ORDER_URL}/orders/${user.id}`)
      .then(r => r.json())
      .then(data => { setOrders(data.reverse()); setLoading(false); })
      .catch(() => { setOrders([]); setLoading(false); });
  }, [user.id]);

  if (loading) return <div className="spinner">Loading orders…</div>;

  return (
    <>
      <h1 className="page-title">Order History</h1>
      {orders.length === 0 ? (
        <div className="empty-state">
          <h2>No orders yet</h2>
          <p style={{ marginBottom: '1rem' }}>Place your first order to see it here.</p>
          <button className="btn btn-primary" onClick={() => navigate('/products')}>Shop Now</button>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map(order => (
            <div key={order.orderId} className="order-card">
              <div className="order-card-header">
                <span className="order-card-id">{order.orderId}</span>
                <span className="order-status">{order.status}</span>
              </div>
              <div className="order-card-meta">
                <span>{new Date(order.createdAt).toLocaleString()}</span>
                &nbsp;·&nbsp;
                <span>{order.items?.length} item(s)</span>
                &nbsp;·&nbsp;
                <strong style={{ color: 'var(--accent2)' }}>${order.amount?.toFixed(2)}</strong>
              </div>
              <div style={{ marginTop: '0.7rem' }}>
                {order.items?.map(item => (
                  <div key={item.productId} style={{ fontSize: '0.82rem', color: 'var(--muted)', padding: '0.2rem 0' }}>
                    {item.name} × {item.quantity} — ${(item.price * item.quantity).toFixed(2)}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
