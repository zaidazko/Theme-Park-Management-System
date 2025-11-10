import { useEffect, useMemo, useState } from "react";
import "./ThemePark.css";

const TicketPurchase = () => {
  const [ticketTypes, setTicketTypes] = useState([]);
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("credit");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchTicketTypes();
  }, []);

  const fetchTicketTypes = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/ticket/types`
      );

      if (!response.ok) {
        throw new Error(
          `Ticket request failed with status ${response.status}`
        );
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error("Unexpected ticket payload");
      }

      setTicketTypes(data);
    } catch (err) {
      console.error("Failed to load ticket types", err);
      setTicketTypes([]);
      setError(
        err?.message || "Failed to load ticket types. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (e) => {
    e.preventDefault();

    const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

    if (!currentUser.customerId) {
      setError("Please login first");
      return;
    }

    if (!selectedTicket) {
      setError("Please select a ticket before checking out");
      return;
    }

    const totalPrice = Number(selectedTicket.price ?? 0);

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/ticket/purchase`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customerId: currentUser.customerId,
            ticketTypeId: selectedTicket.ticketTypeId,
            totalPrice,
            paymentMethod: paymentMethod,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMessage(
          `Ticket purchased successfully! Your ticket ID is #${data.ticketId}`
        );
        setSelectedTicketId(null);
        setTimeout(() => setMessage(""), 5000);
      } else {
        setError(data.message || "Purchase failed");
      }
    } catch (err) {
      setError("Failed to process purchase");
    } finally {
      setLoading(false);
    }
  };

  const getTicketIcon = (typeName) => {
    const safeName = typeof typeName === "string" ? typeName : "";
    const name = safeName.toLowerCase();
    if (name.includes("season") || name.includes("pass")) return "🎫";
    if (name.includes("vip") || name.includes("premium")) return "⭐";
    if (name.includes("child") || name.includes("kid")) return "👶";
    if (name.includes("senior")) return "👵";
    if (name.includes("group")) return "👥";
    return "🎢";
  };

  const getRideFallbackImage = (ticket) => {
    const rideName = (ticket?.rideName || "").toLowerCase();
    const typeName = (ticket?.typeName || "").toLowerCase();

    if (rideName.includes("dragon") || typeName.includes("vip")) {
      return "https://images.unsplash.com/photo-1516747773443-0cc06f7be450?w=800&h=500&fit=crop";
    }

    if (rideName.includes("coaster") || rideName.includes("thrill")) {
      return "https://images.unsplash.com/photo-1505843513577-22bb7d21e455?w=800&h=500&fit=crop";
    }

    if (rideName.includes("water") || typeName.includes("splash")) {
      return "https://images.unsplash.com/photo-1504274066651-8d31a536b11a?w=800&h=500&fit=crop";
    }

    if (rideName.includes("family") || typeName.includes("family")) {
      return "https://images.unsplash.com/photo-1597311315254-7d08ceb0c88b?w=800&h=500&fit=crop";
    }

    if (rideName.includes("kids") || typeName.includes("kid")) {
      return "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&h=500&fit=crop";
    }

    return "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800&h=500&fit=crop";
  };

  const ticketsWithVisuals = useMemo(() => {
    return ticketTypes.map((ticket) => {
      const fallbackImage = getRideFallbackImage(ticket);
      const rideImage = ticket?.rideImage?.trim();
      const coverImage = rideImage && rideImage.length > 0 ? rideImage : fallbackImage;

      return {
        ...ticket,
        coverImage,
        fallbackImage,
      };
    });
  }, [ticketTypes]);

  const selectedTicket = useMemo(() => {
    if (selectedTicketId == null) {
      return null;
    }

    return (
      ticketsWithVisuals.find(
        (ticket) => ticket.ticketTypeId === selectedTicketId
      ) || null
    );
  }, [ticketsWithVisuals, selectedTicketId]);

  return (
    <div className="theme-park-page">
  <div className="theme-park-container-wide">
        <div className="theme-park-header">
          <h1 className="theme-park-title">🎫 Purchase Tickets</h1>
          <p className="theme-park-subtitle">
            Choose your perfect day at ThrillWorld
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

        {loading && (
          <div className="theme-park-loading" style={{ marginTop: "30px" }}>
            <div className="theme-park-spinner"></div>
            <div className="theme-park-loading-text">Loading tickets...</div>
          </div>
        )}

        {!loading && !selectedTicket ? (
          <div>
            <h3 className="theme-park-section-title">Available Tickets</h3>
            <div className="theme-park-grid">
              {ticketsWithVisuals.length === 0 ? (
                <div className="theme-park-empty" style={{ gridColumn: "1 / -1" }}>
                  <div className="theme-park-empty-icon">🎫</div>
                  <div className="theme-park-empty-title">No Tickets Available</div>
                  <div className="theme-park-empty-text">
                    Please check back later for new ticket options.
                  </div>
                </div>
              ) : (
                ticketsWithVisuals.map((ticket) => (
                <div
                  key={ticket.ticketTypeId}
                  className="theme-park-feature-card"
                  style={{ cursor: "pointer" }}
                  onClick={() => setSelectedTicketId(ticket.ticketTypeId)}
                >
                  <div
                    style={{
                      marginBottom: "16px",
                      overflow: "hidden",
                      borderRadius: "12px",
                      height: "200px",
                      backgroundColor: "#f1f5f9",
                    }}
                  >
                    <img
                      src={ticket.coverImage}
                      alt={ticket.typeName}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: "block",
                      }}
                      onError={(event) => {
                        event.target.onerror = null;
                        event.target.src = ticket.fallbackImage;
                      }}
                    />
                  </div>
                  <h4 className="theme-park-feature-title">
                    {getTicketIcon(ticket.typeName)} {ticket.typeName || "Unnamed Ticket"}
                  </h4>
                  <p className="theme-park-feature-description">
                    {ticket.description || "No description available."}
                  </p>
                  {ticket.rideName && (
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "6px 10px",
                        borderRadius: "9999px",
                        backgroundColor: "#eef2ff",
                        color: "#4338ca",
                        fontWeight: 600,
                        fontSize: "0.8rem",
                        marginBottom: "8px",
                      }}
                    >
                      🎢 {ticket.rideName}
                    </div>
                  )}
                  <div
                    style={{
                      fontSize: "24px",
                      fontWeight: 700,
                      color: "var(--success-color)",
                    }}
                  >
                    ${Number(ticket.price ?? 0).toFixed(2)}
                  </div>
                  <button
                    className="theme-park-btn theme-park-btn-primary w-full"
                    style={{ marginTop: "18px" }}
                  >
                    Select Ticket
                  </button>
                </div>
                ))
              )}
            </div>
          </div>
        ) : null}

        {!loading && selectedTicket && (
          <div className="theme-park-card">
            <div className="theme-park-card-header">
              <h3 className="theme-park-card-title">
                <span>💳</span> Complete Your Purchase
              </h3>
              <button
                  onClick={() => setSelectedTicketId(null)}
                className="theme-park-btn theme-park-btn-outline theme-park-btn-sm"
              >
                ← Change Ticket
              </button>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1.6fr)",
                gap: "20px",
                marginBottom: "30px",
                alignItems: "stretch",
              }}
            >
              <div
                style={{
                  borderRadius: "12px",
                  overflow: "hidden",
                  backgroundColor: "#f1f5f9",
                }}
              >
                <img
                  src={selectedTicket.coverImage}
                  alt={selectedTicket.typeName}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                  }}
                  onError={(event) => {
                    event.target.onerror = null;
                    event.target.src = selectedTicket.fallbackImage;
                  }}
                />
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                  justifyContent: "center",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: "14px",
                      color: "var(--text-medium)",
                      marginBottom: "6px",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                    }}
                  >
                    Selected Ticket
                  </div>
                  <div
                    style={{
                      fontSize: "28px",
                      fontWeight: "700",
                      color: "var(--text-dark)",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <span>{getTicketIcon(selectedTicket.typeName)}</span>
                    <span>{selectedTicket.typeName || "Unnamed Ticket"}</span>
                  </div>
                </div>
                <div
                  style={{
                    color: "#475569",
                    lineHeight: 1.5,
                  }}
                >
                  {selectedTicket.description || "No description available."}
                </div>
                {selectedTicket.rideName && (
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "8px 12px",
                      borderRadius: "9999px",
                      backgroundColor: "#eef2ff",
                      color: "#4338ca",
                      fontWeight: 600,
                      fontSize: "0.9rem",
                      width: "fit-content",
                    }}
                  >
                    🎢 Featured Ride: {selectedTicket.rideName}
                  </div>
                )}
                <div
                  style={{
                    fontSize: "36px",
                    fontWeight: "800",
                    background: "var(--secondary-gradient)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  ${Number(selectedTicket.price ?? 0).toFixed(2)}
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
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="theme-park-btn theme-park-btn-success theme-park-btn-lg w-full"
              >
                {loading
                  ? "⏳ Processing..."
                  : `🎉 Purchase for $${Number(selectedTicket.price ?? 0).toFixed(2)}`}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketPurchase;
