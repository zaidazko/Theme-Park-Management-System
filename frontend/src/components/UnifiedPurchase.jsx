import { useEffect, useMemo, useState } from "react";
import "./ThemePark.css";

const paymentOptions = [
  { value: "credit", label: "Credit Card" },
  { value: "debit", label: "Debit Card" },
  { value: "cash", label: "Cash" },
  { value: "mobile", label: "Mobile" },
];

const categoryMeta = {
  ticket: { icon: "🎟️", title: "Tickets" },
  menu: { icon: "🍔", title: "Menu Items" },
  commodity: { icon: "🛍️", title: "Merchandise" },
};

const UnifiedPurchase = () => {
  const [ticketTypes, setTicketTypes] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [commodities, setCommodities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [cart, setCart] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("credit");
  const [cardInfo, setCardInfo] = useState({
    cardNumber: "",
    name: "",
    expiry: "",
    cvv: "",
  });
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");

      try {
        const [ticketRes, menuRes, commodityRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL}/ticket/types`),
          fetch(`${import.meta.env.VITE_API_URL}/menu/types`),
          fetch(`${import.meta.env.VITE_API_URL}/commodity/types`),
        ]);

        if (!ticketRes.ok) throw new Error("Failed to load tickets");
        if (!menuRes.ok) throw new Error("Failed to load menu");
        if (!commodityRes.ok) throw new Error("Failed to load merchandise");

        const [ticketData, menuData, commodityData] = await Promise.all([
          ticketRes.json(),
          menuRes.json(),
          commodityRes.json(),
        ]);

        setTicketTypes(ticketData ?? []);
        setMenuItems(menuData ?? []);
        setCommodities(commodityData ?? []);
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to load catalog");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const currentUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch (err) {
      console.error("Unable to parse stored user", err);
      return {};
    }
  }, []);

  const total = useMemo(
    () =>
      cart
        .reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
        .toFixed(2),
    [cart]
  );

  const handleAddToCart = (category, item) => {
    const typeId = item.ticketTypeId || item.menuTypeId || item.commodityTypeId;
    const name = item.typeName || item.foodName || item.commodityName;
    const unitPrice = item.price ?? item.basePrice ?? 0;

    if (!typeId) {
      console.warn("Item missing identifier", item);
      return;
    }

    const key = `${category}-${typeId}`;

    setCart((prev) => {
      const existing = prev.find((entry) => entry.key === key);
      if (existing) {
        return prev.map((entry) =>
          entry.key === key
            ? { ...entry, quantity: entry.quantity + 1 }
            : entry
        );
      }

      return [
        ...prev,
        {
          key,
          category,
          typeId,
          name,
          unitPrice,
          quantity: 1,
        },
      ];
    });
  };

  const adjustQuantity = (key, delta) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.key === key
            ? { ...item, quantity: Math.max(1, item.quantity + delta) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (key) => {
    setCart((prev) => prev.filter((item) => item.key !== key));
  };

  const clearCart = () => {
    setCart([]);
  };

  const validateCardDetails = () => {
    if (!paymentMethod || (paymentMethod !== "credit" && paymentMethod !== "debit")) {
      return { valid: true };
    }

    const digits = (cardInfo.cardNumber || "").replace(/\D/g, "");
    if (!/^\d{13,19}$/.test(digits)) {
      return { valid: false, message: "Enter a valid card number (13-19 digits)." };
    }

    if (!/^\d{3,4}$/.test((cardInfo.cvv || "").trim())) {
      return { valid: false, message: "Enter a valid CVV." };
    }

    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test((cardInfo.expiry || "").trim())) {
      return { valid: false, message: "Enter expiry as MM/YY." };
    }

    return { valid: true, last4: digits.slice(-4) };
  };

  const handleCheckout = async () => {
    setMessage("");
    setError("");

    if (!currentUser?.customerId) {
      setError("Please log in as a customer before checking out.");
      return;
    }

    if (cart.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    const cardValidation = validateCardDetails();
    if (!cardValidation.valid) {
      setError(cardValidation.message);
      return;
    }

    setProcessing(true);

    try {
      const payload = {
        customerId: currentUser.customerId,
        paymentMethod,
        cardLast4: cardValidation.last4,
        items: cart.map((item) => ({
          category: item.category,
          typeId: item.typeId,
          quantity: item.quantity,
        })),
      };

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/purchase/checkout`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || "Checkout failed");
      }

      const data = await response.json();
      const chargedAmount =
        typeof data.totalCharged === "number"
          ? data.totalCharged.toFixed(2)
          : total;

      setMessage(
        `Purchase complete! Charged $${chargedAmount} via ${
          data.paymentMethod || paymentMethod
        }${data.cardLast4 ? ` ••••${data.cardLast4}` : ""}.`
      );
      clearCart();
      setCardInfo({ cardNumber: "", name: "", expiry: "", cvv: "" });
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to complete checkout.");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="theme-park-page">
        <div className="theme-park-loading">
          <div className="theme-park-spinner"></div>
          <div className="theme-park-loading-text">Loading store...</div>
        </div>
      </div>
    );
  }

  const sections = [
    { category: "ticket", items: ticketTypes, emptyText: "No tickets available." },
    { category: "menu", items: menuItems, emptyText: "No menu items available." },
    { category: "commodity", items: commodities, emptyText: "No merchandise available." },
  ];

  return (
    <div className="theme-park-page">
      <div className="theme-park-container-wide" style={{ display: "grid", gap: "24px" }}>
        <div className="theme-park-header">
          <h1 className="theme-park-title">🎠 Park Marketplace</h1>
          <p className="theme-park-subtitle">
            Build your perfect visit with tickets, food, and merchandise in one checkout.
          </p>
        </div>

        {error && (
          <div className="theme-park-alert theme-park-alert-error">
            <span style={{ fontSize: "24px" }}>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {message && (
          <div className="theme-park-alert theme-park-alert-success">
            <span style={{ fontSize: "24px" }}>🎉</span>
            <span>{message}</span>
          </div>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 2fr) minmax(320px, 1fr)",
            gap: "24px",
            alignItems: "start",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {sections.map(({ category, items, emptyText }) => (
              <div className="theme-park-card" key={category}>
                <div className="theme-park-card-header">
                  <h3 className="theme-park-card-title">
                    <span>{categoryMeta[category].icon}</span> {categoryMeta[category].title}
                  </h3>
                  <div className="theme-park-badge theme-park-badge-info">
                    {items.length} {items.length === 1 ? "item" : "items"}
                  </div>
                </div>

                <div className="theme-park-table-container">
                  <table className="theme-park-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Price</th>
                        <th>Description</th>
                        <th style={{ width: "120px" }}>Add</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.length === 0 ? (
                        <tr>
                          <td colSpan={4} style={{ textAlign: "center", padding: "18px" }}>
                            {emptyText}
                          </td>
                        </tr>
                      ) : (
                        items.map((item) => {
                          const name = item.typeName || item.foodName || item.commodityName;
                          const price = item.price ?? item.basePrice ?? 0;
                          const description = item.description || "—";

                          return (
                            <tr key={item.ticketTypeId || item.menuTypeId || item.commodityTypeId}>
                              <td>{name}</td>
                              <td style={{ fontWeight: 600, color: "var(--success-color)" }}>
                                ${Number(price).toFixed(2)}
                              </td>
                              <td>{description}</td>
                              <td>
                                <button
                                  className="theme-park-btn theme-park-btn-primary theme-park-btn-sm"
                                  onClick={() => handleAddToCart(category, item)}
                                >
                                  Add
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>

          <div style={{ position: "sticky", top: "24px" }}>
            <div className="theme-park-card">
              <div className="theme-park-card-header">
                <h3 className="theme-park-card-title">🛒 Your Cart</h3>
                <div className="theme-park-badge theme-park-badge-primary">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)} items
                </div>
              </div>
              <div style={{ padding: "20px" }}>
                {cart.length === 0 ? (
                  <div style={{ textAlign: "center", color: "#6b7280" }}>
                    Cart is empty.
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    {cart.map((item) => (
                      <div
                        key={item.key}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: "12px",
                          borderBottom: "1px solid #e5e7eb",
                          paddingBottom: "12px",
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 600 }}>{item.name}</div>
                          <div style={{ color: "#6b7280", fontSize: "0.85rem" }}>
                            {categoryMeta[item.category]?.title || item.category}
                          </div>
                          <div style={{ color: "#111827", marginTop: "4px" }}>
                            ${item.unitPrice.toFixed(2)} each
                          </div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ display: "flex", justifyContent: "flex-end", gap: "6px", marginBottom: "6px" }}>
                            <button
                              className="theme-park-btn theme-park-btn-outline theme-park-btn-sm"
                              style={{ padding: "4px 10px" }}
                              onClick={() => adjustQuantity(item.key, -1)}
                            >
                              −
                            </button>
                            <div style={{ minWidth: "28px", textAlign: "center", fontWeight: 600 }}>
                              {item.quantity}
                            </div>
                            <button
                              className="theme-park-btn theme-park-btn-outline theme-park-btn-sm"
                              style={{ padding: "4px 10px" }}
                              onClick={() => adjustQuantity(item.key, 1)}
                            >
                              +
                            </button>
                          </div>
                          <div style={{ fontWeight: 700 }}>
                            ${(item.unitPrice * item.quantity).toFixed(2)}
                          </div>
                          <button
                            className="theme-park-btn theme-park-btn-outline theme-park-btn-sm"
                            style={{ padding: "6px 12px", marginTop: "6px" }}
                            onClick={() => removeFromCart(item.key)}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}

                    <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: "1.05rem" }}>
                      <span>Total</span>
                      <span>${total}</span>
                    </div>

                    <button
                      className="theme-park-btn theme-park-btn-outline"
                      onClick={clearCart}
                    >
                      Clear Cart
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="theme-park-card" style={{ marginTop: "24px" }}>
              <div className="theme-park-card-header">
                <h3 className="theme-park-card-title">💳 Payment</h3>
              </div>
              <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <label className="theme-park-label">Payment Method</label>
                  <select
                    className="theme-park-select"
                    value={paymentMethod}
                    onChange={(event) => setPaymentMethod(event.target.value)}
                  >
                    {paymentOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {(paymentMethod === "credit" || paymentMethod === "debit") && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div>
                      <label className="theme-park-label">Card Number</label>
                      <input
                        className="theme-park-input"
                        value={cardInfo.cardNumber}
                        onChange={(event) =>
                          setCardInfo((prev) => ({
                            ...prev,
                            cardNumber: event.target.value.replace(/[^\d\s]/g, ""),
                          }))
                        }
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                      />
                    </div>
                    <div style={{ display: "flex", gap: "12px" }}>
                      <div style={{ flex: 1 }}>
                        <label className="theme-park-label">Expiry (MM/YY)</label>
                        <input
                          className="theme-park-input"
                          value={cardInfo.expiry}
                          onChange={(event) =>
                            setCardInfo((prev) => ({
                              ...prev,
                              expiry: event.target.value,
                            }))
                          }
                          placeholder="08/27"
                          maxLength={5}
                        />
                      </div>
                      <div style={{ width: "120px" }}>
                        <label className="theme-park-label">CVV</label>
                        <input
                          className="theme-park-input"
                          value={cardInfo.cvv}
                          onChange={(event) =>
                            setCardInfo((prev) => ({
                              ...prev,
                              cvv: event.target.value.replace(/\D/g, ""),
                            }))
                          }
                          placeholder="123"
                          maxLength={4}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="theme-park-label">Name on Card</label>
                      <input
                        className="theme-park-input"
                        value={cardInfo.name}
                        onChange={(event) =>
                          setCardInfo((prev) => ({
                            ...prev,
                            name: event.target.value,
                          }))
                        }
                        placeholder="Alex Rider"
                      />
                    </div>
                  </div>
                )}

                <button
                  className="theme-park-btn theme-park-btn-success theme-park-btn-lg"
                  onClick={handleCheckout}
                  disabled={processing || cart.length === 0}
                >
                  {processing ? "Processing..." : `Pay $${total}`}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnifiedPurchase;
