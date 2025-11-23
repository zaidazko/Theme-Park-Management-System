import { useEffect, useMemo, useState } from "react";
import "./ThemePark.css";

const ITEMS_PER_PAGE = 10;

const MyPurchases = () => {
  const [tickets, setTickets] = useState([]);
  const [merchandise, setMerchandise] = useState([]);
  const [foodPurchases, setFoodPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [ticketPage, setTicketPage] = useState(1);
  const [merchPage, setMerchPage] = useState(1);
  const [foodPage, setFoodPage] = useState(1);

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const customerId = currentUser?.customerId;

  useEffect(() => {
    let isCancelled = false;
    const controller = new AbortController();

    const loadPurchases = async () => {
      if (!customerId) {
        setError("Please login to view your purchases");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");
      let partialFailure = false;
      const baseUrl = import.meta.env.VITE_API_URL;

      const safeFetch = async (url, label) => {
        try {
          const response = await fetch(url, { signal: controller.signal });
          if (!response.ok) {
            throw new Error(`${label} request failed with status ${response.status}`);
          }
          return await response.json();
        } catch (err) {
          console.error(`Failed to fetch ${label}`, err);
          partialFailure = true;
          return [];
        }
      };

      try {
        const [ticketData, merchandiseData, foodData] = await Promise.all([
          safeFetch(`${baseUrl}/ticket/customer/${customerId}`, "tickets"),
          safeFetch(`${baseUrl}/commodity/customer/${customerId}`, "merchandise"),
          safeFetch(
            `${baseUrl}/menu/sales/customer/${customerId}`,
            "food purchases"
          ),
        ]);

        if (isCancelled) {
          return;
        }

  setTickets(ticketData || []);
  setMerchandise(merchandiseData || []);
  setFoodPurchases(foodData || []);
  setTicketPage(1);
  setMerchPage(1);
  setFoodPage(1);

        if (partialFailure) {
          setError("Some purchases could not be loaded. Please refresh to try again.");
        }
      } catch (err) {
        if (isCancelled) {
          return;
        }
        console.error("Failed to load purchase history", err);
        setTickets([]);
        setMerchandise([]);
        setFoodPurchases([]);
        setError("We couldn't load your purchases. Please try again.");
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    loadPurchases();

    return () => {
      isCancelled = true;
      controller.abort();
    };
  }, [customerId]);

  const totals = useMemo(() => {
    const ticketTotal = tickets.reduce(
      (sum, sale) => sum + Number(sale?.price ?? 0),
      0
    );
    const merchandiseTotal = merchandise.reduce(
      (sum, sale) => sum + Number(sale?.price ?? 0),
      0
    );
    const foodTotal = foodPurchases.reduce(
      (sum, purchase) => sum + Number(purchase?.price ?? 0),
      0
    );

    return {
      ticketCount: tickets.length,
      merchandiseCount: merchandise.length,
      foodCount: foodPurchases.length,
      ticketTotal,
      merchandiseTotal,
      foodTotal,
      grandTotal: ticketTotal + merchandiseTotal + foodTotal,
    };
  }, [tickets, merchandise, foodPurchases]);

  const formatCurrency = (value) => `$${Number(value ?? 0).toFixed(2)}`;
  const formatDate = (value) =>
    value ? new Date(value).toLocaleDateString() : "Unknown";

  const ticketPageCount = Math.max(1, Math.ceil(tickets.length / ITEMS_PER_PAGE));
  const merchPageCount = Math.max(1, Math.ceil(merchandise.length / ITEMS_PER_PAGE));
  const foodPageCount = Math.max(1, Math.ceil(foodPurchases.length / ITEMS_PER_PAGE));

  const paginatedTickets = useMemo(() => {
    const start = (ticketPage - 1) * ITEMS_PER_PAGE;
    return tickets.slice(start, start + ITEMS_PER_PAGE);
  }, [ticketPage, tickets]);

  const paginatedMerchandise = useMemo(() => {
    const start = (merchPage - 1) * ITEMS_PER_PAGE;
    return merchandise.slice(start, start + ITEMS_PER_PAGE);
  }, [merchPage, merchandise]);

  const paginatedFood = useMemo(() => {
    const start = (foodPage - 1) * ITEMS_PER_PAGE;
    return foodPurchases.slice(start, start + ITEMS_PER_PAGE);
  }, [foodPage, foodPurchases]);

  useEffect(() => {
    setTicketPage((prev) => Math.min(prev, ticketPageCount));
  }, [ticketPageCount]);

  useEffect(() => {
    setMerchPage((prev) => Math.min(prev, merchPageCount));
  }, [merchPageCount]);

  useEffect(() => {
    setFoodPage((prev) => Math.min(prev, foodPageCount));
  }, [foodPageCount]);

  const renderPagination = (currentPage, totalPages, onPageChange) => (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: "12px",
        gap: "12px",
      }}
    >
      <button
        type="button"
        className="theme-park-btn theme-park-btn-outline theme-park-btn-sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
      >
        Previous
      </button>
      <span style={{ flexGrow: 1, textAlign: "center" }}>
        Page {Math.min(currentPage, totalPages)} of {totalPages}
      </span>
      <button
        type="button"
        className="theme-park-btn theme-park-btn-outline theme-park-btn-sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
      >
        Next
      </button>
    </div>
  );

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
          <h1 className="theme-park-title">🧾 My Purchases</h1>
          <p className="theme-park-subtitle">
            Track every ticket, merchandise item, and food order in one place.
          </p>
        </div>

        {error && (
          <div className="theme-park-alert theme-park-alert-warning">
            <span style={{ fontSize: "24px" }}>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <div className="theme-park-grid">
          <div className="theme-park-card theme-park-card-gradient">
            <div className="theme-park-card-title">💳 Total Spent</div>
            <div className="theme-park-stat-value" style={{ fontSize: "32px" }}>
              {formatCurrency(totals.grandTotal)}
            </div>
          </div>
          <div className="theme-park-card">
            <div className="theme-park-card-title">🎟️ Tickets</div>
            <div style={{ fontSize: "28px", fontWeight: 700 }}>
              {totals.ticketCount}
            </div>
            <div style={{ color: "var(--text-medium)" }}>
              {formatCurrency(totals.ticketTotal)} total
            </div>
          </div>
          <div className="theme-park-card">
            <div className="theme-park-card-title">🛍️ Merchandise</div>
            <div style={{ fontSize: "28px", fontWeight: 700 }}>
              {totals.merchandiseCount}
            </div>
            <div style={{ color: "var(--text-medium)" }}>
              {formatCurrency(totals.merchandiseTotal)} total
            </div>
          </div>
          <div className="theme-park-card">
            <div className="theme-park-card-title">🍽️ Food Purchases</div>
            <div style={{ fontSize: "28px", fontWeight: 700 }}>
              {totals.foodCount}
            </div>
            <div style={{ color: "var(--text-medium)" }}>
              {formatCurrency(totals.foodTotal)} total
            </div>
          </div>
        </div>

        <div className="theme-park-card">
          <div className="theme-park-card-header">
            <h2 className="theme-park-card-title">
              <span>🎟️</span> Tickets
            </h2>
            <div className="theme-park-badge theme-park-badge-primary">
              {totals.ticketCount} {totals.ticketCount === 1 ? "Ticket" : "Tickets"}
            </div>
          </div>
          {tickets.length === 0 ? (
            <div className="theme-park-empty">
              <div className="theme-park-empty-icon">🎢</div>
              <div className="theme-park-empty-title">No Tickets Found</div>
              <div className="theme-park-empty-text">
                You haven't purchased any tickets yet.
              </div>
            </div>
          ) : (
            <>
              <div className="theme-park-table-container">
                <table className="theme-park-table">
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Quantity</th>
                      <th>Price</th>
                      <th>Payment</th>
                      <th>Purchase Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedTickets.map((ticket) => (
                      <tr key={ticket.ticketId}>
                        <td>🎢 {ticket.ticketType}</td>
                        <td>x{ticket.quantity ?? 1}</td>
                        <td style={{ fontWeight: 700, color: "var(--success-color)" }}>
                          {formatCurrency(ticket.price)}
                        </td>
                        <td>💳 {ticket.paymentMethod}</td>
                        <td>{formatDate(ticket.purchaseDate)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {tickets.length > ITEMS_PER_PAGE &&
                renderPagination(ticketPage, ticketPageCount, (page) => setTicketPage(page))}
            </>
          )}
        </div>

        <div className="theme-park-card">
          <div className="theme-park-card-header">
            <h2 className="theme-park-card-title">
              <span>🛍️</span> Merchandise
            </h2>
            <div className="theme-park-badge theme-park-badge-success">
              {totals.merchandiseCount} {totals.merchandiseCount === 1 ? "Item" : "Items"}
            </div>
          </div>
          {merchandise.length === 0 ? (
            <div className="theme-park-empty">
              <div className="theme-park-empty-icon">🧸</div>
              <div className="theme-park-empty-title">No Merchandise Purchases</div>
              <div className="theme-park-empty-text">
                You haven't purchased any merchandise yet.
              </div>
            </div>
          ) : (
            <>
              <div className="theme-park-table-container">
                <table className="theme-park-table">
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Quantity</th>
                      <th>Price</th>
                      <th>Payment</th>
                      <th>Purchase Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedMerchandise.map((sale) => (
                      <tr key={sale.saleId}>
                        <td>🎁 {sale.commodityName}</td>
                        <td>x{sale.quantity ?? 1}</td>
                        <td style={{ fontWeight: 700, color: "var(--success-color)" }}>
                          {formatCurrency(sale.price)}
                        </td>
                        <td>💳 {sale.paymentMethod}</td>
                        <td>{formatDate(sale.purchaseDate)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {merchandise.length > ITEMS_PER_PAGE &&
                renderPagination(merchPage, merchPageCount, (page) => setMerchPage(page))}
            </>
          )}
        </div>

        <div className="theme-park-card">
          <div className="theme-park-card-header">
            <h2 className="theme-park-card-title">
              <span>🍽️</span> Food Purchases
            </h2>
            <div className="theme-park-badge theme-park-badge-warning">
              {totals.foodCount} {totals.foodCount === 1 ? "Item" : "Items"}
            </div>
          </div>
          {foodPurchases.length === 0 ? (
            <div className="theme-park-empty">
              <div className="theme-park-empty-icon">🍔</div>
              <div className="theme-park-empty-title">No Food Purchases</div>
              <div className="theme-park-empty-text">
                You haven't ordered from our restaurants yet.
              </div>
            </div>
          ) : (
            <>
              <div className="theme-park-table-container">
                <table className="theme-park-table">
                  <thead>
                    <tr>
                      <th>Menu Item</th>
                      <th>Quantity</th>
                      <th>Total</th>
                      <th>Payment</th>
                      <th>Purchase Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedFood.map((purchase) => (
                      <tr key={purchase.saleId}>
                        <td>{purchase.menuItem}</td>
                        <td>x{purchase.quantity}</td>
                        <td style={{ fontWeight: 700, color: "var(--success-color)" }}>
                          {formatCurrency(purchase.price)}
                        </td>
                        <td>💳 {purchase.paymentMethod}</td>
                        <td>{formatDate(purchase.purchaseDate)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {foodPurchases.length > ITEMS_PER_PAGE &&
                renderPagination(foodPage, foodPageCount, (page) => setFoodPage(page))}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyPurchases;
