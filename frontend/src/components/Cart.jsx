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

  // Generate image filename from product name
  const getProductImage = (commodityName) => {
    const filename = commodityName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    return `/merchandise/${filename}.jpg`;
  };

  // Fallback to category stock photos
  const getCategoryImage = (commodityName) => {
    const name = commodityName.toLowerCase();

    // APPAREL - Each item gets unique image
    if (name.includes("classic") && name.includes("logo tee")) {
      return "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=400&h=400&fit=crop";
    } else if (name.includes("steel dragon") && name.includes("hoodie")) {
      return "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=400&fit=crop";
    } else if (name.includes("glow") && name.includes("hoodie")) {
      return "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=400&h=400&fit=crop";
    } else if (name.includes("windbreaker")) {
      return "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=400&fit=crop";
    } else if (name.includes("anniversary") && name.includes("hoodie")) {
      return "https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=400&h=400&fit=crop";

    // ACCESSORIES
    } else if (name.includes("snapback")) {
      return "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400&h=400&fit=crop";
    } else if (name.includes("3d") && name.includes("keychain")) {
      return "https://images.unsplash.com/photo-1582655299221-2f9a0f8f7d4f?w=400&h=400&fit=crop";
    } else if (name.includes("pin set")) {
      return "https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=400&h=400&fit=crop";
    } else if (name.includes("mini backpack")) {
      return "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop";
    } else if (name.includes("light-up") && name.includes("keychain")) {
      return "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop";

    // TOYS
    } else if (name.includes("bear") && name.includes("plush")) {
      return "https://images.unsplash.com/photo-1530325553241-4f6e7690cf36?w=400&h=400&fit=crop";
    } else if (name.includes("dragon") && name.includes("plush")) {
      return "https://images.unsplash.com/photo-1563291074-2bf8677ac0e5?w=400&h=400&fit=crop";
    } else if (name.includes("die-cast")) {
      return "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop";
    } else if (name.includes("popcorn bucket")) {
      return "https://images.unsplash.com/photo-1585647347384-2593bc35786b?w=400&h=400&fit=crop";
    } else if (name.includes("track display")) {
      return "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400&h=400&fit=crop";

    // HOME
    } else if (name.includes("ceramic") && name.includes("mug")) {
      return "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=400&h=400&fit=crop";
    } else if (name.includes("insulated tumbler")) {
      return "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&h=400&fit=crop";
    } else if (name.includes("neon sign")) {
      return "https://images.unsplash.com/photo-1513519245088-0e12902e35ca?w=400&h=400&fit=crop";
    } else if (name.includes("blanket")) {
      return "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=400&h=400&fit=crop";
    } else if (name.includes("refillable cup")) {
      return "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&h=400&fit=crop";

    // TEST ITEMS
    } else if (name.includes("survived")) {
      return "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=400&h=400&fit=crop";
    } else if (name.includes("crystal")) {
      return "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop";

    // Generic fallbacks
    } else if (name.includes("tee") || name.includes("shirt")) {
      return "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop";
    } else if (name.includes("hoodie")) {
      return "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=400&fit=crop";
    } else if (name.includes("cap") || name.includes("hat")) {
      return "https://images.unsplash.com/photo-1575428652377-a2d80e2277fc?w=400&h=400&fit=crop";
    } else {
      return "https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=400&h=400&fit=crop";
    }
  };

  // Get product image for cart items
  const getItemImage = (item) => {
    // For commodity items, try to load custom image first
    if (item.type === "commodity") {
      return getProductImage(item.name || item.commodityName);
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
          <h1 className="theme-park-title">
            <span style={{ color: "#1e40af" }}>ThrillWorld</span> - My Bag ({cart.length})
          </h1>
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
                      onError={(e) => {
                        // If custom image fails, use category stock photo
                        e.target.onerror = null; // Prevent infinite loop
                        if (item.type === "commodity") {
                          e.target.src = getCategoryImage(item.name || item.commodityName);
                        }
                      }}
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
                    {item.size && (
                      <div style={{ color: '#6b7280', fontSize: 14, marginBottom: 8 }}>
                        Size: {item.size}
                      </div>
                    )}
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
