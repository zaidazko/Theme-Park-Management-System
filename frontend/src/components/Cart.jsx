import React, { useEffect, useState } from "react";

// --- Cart utility moved into this module (merged from ../cart) ---
const CART_KEY = "themepark_cart_v1";

const readCart = () => {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Failed to read cart", e);
    return [];
  }
};

const writeCart = (cart) => {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    window.dispatchEvent(new CustomEvent("cartUpdated", { detail: cart }));
  } catch (e) {
    console.error("Failed to write cart", e);
  }
};

export const getCart = () => readCart();

let uid = 1;
function makeKey() {
  uid += 1;
  return `cart_${Date.now()}_${uid}`;
}

export const addItem = (item) => {
  const cart = readCart();
  const withKey = { ...item, key: item.key || makeKey() };
  cart.push(withKey);
  writeCart(cart);
  return withKey;
};

export const removeFromCart = (key) => {
  const cart = readCart().filter((i) => i.key !== key);
  writeCart(cart);
  return cart;
};

export const clearCart = () => {
  writeCart([]);
};

// --- Cart component ---
const Cart = () => {
  const [cart, setCart] = useState(getCart());
  const [showCheckout, setShowCheckout] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("credit");
  const [visitDate, setVisitDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [cardInfo, setCardInfo] = useState({ cardNumber: "", name: "", expiry: "", cvv: "" });
  const [message, setMessage] = useState("");

  useEffect(() => {
    const handler = (e) => setCart(e.detail || getCart());
    window.addEventListener("cartUpdated", handler);
    return () => window.removeEventListener("cartUpdated", handler);
  }, []);

  const handleRemove = (key) => {
    removeFromCart(key);
    setCart(getCart());
  };

  const getTotal = () => {
    return cart.reduce((s, i) => s + (i.price || i.basePrice || i.totalPrice || 0) * (i.quantity || 1), 0).toFixed(2);
  };

  const handleConfirm = async () => {
    // Minimal validation
    if (!visitDate) {
      setMessage("Please select a visit date");
      return;
    }

    if (paymentMethod === "credit" || paymentMethod === "debit") {
      const num = (cardInfo.cardNumber || "").replace(/\s+/g, "");
      const cvv = (cardInfo.cvv || "").replace(/\s+/g, "");
      const expiry = (cardInfo.expiry || "").trim();
      // basic validations
      if (!/^\d{13,19}$/.test(num)) {
        setMessage("Please enter a valid card number (13-19 digits)");
        return;
      }
      if (!/^\d{3,4}$/.test(cvv)) {
        setMessage("Please enter a valid CVV (3 or 4 digits)");
        return;
      }
      if (!/^(0[1-9]|1[0-2])\/(\d{2})$/.test(expiry)) {
        setMessage("Please enter expiry as MM/YY");
        return;
      }
      // optional: check expiry not in past
      const [mm, yy] = expiry.split('/');
      const expMonth = parseInt(mm, 10);
      const expYear = 2000 + parseInt(yy, 10);
      const now = new Date();
      const lastDay = new Date(expYear, expMonth, 0, 23, 59, 59);
      if (lastDay < now) {
        setMessage("Card expiry is in the past");
        return;
      }
    }

    setLoading(true);
    setMessage("");

    try {
      // Split cart by type and send minimal payloads to backend endpoints
      const tickets = cart.filter(i => i.type === "ticket");
      const commodities = cart.filter(i => i.type === "commodity");
      const restaurant = cart.filter(i => i.type === "restaurant");

      const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
      const customerId = currentUser.customerId;

      // Use visitDate as purchaseDate for each request
      if (tickets.length > 0) {
        await Promise.all(tickets.map(t => fetch(`${import.meta.env.VITE_API_URL}/ticket/purchase`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customerId,
            ticketTypeId: t.ticketTypeId || t.id,
            totalPrice: t.price,
            paymentMethod,
            purchaseDate: visitDate
          })
        })));
      }

      if (commodities.length > 0) {
        await Promise.all(commodities.map(c => fetch(`${import.meta.env.VITE_API_URL}/commodity/purchase`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customerId,
            commodityTypeId: c.commodityTypeId || c.id,
            totalPrice: c.basePrice || c.price,
            paymentMethod,
            purchaseDate: visitDate
          })
        })));
      }

      if (restaurant.length > 0) {
        // For restaurant orders, send a single order per cart item (simple)
        await Promise.all(restaurant.map(r => fetch(`${import.meta.env.VITE_API_URL}/restaurant/orders`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customerId,
            restaurantId: r.restaurantId || 1,
            items: r.items || [{ menuId: r.id, quantity: r.quantity || 1 }],
            totalPrice: r.totalPrice || r.price,
            paymentMethod,
            orderDate: visitDate
          })
        })));
      }

      setMessage("Purchase completed successfully!");
      clearCart();
      setCart([]);
      setShowCheckout(false);
    } catch (err) {
      console.error(err);
      setMessage("Failed to complete purchase");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="theme-park-page">
      <div className="theme-park-container-wide">
        <div className="theme-park-header">
          <h1 className="theme-park-title">🛒 Your Cart</h1>
          <p className="theme-park-subtitle">Review items before checkout</p>
        </div>

        {message && <div className="theme-park-alert theme-park-alert-success">{message}</div>}

        <div className="theme-park-card">
          <div className="theme-park-card-header">
            <h3 className="theme-park-card-title">Cart Items</h3>
          </div>
          <div style={{ padding: 20 }}>
            {cart.length === 0 ? (
              <div>Your cart is empty.</div>
            ) : (
              <div>
                {cart.map(item => (
                  <div key={item.key} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>{item.name || item.ticketType || item.commodityName}</div>
                      <div style={{ color: '#6b7280' }}>{item.type}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div>${((item.price || item.basePrice || item.totalPrice) * (item.quantity || 1)).toFixed(2)}</div>
                      <button className="theme-park-btn theme-park-btn-outline" onClick={() => handleRemove(item.key)}>Remove</button>
                    </div>
                  </div>
                ))}

                <div style={{ borderTop: '1px solid #e5e7eb', marginTop: 10, paddingTop: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                    <div style={{ fontWeight: 700 }}>Total</div>
                    <div style={{ fontWeight: 700 }}>${getTotal()}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="theme-park-btn theme-park-btn-primary" onClick={() => setShowCheckout(true)}>Checkout</button>
                    <button className="theme-park-btn theme-park-btn-outline" onClick={() => { clearCart(); setCart([]); }}>Clear Cart</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {showCheckout && (
          <div className="theme-park-card" style={{ marginTop: 20 }}>
            <div className="theme-park-card-header">
              <h3 className="theme-park-card-title">Checkout</h3>
            </div>
            <div style={{ padding: 20 }}>
              <div style={{ marginBottom: 12 }}>
                <label className="theme-park-label">Visit Date</label>
                <input type="date" value={visitDate} onChange={e => setVisitDate(e.target.value)} className="theme-park-input" />
              </div>

              <div style={{ marginBottom: 12 }}>
                <label className="theme-park-label">Payment Method</label>
                <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} className="theme-park-select">
                  <option value="credit">Credit Card</option>
                  <option value="debit">Debit Card</option>
                  <option value="cash">Cash</option>
                  <option value="mobile">Mobile</option>
                </select>
              </div>

              {(paymentMethod === 'credit' || paymentMethod === 'debit') && (
                <div style={{ marginBottom: 12 }}>
                  <label className="theme-park-label">Card Info (simulated — not stored)</label>
                  <input
                    placeholder="Card Number (digits only)"
                    value={cardInfo.cardNumber}
                    onChange={e => setCardInfo({ ...cardInfo, cardNumber: (e.target.value || '').replace(/\D/g, '') })}
                    className="theme-park-input"
                    maxLength={19}
                  />
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input
                      placeholder="MM/YY"
                      value={cardInfo.expiry}
                      onChange={e => setCardInfo({ ...cardInfo, expiry: e.target.value })}
                      className="theme-park-input"
                      style={{ flex: 1 }}
                      maxLength={5}
                    />
                    <input
                      placeholder="CVV"
                      value={cardInfo.cvv}
                      onChange={e => setCardInfo({ ...cardInfo, cvv: (e.target.value || '').replace(/\D/g, '') })}
                      className="theme-park-input"
                      style={{ width: 120 }}
                      maxLength={4}
                    />
                  </div>
                  <input
                    placeholder="Name on card"
                    value={cardInfo.name}
                    onChange={e => setCardInfo({ ...cardInfo, name: e.target.value })}
                    className="theme-park-input"
                    style={{ marginTop: 8 }}
                  />
                </div>
              )}

              <div style={{ display: 'flex', gap: 8 }}>
                <button className="theme-park-btn theme-park-btn-success" onClick={handleConfirm} disabled={loading}>{loading ? 'Processing...' : 'Confirm Purchase'}</button>
                <button className="theme-park-btn theme-park-btn-outline" onClick={() => setShowCheckout(false)}>Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
