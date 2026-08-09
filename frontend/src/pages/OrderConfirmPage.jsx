import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function OrderConfirmPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const order = location.state?.order;

  if (!order) {
    return (
      <div className="empty-state card">
        <h2>No order found</h2>
        <button
          className="btn btn-primary"
          style={{ marginTop: "1rem" }}
          onClick={() => navigate("/products")}
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="order-confirm-page">
      <div className="order-confirm card">
        <div className="success-icon">🎉</div>
        <h1>Order Placed!</h1>
        <p>Thank you! Your order has been successfully placed.</p>
        <p style={{ fontSize: "0.82rem", marginTop: "0.3rem" }}>
          Payment is being processed and a notification has been sent.
        </p>

        <div className="order-id-badge">{order.orderId}</div>

        <div
          style={{
            color: "var(--muted)",
            fontSize: "0.85rem",
            marginBottom: "1rem",
          }}
        >
          <span>Status: </span>
          <strong
            style={{ color: "var(--accent-2)", textTransform: "uppercase" }}
          >
            {order.status}
          </strong>
          &nbsp;·&nbsp;
          <span>
            Total: <strong>${order.amount?.toFixed(2)}</strong>
          </span>
        </div>

        <div className="order-items-list card" style={{ padding: "1rem" }}>
          <h3>Items Ordered</h3>
          {order.items?.map((item) => (
            <div key={item.productId} className="checkout-review-item">
              <span>
                {item.name} × {item.quantity}
              </span>
              <span>${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>

        <div className="order-confirm-actions">
          <button
            className="btn btn-primary"
            onClick={() => navigate("/products")}
          >
            Continue Shopping
          </button>
          <button
            className="btn btn-outline"
            onClick={() => navigate("/orders")}
          >
            View All Orders
          </button>
        </div>
      </div>
    </div>
  );
}
