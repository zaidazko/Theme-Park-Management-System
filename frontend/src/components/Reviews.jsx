import { useState, useEffect } from "react";
import "./ThemePark.css";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import "./UnifiedSalesReport.css";
import { ridesAPI, ReviewsAPI } from "../api";

ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

function Reviews({ onSwitchToMakeReview }) {
  const [reviews, setReviews] = useState([]);
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [ticketSales, setTicketSales] = useState([]);
  const [ticketTypes, setTicketTypes] = useState([]);
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    ride: "",
  });

  const [availableRides, setAvailableRides] = useState(new Set());
  
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "asc"
  })

  const [sortHistoryConfig, setSortHistoryConfig] = useState({
    key: null,
    direction: "asc"
  })

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const isEmployee =
    currentUser.userType === "Employee" || currentUser.userType === "Manager";

  useEffect(() => {
    if (isEmployee) {
      fetchRidershipData();
    } else {
      fetchMyReviews();
    }
  }, []);

  const fetchRidershipData = async () => {
    setLoading(true);
    try{
      const[ticketSaleResponse, ticketTypeResponse] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/ticket/sales`),
        fetch(`${import.meta.env.VITE_API_URL}/ticket/types`)
      ]);

      if (!ticketSaleResponse.ok) throw new Error("Failed to fetch ticket sales");
      if (!ticketTypeResponse.ok) throw new Error("Failed to fetch ticket types");

      const [ridesData, reviewsData, ticketSalesData, ticketTypesData] = await Promise.all([
        ridesAPI.getAllRides(),
        ReviewsAPI.getAllReviews(),
        ticketSaleResponse.json(),
        ticketTypeResponse.json()
      ]);

      setRides(ridesData);
      setReviews(reviewsData);
      setTicketSales(ticketSalesData);
      setTicketTypes(ticketTypesData);

      const uniqueRides = new Set();
      ticketTypesData?.forEach((ticket) => {
        if (ticket.rideName) {
          uniqueRides.add(ticket.rideName);
        }
      });
      setAvailableRides(uniqueRides);

    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  // For Customers - Show their reviews
  const fetchMyReviews = async () => {
    if (!currentUser.customerId) {
      setError("Please login to view your tickets");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/reviews/customer/${
          currentUser.customerId
        }`
      );
      if (!response.ok) throw new Error("Failed to fetch reviews");
      const data = await response.json();
      setReviews(data);
    } catch (err) {
      setError("Failed to load reviews");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filterSales = () => {
    return (ticketSales || []).filter((sale) => {
      const rawDate = sale.purchaseDate;
      if (!rawDate) return false;

      const saleDateStr = sale.purchaseDate.split("T")[0];

      if (filters.startDate && saleDateStr < filters.startDate) {
        return false;
      }

      if (filters.endDate && saleDateStr > filters.endDate) {
        return false;
      }

      if(filters.ride) {
        const rideName = sale.ticketType;
        if (!rideName || rideName !== filters.ride) return false;
      }
      
      return true;
    });
  };

  const filteredSales = filterSales()

  const handleFilterChange = (e) => {
    const {name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }) );
  };

  const getDaysInFilterRange = () => {
    if (!filters.startDate || !filters.endDate) return 1;
    const start = new Date(filters.startDate);
    const end = new Date(filters.endDate);
    const diff = (end - start) / (1000 * 60 * 60 * 24);
    return Math.max(1, Math.round(diff + 1));
  };

  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return {
          key,
          direction: prev.direction === "asc" ? "desc" : "asc",
        };
      }
      return { key, direction: "asc" };
    });
  };

  const getSortedData = (data) => {
    if (!sortConfig.key) return data;

    return [...data].sort((a,b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      if (sortConfig.key === "rideName") {
        aValue = a.rideName || "";
        bValue = b.rideName || "";
      }

      else if (sortConfig.key === "totalRidership"){
        aValue = a.totalRidership || 0;
        bValue = b.totalRidership || 0;
      }

      else if (sortConfig.key ==="averageRidershipPerDay"){
        aValue = parseFloat(a.averageRidershipPerDay) || 0;
        bValue = parseFloat(b.averageRidershipPerDay) || 0;
      }

      else if (sortConfig.key === "averageRating"){
        aValue = a.averageRating === "N/A" ? 0 : parseFloat(a.averageRating);
        bValue = b.averageRating === "N/A" ? 0 : parseFloat(b.averageRating);
      }

      else if (sortConfig.key === "totalReviews"){
        aValue = a.totalReviews || 0;
        bValue = b.totalReviews || 0;
      }

      if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  };

  const computeRideStats = () => {
    const rideStats = {};

    rides.forEach((ride) => {
      const rideName = ride.ride_Name;

      const rideSales = filterSales().filter(
        (sale) => sale.ticketType === rideName
      );

      const rideReviews = reviews.filter((r) => r.rideName === rideName);

      const totalRidership = rideSales.length;
      const totalReviews = rideReviews.length;
      const averageRating =
        totalReviews > 0
          ? (
              rideReviews.reduce((sum, r) => sum + r.score, 0) / totalReviews
            ).toFixed(2)
          : "N/A";

      rideStats[rideName] = {
        rideName,
        totalRidership,
        averageRidershipPerDay: (
          totalRidership / getDaysInFilterRange()
        ).toFixed(1),
        averageRating,
        totalReviews,
      };
    });

    return Object.values(rideStats);
  };
  const rideStats = computeRideStats();

  const sortedRideStats = getSortedData(rideStats);

  const handleHistorySort = (key) => {
    setSortHistoryConfig((prev) => {
      if (prev.key === key) {
        return {
          key,
          direction: prev.direction === "asc" ? "desc" : "asc",
        };
      }
      return { key, direction: "asc" };
    });
  };

  const ticketHistory = filteredSales.map((sale) => ({
    ticketId: sale.ticketId,
    rideName: sale.ticketType,
    customerName: sale.customerName,
    date: sale.purchaseDate,
  }));

  const getSortedHistory = (data) => {
    if (!sortHistoryConfig) return data;

    return [...data].sort((a,b) => {
      let aValue = a[sortHistoryConfig.key];
      let bValue = b[sortHistoryConfig.key];

      if(sortHistoryConfig.key === "ticketId"){
        aValue = a.ticketId || 0;
        bValue = b.ticketId || 0;
      }

      else if (sortHistoryConfig.key === "rideName") {
        aValue = a.rideName || "";
        bValue = b.rideName || "";
      }

      else if (sortHistoryConfig.key === "customerName"){
        aValue = a.customerName || "";
        bValue = b.customerName || "";
      }

      else if (sortHistoryConfig.key === "date"){
        aValue = a.date ? new Date(a.date).getTime() : 0;
        bValue = b.date ? new Date(b.date).getTime() : 0;
      }

      if (aValue < bValue) return sortHistoryConfig.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sortHistoryConfig.direction === "asc" ? 1 : -1;
      return 0;
    })
  }

  const sortedHistory = getSortedHistory(ticketHistory);

  const formatDateShort = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="theme-park-page" style={{ padding: "40px 10px" }}>
      <div
        className="theme-park-container"
        style={{ maxWidth: "1800px", width: "100%" }}
      >
        <div className="theme-park-header">
        
          <h1 className="theme-park-title">
            {isEmployee ? "Ridership Report" : "🎫 My Reviews"}
          </h1>

          {!isEmployee && (
            <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              marginTop: "8px",
            }}
          >
              <button
                className="theme-park-btn theme-park-btn-primary theme-park-btn-lg"
                style={{
                      position: "absolute",
                      right: 0,
                      marginBottom: "10px"
                    }}
                onClick={onSwitchToMakeReview}
              >
                Make a Review
              </button>
            </div>
          )}
        
        </div>
      </div>
      {error && (
        <div
          style={{
            padding: "12px",
            backgroundColor: "#f8d7da",
            color: "#721c24",
            borderRadius: "6px",
            marginBottom: "20px",
            textAlign: "center",
          }}
        >
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: "center", padding: "40px" }}>Loading...</div>
      ) : reviews.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#999" }}>
          {isEmployee ? "No reviews yet" : "You haven't made any reviews yet"}
        </div>
      ) : (
        <>
          {isEmployee && (
            <>

              <div className="theme-park-card" style={{ marginTop: "1.5rem" }}>
                <div className="theme-park-card-header">
                  <h3 className="theme-park-card-title">
                    <span>📊</span> Ridership Over Time
                  </h3>
                </div>

                <div style={{ padding: "1.5rem", height: "400px" }}>
                </div>
              </div>

              <div className="theme-park-card" style={{ padding: "30px 15px" }}>
                <div className="theme-park-card-header">
                  <h3 className="theme-park-card-title">
                    <span>📋</span> Ridership and Review Summary
                  </h3>
                </div>

                {/* Stats Table */}
                <div
                  className="theme-park-table-container"
                  style={{ overflowX: "auto", width: "100%" }}
                >
                  <table className="theme-park-table" style={{ tableLayout: "fixed", width: "100%" }}>
                    <thead>
                      <tr>
                        <th
                          onClick={() => handleSort("rideName")}
                          className="sortable"
                        >
                          Ride
                          {sortConfig.key === "rideName" ? 
                            sortConfig.direction === "asc"
                              ? " ↑"
                              : " ↓"
                            : ""}
                        </th>

                        <th
                          onClick={() => handleSort("totalRidership")}
                          className="sortable"
                        >
                          Total Ridership
                          {sortConfig.key === "totalRidership" ? 
                            sortConfig.direction === "asc"
                              ? " ↑"
                              : " ↓"
                            : ""}
                        </th>

                        <th
                          onClick={() => handleSort("averageRidershipPerDay")}
                          className="sortable"
                        >
                          Average Ridership Per Day
                          {sortConfig.key === "averageRidershipPerDay" ? 
                            sortConfig.direction === "asc"
                              ? " ↑"
                              : " ↓"
                            : ""}
                        </th>

                        <th
                          onClick={() => handleSort("averageRating")}
                          className="sortable"
                        >
                          Average Rating
                          {sortConfig.key === "averageRating" ? 
                            sortConfig.direction === "asc"
                              ? " ↑"
                              : " ↓"
                            : ""}
                        </th>

                        <th
                          onClick={() => handleSort("totalReviews")}
                          className="sortable"
                        >
                          Total Reviews
                          {sortConfig.key === "totalReviews" ? 
                            sortConfig.direction === "asc"
                              ? " ↑"
                              : " ↓"
                            : ""}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedRideStats.length === 0 ? (
                        <tr>
                          <td colSpan="5" style={{ textAlign: "center", padding: "20px" }}>
                            No data available for the selected filters.
                          </td>
                        </tr>
                      ) : (
                        sortedRideStats.map((stat) => (
                          <tr key={stat.rideName}>
                            <td>{stat.rideName}</td>
                            <td>{stat.totalRidership}</td>
                            <td>{stat.averageRidershipPerDay}</td>
                            <td>{stat.averageRating}</td>
                            <td>{stat.totalReviews}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              
              {/*Filters*/}
              <div className="theme-park-card">
                <div className="theme-park-card-header">
                  <h3 className="theme-park-card-title">
                    <span>🔍</span> Filters
                  </h3>
                  {(filters.startDate ||
                    filters.endDate ||
                    filters.ride) && (
                    <button
                      onClick={() => {
                        setFilters({
                          startDate: "",
                          endDate: "",
                          ride: "",
                        });
                      }}
                      style={{
                        backgroundColor: "#ef4444",
                        color: "white",
                        border: "none",
                        padding: "8px 16px",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontSize: "14px",
                        fontWeight: "500",
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#dc2626";
                        e.currentTarget.style.transform = "translateY(-1px)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "#ef4444";
                        e.currentTarget.style.transform = "translateY(0)";
                      }}
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: "1.5rem",
                    padding: "1rem 0",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.5rem",
                    }}
                  >
                    <label
                      style={{
                        fontSize: "0.875rem",
                        fontWeight: "600",
                        color: "#374151",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      Start Date
                    </label>
                    <input
                      type="date"
                      name="startDate"
                      value={filters.startDate}
                      onChange={handleFilterChange}
                      style={{
                        padding: "10px 12px",
                        border: "1px solid #d1d5db",
                        borderRadius: "6px",
                        fontSize: "14px",
                        backgroundColor: "white",
                        transition: "all 0.2s",
                        outline: "none",
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = "#3b82f6";
                        e.currentTarget.style.boxShadow =
                          "0 0 0 3px rgba(59, 130, 246, 0.1)";
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = "#d1d5db";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    />
                  </div>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.5rem",
                    }}
                  >
                    <label
                      style={{
                        fontSize: "0.875rem",
                        fontWeight: "600",
                        color: "#374151",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      End Date
                    </label>
                    <input
                      type="date"
                      name="endDate"
                      value={filters.endDate}
                      onChange={handleFilterChange}
                      style={{
                        padding: "10px 12px",
                        border: "1px solid #d1d5db",
                        borderRadius: "6px",
                        fontSize: "14px",
                        backgroundColor: "white",
                        transition: "all 0.2s",
                        outline: "none",
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = "#3b82f6";
                        e.currentTarget.style.boxShadow =
                          "0 0 0 3px rgba(59, 130, 246, 0.1)";
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = "#d1d5db";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    />
                  </div>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.5rem",
                    }}
                  >
                    <label
                      style={{
                        fontSize: "0.875rem",
                        fontWeight: "600",
                        color: "#374151",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      Ride
                    </label>
                    <select
                      name="ride"
                      value={filters.ride}
                      onChange={handleFilterChange}
                      style={{
                        padding: "10px 12px",
                        border: "1px solid #d1d5db",
                        borderRadius: "6px",
                        fontSize: "14px",
                        backgroundColor: "white",
                        cursor: "pointer",
                        transition: "all 0.2s",
                        outline: "none",
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = "#3b82f6";
                        e.currentTarget.style.boxShadow =
                          "0 0 0 3px rgba(59, 130, 246, 0.1)";
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = "#d1d5db";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    >
                      <option value="">All Rides</option>
                      {Array.from(availableRides)
                        .sort()
                        .map((ride) => (
                          <option key={ride} value={ride}>
                            {ride}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              </div>
              
              {/*Ridership History Table*/}
              <div className = "theme-park-card">
                <div className="theme-park-card-header">
                  <h3 className="theme-park-card-title">
                    Ridership History
                  </h3>
                </div>

                <div
                  className="theme-park-table-container"
                  style={{ overflowX: "auto", width: "100%" }}
                >

                  <table className="theme-park-table" style={{ tableLayout: "fixed", width: "100%" }}>
                    
                    <thead>
                      <tr>
                        <th
                          onClick={() => handleHistorySort("ticketId")}
                          className="sortable"
                        >
                          Ticket ID
                          {sortHistoryConfig.key === "ticketId" ? 
                            sortHistoryConfig.direction === "asc"
                              ? " ↑"
                              : " ↓"
                            : ""}
                        </th>
                        <th
                          onClick={() => handleHistorySort("rideName")}
                          className="sortable"
                        >
                          Ride
                          {sortHistoryConfig.key === "rideName" ? 
                            sortHistoryConfig.direction === "asc"
                              ? " ↑"
                              : " ↓"
                            : ""}
                        </th>
                        
                        <th
                          onClick={() => handleHistorySort("customerName")}
                          className="sortable"
                        >
                          Customer Name
                          {sortHistoryConfig.key === "customerName" ? 
                            sortHistoryConfig.direction === "asc"
                              ? " ↑"
                              : " ↓"
                            : ""}
                        </th>

                        <th
                          onClick={() => handleHistorySort("date")}
                          className="sortable"
                        >
                          Date
                          {sortHistoryConfig.key === "date" ? 
                            sortHistoryConfig.direction === "asc"
                              ? " ↑"
                              : " ↓"
                            : ""}
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {sortedHistory.length === 0 ? (
                        <tr>
                          <td
                            colSpan="4"
                            style={{ textAlign: "center", padding: "40px"}}
                          >
                            <div className="theme-park-empty">
                              <div className="theme-park-empty-icon">🔧</div>
                              <div className="theme-park-empty-title">
                                No Ridership History
                              </div>
                              <div className="theme-park-empty-text">
                                No ridership data match the current filters.
                              </div>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        sortedHistory.map((rider) => (
                          <tr
                            key={rider.ticketId}
                          >
                            <td>{rider.ticketId}</td>
                            <td>{rider.rideName}</td>
                            <td>{rider.customerName}</td>
                            <td>{formatDateShort(rider.date)}</td>
                          </tr>
                        ))
                      )}

                    </tbody>

                  </table>

                </div>

              </div>
            </>
          )}


          {!isEmployee && (
            <div className="theme-park-card" style={{ padding: "30px 15px" }}>
                <div
                  className="theme-park-table-container"
                  style={{ overflowX: "auto", width: "100%" }}
                >
                  <table
                    className="theme-park-table"
                    style={{ tableLayout: "fixed", width: "100%" }}
                  >
                    <thead>
                      <tr>
                        <th style={{ width: "10%", minWidth: "100px" }}>Ride</th>
                        <th style={{ width: "10%", minWidth: "100px" }}>Rating</th>
                        <th style={{ width: "10%", minWidth: "100px" }}>
                          Feedback
                        </th>
                        <th style={{ width: "10%", minWidth: "100px" }}>
                          Review Date
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {reviews.map((review) => (
                        <tr
                          key={review.reviewID}
                          style={{transition: "background-color 0.2s"}}
                        >
                          <td style={{ textAlign: "center", padding: "40px"}}>{review.rideName}</td>
                          <td style={{ textAlign: "center", padding: "40px"}}>{review.score}</td>
                          <td style={{ textAlign: "center", padding: "40px"}}>{review.feedback}</td>
                          <td style={{ textAlign: "center", padding: "40px"}}>
                            {new Date(review.reviewDate).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Reviews;
