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
  const [guestEmail, setGuestEmail] = useState("");
  const [isGuest, setIsGuest] = useState(false);
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

  // Get product image for cart items
  const getItemImage = (item) => {
    const name = (item.name || item.commodityName || "").toLowerCase();

    if (item.type === "commodity") {
      if (name.includes("tee") || name.includes("shirt") || name.includes("hoodie") || name.includes("jacket")) {
        return "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200&h=200&fit=crop";
      } else if (name.includes("cap") || name.includes("hat")) {
        return "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=200&h=200&fit=crop";
      } else if (name.includes("plush") || name.includes("toy")) {
        return "https://images.unsplash.com/photo-1530325553241-4f6e7690cf36?w=200&h=200&fit=crop";
      } else if (name.includes("mug") || name.includes("cup") || name.includes("tumbler")) {
        return "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=200&h=200&fit=crop";
      } else if (name.includes("bag") || name.includes("backpack")) {
        return "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=200&h=200&fit=crop";
      } else {
        return "https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=200&h=200&fit=crop";
      }
    } else if (item.type === "ticket") {
      return "https://images.unsplash.com/photo-1524661135-423995f22d0b?w=200&h=200&fit=crop";
    } else if (item.type === "restaurant") {
      return "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=200&h=200&fit=crop";
    }

    return "https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=200&h=200&fit=crop";
  };

  const handleConfirm = async () => {
    // Minimal validation
    if (!visitDate) {
      setMessage("Please select a visit date");
      return;
    }

    // Check if user is guest or logged in
    const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
    const isLoggedIn = !!currentUser.customerId;

    // If guest checkout, require email
    if (!isLoggedIn && !guestEmail) {
      setMessage("Please enter your email address");
      return;
    }

    // Simplified card validation (no strict rules for demo)
    if (paymentMethod === "credit" || paymentMethod === "debit") {
      if (!cardInfo.cardNumber || cardInfo.cardNumber.length < 12) {
        setMessage("Please enter card number");
        return;
      }
      if (!cardInfo.expiry) {
        setMessage("Please enter expiry date (MM/YY)");
        return;
      }
      if (!cardInfo.cvv || cardInfo.cvv.length < 3) {
        setMessage("Please enter CVV");
        return;
      }
      if (!cardInfo.name) {
        setMessage("Please enter name on card");
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

      const customerId = currentUser.customerId || 1; // Use guest ID if not logged in

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
        const commodityResults = await Promise.all(commodities.map(async c => {
          const response = await fetch(`${import.meta.env.VITE_API_URL}/commodity/purchase`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              customerId,
              commodityTypeId: c.commodityTypeId || c.id,
              quantity: c.quantity || 1,
              totalPrice: (c.basePrice || c.price) * (c.quantity || 1),
              paymentMethod,
              purchaseDate: visitDate
            })
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Commodity purchase failed');
          }

          return response;
        }));
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
      // Display the actual error message from the database trigger
      const errorMessage = err.message || "Failed to complete purchase";
      setMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="theme-park-page">
      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "40px 20px" }}>
        <div className="theme-park-header">
          <h1 className="theme-park-title">🛒 My Bag ({cart.length})</h1>
          <p className="theme-park-subtitle">Review items before checkout</p>
        </div>

        {message && <div className="theme-park-alert theme-park-alert-success">{message}</div>}

        {cart.length === 0 ? (
          <div className="theme-park-card" style={{ padding: 40, textAlign: "center" }}>
            <h3>Your cart is empty</h3>
            <p style={{ color: "#6b7280", marginTop: 10 }}>Add some items to get started!</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 400px", gap: "30px", alignItems: "flex-start" }}>

            {/* LEFT SIDE - Cart Items */}
            <div>
              {cart.map(item => (
                <div key={item.key} className="theme-park-card" style={{ padding: 20, marginBottom: 15, display: "flex", gap: 20 }}>
                  {/* Product Image */}
                  <div style={{
                    width: 120,
                    height: 120,
                    backgroundColor: "#f0f0f0",
                    borderRadius: 8,
                    flexShrink: 0,
                    overflow: "hidden"
                  }}>
                    <img
                      src={getItemImage(item)}
                      alt={item.name || item.commodityName}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover"
                      }}
                    />
                  </div>

                  {/* Product Details */}
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: 0, marginBottom: 8, fontSize: 18 }}>
                      {item.name || item.ticketType || item.commodityName}
                    </h4>
                    <div style={{ color: '#6b7280', fontSize: 14, marginBottom: 8 }}>
                      Quantity: {item.quantity || 1}
                    </div>
                    <div style={{ color: '#6b7280', fontSize: 14, marginBottom: 12, textTransform: "capitalize" }}>
                      {item.type}
                    </div>
                    <div style={{ display: "flex", gap: 10 }}>
                      <button
                        className="theme-park-btn theme-park-btn-outline"
                        onClick={() => handleRemove(item.key)}
                        style={{ fontSize: 14, padding: "6px 12px" }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  {/* Price */}
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 20, fontWeight: 700 }}>
                      ${((item.price || item.basePrice || item.totalPrice) * (item.quantity || 1)).toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* RIGHT SIDE - Order Summary */}
            <div style={{ position: "sticky", top: 20 }}>
              <div className="theme-park-card" style={{ padding: 25 }}>
                <h3 style={{ margin: 0, marginBottom: 20, fontSize: 20 }}>Order Summary</h3>

                <div style={{ borderBottom: "1px solid #e5e7eb", paddingBottom: 15, marginBottom: 15 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                    <span style={{ color: "#6b7280" }}>Subtotal</span>
                    <span style={{ fontWeight: 600 }}>${getTotal()}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                    <span style={{ color: "#6b7280" }}>Est. Shipping and Handling</span>
                    <span style={{ fontWeight: 600 }}>$9.95</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#6b7280" }}>Est. Sales Tax</span>
                    <span style={{ fontWeight: 600 }}>*TBD</span>
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20, paddingBottom: 20, borderBottom: "2px solid #e5e7eb" }}>
                  <span style={{ fontSize: 18, fontWeight: 700 }}>Total</span>
                  <span style={{ fontSize: 20, fontWeight: 700 }}>${(parseFloat(getTotal()) + 9.95).toFixed(2)}</span>
                </div>

                <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 15, textAlign: "center" }}>
                  * Tax estimated at checkout
                </div>

                {/* Free Shipping Progress */}
                <div style={{ marginBottom: 25 }}>
                  <div style={{ fontSize: 14, marginBottom: 8, textAlign: "center" }}>
                    <strong>Almost there!</strong>
                  </div>
                  <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 10, textAlign: "center" }}>
                    ${Math.max(0, 85 - parseFloat(getTotal())).toFixed(2)} away from free shipping!
                  </div>
                  <div style={{ width: "100%", height: 8, backgroundColor: "#e5e7eb", borderRadius: 10, overflow: "hidden" }}>
                    <div style={{
                      width: `${Math.min(100, (parseFloat(getTotal()) / 85) * 100)}%`,
                      height: "100%",
                      backgroundColor: "#38ef7d",
                      transition: "width 0.3s ease"
                    }}></div>
                  </div>
                </div>

                {!showCheckout ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <button
                      className="theme-park-btn theme-park-btn-primary"
                      onClick={() => setShowCheckout(true)}
                      style={{ width: "100%", padding: "14px", fontSize: 16, fontWeight: 700 }}
                    >
                      Log In & Checkout
                    </button>
                    <button
                      className="theme-park-btn theme-park-btn-outline"
                      onClick={() => setShowCheckout(true)}
                      style={{ width: "100%", padding: "14px", fontSize: 16, fontWeight: 600 }}
                    >
                      Guest Checkout
                    </button>
                  </div>
                ) : (
                  <button
                    className="theme-park-btn theme-park-btn-outline"
                    onClick={() => setShowCheckout(false)}
                    style={{ width: "100%", padding: "12px", fontSize: 14 }}
                  >
                    ← Back to Summary
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Checkout Form - Appears below cart */}
        {showCheckout && cart.length > 0 && (
          <div className="theme-park-card" style={{ marginTop: 30, maxWidth: "800px", marginLeft: "auto", marginRight: "auto" }}>
            <div className="theme-park-card-header">
              <h3 className="theme-park-card-title">Checkout Information</h3>
            </div>
            <div style={{ padding: 30 }}>
              {/* Guest Email (if not logged in) */}
              {!JSON.parse(localStorage.getItem("user") || "{}").customerId && (
                <div style={{ marginBottom: 12 }}>
                  <label className="theme-park-label">Email Address (for order confirmation)</label>
                  <input
                    type="email"
                    value={guestEmail}
                    onChange={e => setGuestEmail(e.target.value)}
                    className="theme-park-input"
                    placeholder="your@email.com"
                    required
                  />
                </div>
              )}

              <div style={{ marginBottom: 12 }}>
                <label className="theme-park-label">Visit Date</label>
                <input type="date" value={visitDate} onChange={e => setVisitDate(e.target.value)} className="theme-park-input" required />
              </div>

              <div style={{ marginBottom: 12 }}>
                <label className="theme-park-label">Payment Method</label>
                <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} className="theme-park-select">
                  <option value="credit">Credit Card</option>
                  <option value="debit">Debit Card</option>
                  <option value="mobile">Mobile Payment (Apple Pay, Google Pay)</option>
                </select>
              </div>

              {(paymentMethod === 'credit' || paymentMethod === 'debit') && (
                <div style={{ marginBottom: 12 }}>
                  <label className="theme-park-label">Card Information</label>
                  <input
                    placeholder="Card Number"
                    value={cardInfo.cardNumber}
                    onChange={e => setCardInfo({ ...cardInfo, cardNumber: e.target.value })}
                    className="theme-park-input"
                    type="text"
                  />
                  <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                    <input
                      placeholder="MM/YY"
                      value={cardInfo.expiry}
                      onChange={e => setCardInfo({ ...cardInfo, expiry: e.target.value })}
                      className="theme-park-input"
                      style={{ flex: 1 }}
                      type="text"
                    />
                    <input
                      placeholder="CVV"
                      value={cardInfo.cvv}
                      onChange={e => setCardInfo({ ...cardInfo, cvv: e.target.value })}
                      className="theme-park-input"
                      style={{ width: 120 }}
                      type="text"
                    />
                  </div>
                  <input
                    placeholder="Name on Card"
                    value={cardInfo.name}
                    onChange={e => setCardInfo({ ...cardInfo, name: e.target.value })}
                    className="theme-park-input"
                    style={{ marginTop: 8 }}
                    type="text"
                  />
                </div>
              )}

              <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
                <button
                  className="theme-park-btn theme-park-btn-primary"
                  onClick={handleConfirm}
                  disabled={loading}
                  style={{ flex: 1, padding: "14px", fontSize: 16, fontWeight: 700 }}
                >
                  {loading ? '⏳ Processing...' : '✓ Confirm Purchase'}
                </button>
                <button
                  className="theme-park-btn theme-park-btn-outline"
                  onClick={() => setShowCheckout(false)}
                  style={{ padding: "14px 20px", fontSize: 16 }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
