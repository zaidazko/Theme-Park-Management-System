import { useState, useEffect } from "react";
import "./ThemePark.css";

const CommodityPurchase = () => {
  const [commodities, setCommodities] = useState([]);
  const [selectedItem, setSelectedItem] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("credit");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCommodities();
  }, []);

  const fetchCommodities = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/commodity/types`
      );
      const data = await response.json();
      setCommodities(data);
    } catch (err) {
      setError("Failed to load items");
      console.log(err);
    }
  };

  const handlePurchase = async (e) => {
    e.preventDefault();

    const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

    if (!currentUser.customerId) {
      setError("Please login first");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const item = commodities.find(
        (c) => c.commodityTypeId === parseInt(selectedItem)
      );

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/commodity/purchase`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customerId: currentUser.customerId,
            commodityTypeId: parseInt(selectedItem),
            totalPrice: item.basePrice,
            paymentMethod: paymentMethod,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMessage(`✅ ${data.message}! Sale ID: ${data.saleId}`);
        setSelectedItem("");
      } else {
        setError(data.message || "Purchase failed");
      }
    } catch (err) {
      setError("Failed to process purchase");
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const selectedItemData = commodities.find(
    (c) => c.commodityTypeId === parseInt(selectedItem)
  );

  return (
    <div className="theme-park-page">
      <div className="theme-park-container-wide">
        <div className="theme-park-header">
          <h1 className="theme-park-title">🛍️ Shop Merchandise</h1>
          <p className="theme-park-subtitle">
            Take home memories from ThrillWorld
          </p>
        </div>

        {message && (
          <div className="theme-park-alert theme-park-alert-success">
            <span style={{ fontSize: "24px" }}>🎉</span>
            <span>{message}</span>
          </div>
        )}

        {error && (
          <div className="theme-park-alert theme-park-alert-error">
            <span style={{ fontSize: "24px" }}>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <h3 className="theme-park-section-title">Available Products</h3>
        <div className="theme-park-grid">
          {commodities.map((item) => (
            <div key={item.commodityTypeId} className="theme-park-feature-card">
              <span className="theme-park-feature-icon">🎁</span>
              <h4 className="theme-park-feature-title">{item.commodityName}</h4>
              <p
                className="theme-park-feature-description"
                style={{ marginBottom: "15px" }}
              >
                {item.commodityStore && `Available at: ${item.commodityStore}`}
              </p>
              <div
                style={{
                  fontSize: "28px",
                  fontWeight: "800",
                  background: "var(--success-gradient)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  marginBottom: "15px",
                }}
              >
                ${item.basePrice}
              </div>
              <button
                onClick={() => setSelectedItem(item.commodityTypeId.toString())}
                className="theme-park-btn theme-park-btn-success w-full theme-park-btn-sm"
              >
                🛒 Add to Cart
              </button>
            </div>
          ))}
        </div>

        {selectedItem && selectedItemData && (
          <div className="theme-park-card" style={{ marginTop: "30px" }}>
            <div className="theme-park-card-header">
              <h3 className="theme-park-card-title">
                <span>💳</span> Complete Purchase
              </h3>
              <button
                onClick={() => setSelectedItem("")}
                className="theme-park-btn theme-park-btn-outline theme-park-btn-sm"
              >
                ✖️ Cancel
              </button>
            </div>

            <div
              style={{
                marginBottom: "30px",
                padding: "25px",
                background:
                  "linear-gradient(135deg, rgba(56, 239, 125, 0.1) 0%, rgba(17, 153, 142, 0.1) 100%)",
                borderRadius: "12px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: "14px",
                      color: "var(--text-medium)",
                      marginBottom: "5px",
                    }}
                  >
                    Selected Item
                  </div>
                  <div
                    style={{
                      fontSize: "24px",
                      fontWeight: "700",
                      color: "var(--text-dark)",
                    }}
                  >
                    🎁 {selectedItemData.commodityName}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div
                    style={{
                      fontSize: "14px",
                      color: "var(--text-medium)",
                      marginBottom: "5px",
                    }}
                  >
                    Total Price
                  </div>
                  <div
                    style={{
                      fontSize: "36px",
                      fontWeight: "800",
                      background: "var(--success-gradient)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    ${selectedItemData.basePrice}
                  </div>
                </div>
              </div>
            </div>

            <form onSubmit={handlePurchase} className="theme-park-form">
              <div className="theme-park-form-group">
                <label className="theme-park-label">💰 Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="theme-park-select"
                >
                  <option value="credit">💳 Credit Card</option>
                  <option value="debit">💳 Debit Card</option>
                  <option value="cash">💵 Cash</option>
                  <option value="mobile">📱 Mobile Payment</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="theme-park-btn theme-park-btn-success theme-park-btn-lg w-full"
              >
                {loading
                  ? "⏳ Processing..."
                  : `🛍️ Purchase for $${selectedItemData.basePrice}`}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommodityPurchase;
