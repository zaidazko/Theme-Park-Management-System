import { useState, useEffect } from "react";
import "./ThemePark.css";
import "./UnifiedSalesReport.css";

const UnifiedSalesReport = () => {
  const [ticketSales, setTicketSales] = useState([]);
  const [commoditySales, setCommoditySales] = useState([]);
  const [restaurantSales, setRestaurantSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    paymentMethod: "",
    minAmount: "",
    maxAmount: "",
    // allow combinations using checkboxes
    saleType: { tickets: true, commodities: true, restaurant: true }
  });

  // Stats state
  const [stats, setStats] = useState({
    totalRevenue: 0,
    ticketRevenue: 0,
    commodityRevenue: 0,
    restaurantRevenue: 0,
    tickets: {
      mostPopular: { name: null, count: 0 },
      leastPopular: { name: null, count: Infinity }
    },
    commodities: {
      mostPopular: { name: null, count: 0 },
      leastPopular: { name: null, count: Infinity }
    },
    restaurant: {
      mostPopular: { name: null, count: 0 },
      leastPopular: { name: null, count: Infinity }
    }
  });

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const isEmployee = currentUser.userType === "Employee" || currentUser.userType === "Manager";

  useEffect(() => {
    if (isEmployee) {
      fetchAllSales();
    }
  }, []);

  useEffect(() => {
    calculateStats();
  }, [ticketSales, commoditySales, restaurantSales]);

  const fetchAllSales = async () => {
    setLoading(true);
    try {
      // Fetch all types of sales in parallel
      const [ticketResponse, commodityResponse, restaurantResponse] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/Ticket/Sales`),
        fetch(`${import.meta.env.VITE_API_URL}/Commodity/Sales`),
        fetch(`${import.meta.env.VITE_API_URL}/Restaurant/Orders`)
      ]);

      if (!ticketResponse.ok) throw new Error("Failed to fetch ticket sales");
      if (!commodityResponse.ok) throw new Error("Failed to fetch commodity sales");
      if (!restaurantResponse.ok) throw new Error("Failed to fetch restaurant sales");

      const [ticketData, commodityData, restaurantData] = await Promise.all([
        ticketResponse.json(),
        commodityResponse.json(),
        restaurantResponse.json()
      ]);

      console.log('Ticket Sales:', ticketData);
      console.log('Commodity Sales:', commodityData);
      console.log('Restaurant Orders:', restaurantData);

      setTicketSales(ticketData || []);
      setCommoditySales(commodityData || []);
      setRestaurantSales(restaurantData || []);
    } catch (err) {
      setError(`Failed to load sales data: ${err.message}`);
      console.error('Error fetching sales data:', err);
      // Initialize with empty arrays if fetch fails
      setTicketSales([]);
      setCommoditySales([]);
      setRestaurantSales([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter helper - filters a single sales array by the current filters
  const filterSales = (sales, type) => {
    return (sales || []).filter((sale) => {
      const rawDate = sale.purchaseDate || sale.orderDate;
      if (!rawDate) return false;
      const saleDate = new Date(rawDate);
      const saleAmount = type === "restaurant" ? sale.totalPrice : sale.price;

      if (filters.startDate) {
        const start = new Date(filters.startDate);
        if (saleDate < start) return false;
      }
      if (filters.endDate) {
        const end = new Date(filters.endDate);
        // include the whole end day
        end.setHours(23, 59, 59, 999);
        if (saleDate > end) return false;
      }

      if (filters.paymentMethod) {
        const pm = (sale.paymentMethod || "").toString().toLowerCase();
        if (pm !== filters.paymentMethod.toLowerCase()) return false;
      }

      if (filters.minAmount && saleAmount != null) {
        if (parseFloat(saleAmount) < parseFloat(filters.minAmount)) return false;
      }
      if (filters.maxAmount && saleAmount != null) {
        if (parseFloat(saleAmount) > parseFloat(filters.maxAmount)) return false;
      }

      return true;
    });
  };

  // Return combined filtered sales depending on checkbox selections
  const getFilteredSales = () => {
    const results = [];
    const st = filters.saleType || {};
    if (st.tickets) results.push(...filterSales(ticketSales, "ticket"));
    if (st.commodities) results.push(...filterSales(commoditySales, "commodity"));
    if (st.restaurant) results.push(...filterSales(restaurantSales, "restaurant"));
    return results;
  };

  // Generic handler for inputs and the sale-type checkboxes
  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setFilters((prev) => ({
        ...prev,
        saleType: {
          ...prev.saleType,
          [name]: checked,
        },
      }));
      return;
    }

    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const calculateStats = () => {
    // Calculate total revenue for each category
    const ticketTotal = ticketSales.reduce((sum, sale) => sum + sale.price, 0);
    const commodityTotal = commoditySales.reduce((sum, sale) => sum + sale.price, 0);
    const restaurantTotal = restaurantSales.reduce((sum, sale) => sum + sale.totalPrice, 0);

    // Calculate item popularity
    const ticketCounts = ticketSales.reduce((acc, sale) => {
      acc[sale.ticketType] = (acc[sale.ticketType] || 0) + 1;
      return acc;
    }, {});

    const commodityCounts = commoditySales.reduce((acc, sale) => {
      acc[sale.commodityName] = (acc[sale.commodityName] || 0) + 1;
      return acc;
    }, {});

    const dishCounts = restaurantSales.reduce((acc, sale) => {
      sale.items?.forEach(item => {
        acc[item.itemName] = (acc[item.itemName] || 0) + 1;
      });
      return acc;
    }, {});

    // Find most and least popular for each category
    const getPopularityStats = (counts) => {
      const entries = Object.entries(counts);
      if (entries.length === 0) return { mostPopular: { name: null, count: 0 }, leastPopular: { name: null, count: Infinity } };
      
      const sorted = entries.sort((a, b) => b[1] - a[1]);
      return {
        mostPopular: { name: sorted[0][0], count: sorted[0][1] },
        leastPopular: { name: sorted[sorted.length - 1][0], count: sorted[sorted.length - 1][1] }
      };
    };

    setStats({
      totalRevenue: ticketTotal + commodityTotal + restaurantTotal,
      ticketRevenue: ticketTotal,
      commodityRevenue: commodityTotal,
      restaurantRevenue: restaurantTotal,
      tickets: getPopularityStats(ticketCounts),
      commodities: getPopularityStats(commodityCounts),
      restaurant: getPopularityStats(dishCounts)
    });
  };

  if (loading) {
    return (
      <div className="theme-park-page">
        <div className="theme-park-loading">
          <div className="theme-park-spinner"></div>
          <div className="theme-park-loading-text">Loading sales data...</div>
        </div>
      </div>
    );
  }

  const filteredSales = getFilteredSales();

  return (
    <div className="theme-park-page">
      <div className="theme-park-container">
        <div className="theme-park-header">
          <h1 className="theme-park-title">📊 Unified Sales Report</h1>
          <p className="theme-park-subtitle">Comprehensive view of all park sales</p>
        </div>

        {error && (
          <div className="theme-park-alert theme-park-alert-error">
            <span style={{ fontSize: "24px" }}>⚠️</span>
            <span>{error}</span>
          </div>
        )}

{/* Statistics Cards */}
<div className="theme-park-stats-grid">
  <div className="theme-park-stat-card">
    <div className="theme-park-stat-icon">💰</div>
    <div className="theme-park-stat-label">Total Revenue</div>
    <div className="theme-park-stat-value">${stats.totalRevenue.toFixed(2)}</div>
  </div>
  <div className="theme-park-stat-card">
    <div className="theme-park-stat-icon">🎫</div>
    <div className="theme-park-stat-label">Total Ticket Revenue</div>
    <div className="theme-park-stat-value">${stats.ticketRevenue.toFixed(2)}</div>
  </div>
  <div className="theme-park-stat-card theme-park-total-flex">
    <div className="theme-park-stat-icon">🛍️</div>
    <div>
      <div className="theme-park-stat-label">Total Commodity Revenue</div>
      <div className="theme-park-stat-value">${stats.commodityRevenue.toFixed(2)}</div>
    </div>
  </div>
  <div className="theme-park-stat-card">
    <div className="theme-park-stat-icon">🍽️</div>
    <div className="theme-park-stat-label">Restaurant Revenue</div>
    <div className="theme-park-stat-value">${stats.restaurantRevenue.toFixed(2)}</div>
  </div>
</div>


        {/* Analytics Cards */}
        <div className="theme-park-analytics-grid">
          {/* Ticket Analytics */}
          <div className="theme-park-analytics-card">
            <div className="theme-park-analytics-title">
              🎟️ Ticket Sales Analytics
            </div>
            <div className="theme-park-analytics-item">
              <span className="theme-park-analytics-label">Most Popular:</span>
              <span className="theme-park-analytics-value">
                {stats.tickets.mostPopular.name || "N/A"}
                {stats.tickets.mostPopular.count ? ` (${stats.tickets.mostPopular.count})` : ""}
              </span>
            </div>
            <div className="theme-park-analytics-item">
              <span className="theme-park-analytics-label">Least Popular:</span>
              <span className="theme-park-analytics-value">
                {stats.tickets.leastPopular.name || "N/A"}
                {stats.tickets.leastPopular.count !== Infinity ? ` (${stats.tickets.leastPopular.count})` : ""}
              </span>
            </div>
          </div>

          {/* Commodity Analytics */}
          <div className="theme-park-analytics-card">
            <div className="theme-park-analytics-title">
              🛍️ Merchandise Analytics
            </div>
            <div className="theme-park-analytics-item">
              <span className="theme-park-analytics-label">Most Popular:</span>
              <span className="theme-park-analytics-value">
                {stats.commodities.mostPopular.name || "N/A"}
                {stats.commodities.mostPopular.count ? ` (${stats.commodities.mostPopular.count})` : ""}
              </span>
            </div>
            <div className="theme-park-analytics-item">
              <span className="theme-park-analytics-label">Least Popular:</span>
              <span className="theme-park-analytics-value">
                {stats.commodities.leastPopular.name || "N/A"}
                {stats.commodities.leastPopular.count !== Infinity ? ` (${stats.commodities.leastPopular.count})` : ""}
              </span>
            </div>
          </div>

          {/* Restaurant Analytics */}
          <div className="theme-park-analytics-card">
            <div className="theme-park-analytics-title">
              🍽️ Restaurant Analytics
            </div>
            <div className="theme-park-analytics-item">
              <span className="theme-park-analytics-label">Most Popular:</span>
              <span className="theme-park-analytics-value">
                {stats.restaurant.mostPopular.name || "N/A"}
                {stats.restaurant.mostPopular.count ? ` (${stats.restaurant.mostPopular.count})` : ""}
              </span>
            </div>
            <div className="theme-park-analytics-item">
              <span className="theme-park-analytics-label">Least Popular:</span>
              <span className="theme-park-analytics-value">
                {stats.restaurant.leastPopular.name || "N/A"}
                {stats.restaurant.leastPopular.count !== Infinity ? ` (${stats.restaurant.leastPopular.count})` : ""}
              </span>
            </div>
          </div>
        </div>
        {/* Filters */}
        <div className="theme-park-card">
          <div className="theme-park-card-header">
            <h3 className="theme-park-card-title">
              <span>🔍</span> Filter Options
            </h3>
          </div>
          <div className="theme-park-filter-row">
            <div className="theme-park-filter-item">
              <label>Start Date</label>
              <input
                type="date"
                name="startDate"
                value={filters.startDate}
                onChange={handleFilterChange}
              />
            </div>

            <div className="theme-park-filter-item">
              <label>End Date</label>
              <input
                type="date"
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
              />
            </div>

            <div className="theme-park-filter-item">
              <label>Payment</label>
              <select
                name="paymentMethod"
                value={filters.paymentMethod}
                onChange={handleFilterChange}
              >
                <option value="">All</option>
                <option value="credit">Credit</option>
                <option value="debit">Debit</option>
                <option value="cash">Cash</option>
                <option value="mobile">Mobile</option>
              </select>
            </div>

            <div className="theme-park-filter-item">
              <label>Min</label>
              <input
                type="number"
                name="minAmount"
                value={filters.minAmount}
                onChange={handleFilterChange}
                placeholder="0.00"
              />
            </div>

            <div className="theme-park-filter-item">
              <label>Max</label>
              <input
                type="number"
                name="maxAmount"
                value={filters.maxAmount}
                onChange={handleFilterChange}
                placeholder="999.99"
              />
            </div>

            <div className="theme-park-filter-item">
              <label>Sale Types</label>
              <div className="theme-park-filter-checkboxes">
                <label>
                  <input type="checkbox" name="tickets" checked={filters.saleType.tickets} onChange={handleFilterChange} /> Tickets
                </label>
                <label>
                  <input type="checkbox" name="commodities" checked={filters.saleType.commodities} onChange={handleFilterChange} /> Merchandise
                </label>
                <label>
                  <input type="checkbox" name="restaurant" checked={filters.saleType.restaurant} onChange={handleFilterChange} /> Restaurant
                </label>
              </div>
            </div>
          </div>
        </div>
        {/* Sales Table */}
        <div className="theme-park-card">
          <div className="theme-park-card-header">
            <h3 className="theme-park-card-title">
              <span>📋</span> Sales History
            </h3>
            <div className="theme-park-badge theme-park-badge-primary">
              {filteredSales.length} {filteredSales.length === 1 ? "Sale" : "Sales"}
            </div>
          </div>

          <div className="theme-park-table-container">
            <table className="theme-park-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Item</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Payment</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredSales.map((sale) => {
                  const saleType = sale.ticketType ? "Ticket" :
                                 sale.commodityName ? "Commodity" : "Restaurant";
                  const saleId = sale.ticketId || sale.commoditySaleId || sale.orderId;
                  const saleItem = sale.ticketType || sale.commodityName || 
                                 (sale.items?.map(item => item.itemName).join(", ") || "Multiple Items");
                  const amount = sale.price || sale.totalPrice;
                  const date = new Date(sale.purchaseDate || sale.orderDate).toLocaleDateString();

                  return (
                    <tr key={`${saleType}-${saleId}`}>
                      <td>{saleType}</td>
                      <td>{saleItem}</td>
                      <td>{sale.customerName}</td>
                      <td style={{ fontWeight: "700", color: "var(--success-color)" }}>
                        ${typeof amount === 'number' ? amount.toFixed(2) : amount}
                      </td>
                      <td>💳 {sale.paymentMethod}</td>
                      <td>{date}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnifiedSalesReport;