import { useState, useEffect } from "react";
import "./ThemePark.css";

const CommoditySales = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const isEmployee =
    currentUser.userType === "Employee" || currentUser.userType === "Manager";

  useEffect(() => {
    if (isEmployee) {
      fetchAllSales();
    } else {
      fetchMySales();
    }
  }, []);

  const fetchAllSales = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/commodity/sales`
      );
      if (!response.ok) throw new Error("Failed to fetch sales");
      const data = await response.json();
      setSales(data);
    } catch (err) {
      setError("Failed to load commodity sales");
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMySales = async () => {
    if (!currentUser.customerId) {
      setError("Please login to view your purchases");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/commodity/customer/${
          currentUser.customerId
        }`
      );
      if (!response.ok) throw new Error("Failed to fetch purchases");
      const data = await response.json();
      setSales(data);
    } catch (err) {
      setError("Failed to load your purchases");
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    return sales.reduce((total, sale) => total + sale.price, 0).toFixed(2);
  };

  if (loading) {
    return (
      <div className="theme-park-page">
        <div className="theme-park-loading">
          <div className="theme-park-spinner"></div>
          <div className="theme-park-loading-text">Loading purchases...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="theme-park-page">
      <div className="theme-park-container">
        <div className="theme-park-header">
          <h1 className="theme-park-title">
            {isEmployee ? "📊 Merchandise Sales" : "🛍️ My Purchases"}
          </h1>
          <p className="theme-park-subtitle">
            {isEmployee
              ? "Track all merchandise revenue"
              : "View your shopping history"}
          </p>
        </div>

        {error && (
          <div className="theme-park-alert theme-park-alert-error">
            <span style={{ fontSize: "24px" }}>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {sales.length === 0 ? (
          <div className="theme-park-empty">
            <div className="theme-park-empty-icon">🛍️</div>
            <div className="theme-park-empty-title">No Purchases Found</div>
            <div className="theme-park-empty-text">
              {isEmployee
                ? "No merchandise sales recorded yet"
                : "You haven't purchased any items yet"}
            </div>
          </div>
        ) : (
          <>
            <div className="theme-park-stat-card">
              <div className="theme-park-stat-icon">💰</div>
              <div className="theme-park-stat-label">
                {isEmployee ? "Total Revenue" : "Total Spent"}
              </div>
              <div className="theme-park-stat-value">${calculateTotal()}</div>
            </div>

            <div className="theme-park-card">
              <div className="theme-park-card-header">
                <h3 className="theme-park-card-title">
                  <span>📋</span> Purchase History
                </h3>
                <div className="theme-park-badge theme-park-badge-success">
                  {sales.length} {sales.length === 1 ? "Item" : "Items"}
                </div>
              </div>

              <div className="theme-park-table-container">
                <table className="theme-park-table">
                  <thead>
                    <tr>
                      <th>Sale ID</th>
                      {isEmployee && <th>Customer</th>}
                      <th>Item</th>
                      <th>Price</th>
                      <th>Payment</th>
                      <th>Purchase Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sales.map((sale) => (
                      <tr key={sale.saleId}>
                        <td>#{sale.saleId}</td>
                        {isEmployee && <td>{sale.customerName}</td>}
                        <td>🎁 {sale.commodityName}</td>
                        <td
                          style={{
                            fontWeight: "700",
                            color: "var(--success-color)",
                          }}
                        >
                          ${sale.price}
                        </td>
                        <td>💳 {sale.paymentMethod}</td>
                        <td>
                          {new Date(sale.purchaseDate).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CommoditySales;
