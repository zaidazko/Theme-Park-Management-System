import { useState, useEffect } from "react";
import "./ThemePark.css";
import "./UnifiedSalesReport.css";

const UnifiedSalesReport = () => {
  const [ticketSales, setTicketSales] = useState([]);
  const [commoditySales, setCommoditySales] = useState([]);
  const [restaurantSales, setRestaurantSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
    const [openDropdown, setOpenDropdown] = useState(null);
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    paymentMethod: "",
    saleType: { tickets: true, commodities: true, restaurant: true }
  });

  const [availableItems, setAvailableItems] = useState({
    tickets: new Set(),
    commodities: new Set(),
    restaurant: new Set()
  });

  const [selectedFilters, setSelectedFilters] = useState({
    tickets: {},
    commodities: {},
    restaurant: {}
  });

  // Stats state
  const [stats, setStats] = useState({
    totalRevenue: 0,
    ticketRevenue: 0,
    commodityRevenue: 0,
    restaurantRevenue: 0,
    tickets: {
      mostProfitable: { name: null, revenue: 0 },
      leastProfitable: { name: null, revenue: Infinity }
    },
    commodities: {
      mostProfitable: { name: null, revenue: 0 },
      leastProfitable: { name: null, revenue: Infinity }
    },
    restaurant: {
      mostProfitable: { name: null, revenue: 0 },
      leastProfitable: { name: null, revenue: Infinity }
    }
  });
  
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'asc'
  });

  // Click outside handler for dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
        if (!event.target.closest('.theme-park-dropdown-menu') && 
            !event.target.closest('.theme-park-dropdown-toggle')) {
          setOpenDropdown(null);
        }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const isEmployee = currentUser.userType === "Employee" || currentUser.userType === "Manager";

  useEffect(() => {
    if (isEmployee) {
      fetchAllSales();
    }
  }, []);

  useEffect(() => {
    const filteredData = getFilteredSales();
    calculateStats(filteredData);
  }, [ticketSales, commoditySales, restaurantSales, filters]);

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

      // Collect unique items
      const uniqueItems = {
        tickets: new Set(ticketData?.map(sale => sale.ticketType) || []),
        commodities: new Set(commodityData?.map(sale => sale.commodityName) || []),
        restaurant: new Set(
          restaurantData?.reduce((items, order) => {
            order.items?.forEach(item => items.push(item.itemName));
            return items;
          }, []) || []
        )
      };
      setAvailableItems(uniqueItems);

      // Initialize all items as selected
      const initialSelectedFilters = {
        tickets: Object.fromEntries([...uniqueItems.tickets].map(item => [item, true])),
        commodities: Object.fromEntries([...uniqueItems.commodities].map(item => [item, true])),
        restaurant: Object.fromEntries([...uniqueItems.restaurant].map(item => [item, true]))
      };
      setSelectedFilters(initialSelectedFilters);
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

      // Filter by selected items
      if (type === 'ticket' && !selectedFilters.tickets[sale.ticketType]) return false;
      if (type === 'commodity' && !selectedFilters.commodities[sale.commodityName]) return false;
      if (type === 'restaurant' && sale.items) {
        // For restaurant sales, check if any of the items are selected
        const hasSelectedItem = sale.items.some(item => selectedFilters.restaurant[item.itemName]);
        if (!hasSelectedItem) return false;
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
      // When unchecking a sale type, reset its item filters
      if (!checked) {
        setSelectedFilters(prev => ({
          ...prev,
          [name]: Object.fromEntries(Array.from(availableItems[name]).map(item => [item, true]))
        }));
      }
      
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

  const calculateStats = (filteredSales) => {
    const filtered = {
      tickets: filteredSales.filter(sale => sale.ticketType),
      commodities: filteredSales.filter(sale => sale.commodityName),
      restaurant: filteredSales.filter(sale => sale.items)
    };

    // Calculate total revenue for each category from filtered data
    const ticketTotal = filtered.tickets.reduce((sum, sale) => sum + sale.price, 0);
    const commodityTotal = filtered.commodities.reduce((sum, sale) => sum + sale.price, 0);
    const restaurantTotal = filtered.restaurant.reduce((sum, sale) => sum + sale.totalPrice, 0);

    // Calculate item popularity and revenue
    const ticketStats = filtered.tickets.reduce((acc, sale) => {
      const type = sale.ticketType;
      if (!acc[type]) acc[type] = { count: 0, revenue: 0 };
      acc[type].count++;
      acc[type].revenue += sale.price;
      return acc;
    }, {});

    const commodityStats = filtered.commodities.reduce((acc, sale) => {
      const name = sale.commodityName;
      if (!acc[name]) acc[name] = { count: 0, revenue: 0 };
      acc[name].count++;
      acc[name].revenue += sale.price;
      return acc;
    }, {});

    const restaurantStats = filtered.restaurant.reduce((acc, sale) => {
      sale.items?.forEach(item => {
        const name = item.itemName;
        if (!acc[name]) acc[name] = { count: 0, revenue: 0 };
        acc[name].count++;
        // Assuming item.price is the price per item
        acc[name].revenue += item.price * item.quantity;
      });
      return acc;
    }, {});

    // Get popularity and profitability stats
    const getStats = (stats) => {
      const entries = Object.entries(stats);
      if (entries.length === 0) {
        return {
          mostProfitable: { name: null, revenue: 0 },
          leastProfitable: { name: null, revenue: Infinity }
        };
      }
      
      const byCount = [...entries].sort((a, b) => b[1].count - a[1].count);
      const byRevenue = [...entries].sort((a, b) => b[1].revenue - a[1].revenue);
      
      return {
        mostProfitable: { name: byRevenue[0][0], revenue: byRevenue[0][1].revenue },
        leastProfitable: { name: byRevenue[byRevenue.length - 1][0], revenue: byRevenue[byRevenue.length - 1][1].revenue }
      };
    };

    setStats({
      totalRevenue: ticketTotal + commodityTotal + restaurantTotal,
      ticketRevenue: ticketTotal,
      commodityRevenue: commodityTotal,
      restaurantRevenue: restaurantTotal,
      tickets: getStats(ticketStats),
      commodities: getStats(commodityStats),
      restaurant: getStats(restaurantStats)
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

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortedData = (data) => {
    if (!sortConfig.key) return data;

    return [...data].sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];
      
      // Handle nested or computed values
      if (sortConfig.key === 'amount') {
        aValue = a.price || a.totalPrice || 0;
        bValue = b.price || b.totalPrice || 0;
      } else if (sortConfig.key === 'type') {
        aValue = a.ticketType ? 'Ticket' : a.commodityName ? 'Commodity' : 'Restaurant';
        bValue = b.ticketType ? 'Ticket' : b.commodityName ? 'Commodity' : 'Restaurant';
      } else if (sortConfig.key === 'item') {
        aValue = a.ticketType || a.commodityName || (a.items?.map(item => item.itemName).join(", ") || "Multiple Items");
        bValue = b.ticketType || b.commodityName || (b.items?.map(item => item.itemName).join(", ") || "Multiple Items");
      } else if (sortConfig.key === 'date') {
        aValue = new Date(a.purchaseDate || a.orderDate).getTime();
        bValue = new Date(b.purchaseDate || b.orderDate).getTime();
      }

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  };

  const filteredSales = getSortedData(getFilteredSales());

  return (
    <div className="theme-park-page">
      <div className="theme-park-container">
        <div className="theme-park-header">
          <h1 className="theme-park-title"> Sales Report</h1>
          <p className="theme-park-subtitle">Comprehensive view of all park sales</p>
        </div>

        {error && (
          <div className="theme-park-alert theme-park-alert-error">
            <span className="theme-park-alert-icon">⚠️</span>
            <span>{error}</span>
          </div>
        )}

{/* Statistics Cards */}
<div className="theme-park-stats-grid">
  <div className="theme-park-stat-card">
    <div className="theme-park-stat-label">Total Revenue</div>
    <div className="theme-park-stat-value">${stats.totalRevenue.toFixed(2)}</div>
  </div>
  <div className="theme-park-stat-card">
    <div className="theme-park-stat-label">Ticket Revenue</div>
    <div className="theme-park-stat-value">${stats.ticketRevenue.toFixed(2)}</div>
  </div>
   <div className="theme-park-stat-card">
    <div>
      <div className="theme-park-stat-label">Commodity Revenue</div>
      <div className="theme-park-stat-value">${stats.commodityRevenue.toFixed(2)}</div>
    </div>
  </div>
  <div className="theme-park-stat-card">
    <div className="theme-park-stat-label">Restaurant Revenue</div>
    <div className="theme-park-stat-value">${stats.restaurantRevenue.toFixed(2)}</div>
  </div>
</div>


        {/* Analytics Cards */}
        <div className="theme-park-analytics-grid">
          {/* Ticket Profits */}
          <div className="theme-park-analytics-card">
            <div className="theme-park-analytics-title">
               Ticket Sale Profits
            </div>
            <div className="theme-park-analytics-item">
              <span className="theme-park-analytics-label">Most Profitable:</span>
              <span className="theme-park-analytics-value">
                {stats.tickets.mostProfitable.name || "N/A"}
                {stats.tickets.mostProfitable.revenue ? ` ($${stats.tickets.mostProfitable.revenue.toFixed(2)})` : ""}
              </span>
            </div>
            <div className="theme-park-analytics-item">
              <span className="theme-park-analytics-label">Least Profitable:</span>
              <span className="theme-park-analytics-value">
                {stats.tickets.leastProfitable.name || "N/A"}
                {stats.tickets.leastProfitable.revenue !== Infinity ? ` ($${stats.tickets.leastProfitable.revenue.toFixed(2)})` : ""}
              </span>
            </div>
          </div>

          {/* Commodity Profits */}
          <div className="theme-park-analytics-card">
            <div className="theme-park-analytics-title">
              Merchandise Profits
            </div>
            <div className="theme-park-analytics-item">
              <span className="theme-park-analytics-label">Most Profitable:</span>
              <span className="theme-park-analytics-value">
                {stats.commodities.mostProfitable.name || "N/A"}
                {stats.commodities.mostProfitable.revenue ? ` ($${stats.commodities.mostProfitable.revenue.toFixed(2)})` : ""}
              </span>
            </div>
            <div className="theme-park-analytics-item">
              <span className="theme-park-analytics-label">Least Profitable:</span>
              <span className="theme-park-analytics-value">
                {stats.commodities.leastProfitable.name || "N/A"}
                {stats.commodities.leastProfitable.revenue !== Infinity ? ` ($${stats.commodities.leastProfitable.revenue.toFixed(2)})` : ""}
              </span>
            </div>
          </div>

          {/* Restaurant Profits */}
          <div className="theme-park-analytics-card">
            <div className="theme-park-analytics-title">
              Restaurant Profits
            </div>
            <div className="theme-park-analytics-item">
              <span className="theme-park-analytics-label">Most Profitable:</span>
              <span className="theme-park-analytics-value">
                {stats.restaurant.mostProfitable.name || "N/A"}
                {stats.restaurant.mostProfitable.revenue ? ` ($${stats.restaurant.mostProfitable.revenue.toFixed(2)})` : ""}
              </span>
            </div>
            <div className="theme-park-analytics-item">
              <span className="theme-park-analytics-label">Least Profitable:</span>
              <span className="theme-park-analytics-value">
                {stats.restaurant.leastProfitable.name || "N/A"}
                {stats.restaurant.leastProfitable.revenue !== Infinity ? ` ($${stats.restaurant.leastProfitable.revenue.toFixed(2)})` : ""}
              </span>
            </div>
          </div>
        </div>
        {/* Filters */}
        <div className="theme-park-card">
          <div className="theme-park-card-header">
            <h3 className="theme-park-card-title">
              <span></span> Filter 
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

            <div className="theme-park-filter-row">
              <div className="theme-park-filter-group">
                <div className="theme-park-filter-main">
                  <label className="theme-park-filter-label">
                    <input 
                      type="checkbox" 
                      name="tickets" 
                      checked={filters.saleType.tickets} 
                      onChange={handleFilterChange}
                    />
                    <span>Tickets</span>
                  </label>
                  <button 
                    className={`theme-park-dropdown-toggle ${filters.saleType.tickets ? '' : 'disabled'}`}
                    onClick={(e) => {
                        e.stopPropagation();
                      if (!filters.saleType.tickets) return;
                        setOpenDropdown(openDropdown === 'tickets' ? null : 'tickets');
                    }}
                  >
                    ▼
                  </button>
                </div>
                  <div className={`theme-park-dropdown-menu ${openDropdown === 'tickets' ? 'open' : ''}`}>
                  <div className="theme-park-dropdown-header">
                    <button 
                      className="theme-park-select-all"
                      onClick={() => {
                        const allSelected = Object.values(selectedFilters.tickets).every(v => v);
                        setSelectedFilters(prev => ({
                          ...prev,
                          tickets: Object.fromEntries(
                            Array.from(availableItems.tickets).map(item => [item, !allSelected])
                          )
                        }));
                      }}
                    >
                      {Object.values(selectedFilters.tickets).every(v => v) ? 'Unselect All' : 'Select All'}
                    </button>
                  </div>
                  <div className="theme-park-dropdown-items">
                    {Array.from(availableItems.tickets).map(item => (
                      <label key={`ticket-${item}`} className="theme-park-filter-item">
                        <input
                          type="checkbox"
                          checked={selectedFilters.tickets[item] || false}
                          onChange={() => {
                            setSelectedFilters(prev => ({
                              ...prev,
                              tickets: {
                                ...prev.tickets,
                                [item]: !prev.tickets[item]
                              }
                            }));
                          }}
                        />
                        <span>{item}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="theme-park-filter-group">
                <div className="theme-park-filter-main">
                  <label className="theme-park-filter-label">
                    <input 
                      type="checkbox" 
                      name="commodities" 
                      checked={filters.saleType.commodities} 
                      onChange={handleFilterChange}
                    />
                    <span>Merchandise</span>
                  </label>
                  <button 
                    className={`theme-park-dropdown-toggle ${filters.saleType.commodities ? '' : 'disabled'}`}
                    onClick={(e) => {
                        e.stopPropagation();
                      if (!filters.saleType.commodities) return;
                        setOpenDropdown(openDropdown === 'commodities' ? null : 'commodities');
                    }}
                  >
                    ▼
                  </button>
                </div>
                  <div className={`theme-park-dropdown-menu ${openDropdown === 'commodities' ? 'open' : ''}`}>
                  <div className="theme-park-dropdown-header">
                    <button 
                      className="theme-park-select-all"
                      onClick={() => {
                        const allSelected = Object.values(selectedFilters.commodities).every(v => v);
                        setSelectedFilters(prev => ({
                          ...prev,
                          commodities: Object.fromEntries(
                            Array.from(availableItems.commodities).map(item => [item, !allSelected])
                          )
                        }));
                      }}
                    >
                      {Object.values(selectedFilters.commodities).every(v => v) ? 'Unselect All' : 'Select All'}
                    </button>
                  </div>
                  <div className="theme-park-dropdown-items">
                    {Array.from(availableItems.commodities).map(item => (
                      <label key={`commodity-${item}`} className="theme-park-filter-item">
                        <input
                          type="checkbox"
                          checked={selectedFilters.commodities[item] || false}
                          onChange={() => {
                            setSelectedFilters(prev => ({
                              ...prev,
                              commodities: {
                                ...prev.commodities,
                                [item]: !prev.commodities[item]
                              }
                            }));
                          }}
                        />
                        <span>{item}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="theme-park-filter-group">
                <div className="theme-park-filter-main">
                  <label className="theme-park-filter-label">
                    <input 
                      type="checkbox" 
                      name="restaurant" 
                      checked={filters.saleType.restaurant} 
                      onChange={handleFilterChange}
                    />
                    <span>Restaurant</span>
                  </label>
                  <button 
                    className={`theme-park-dropdown-toggle ${filters.saleType.restaurant ? '' : 'disabled'}`}
                    onClick={(e) => {
                        e.stopPropagation();
                      if (!filters.saleType.restaurant) return;
                        setOpenDropdown(openDropdown === 'restaurant' ? null : 'restaurant');
                    }}
                  >
                    ▼
                  </button>
                </div>
                  <div className={`theme-park-dropdown-menu ${openDropdown === 'restaurant' ? 'open' : ''}`}>
                  <div className="theme-park-dropdown-header">
                    <button 
                      className="theme-park-select-all"
                      onClick={() => {
                        const allSelected = Object.values(selectedFilters.restaurant).every(v => v);
                        setSelectedFilters(prev => ({
                          ...prev,
                          restaurant: Object.fromEntries(
                            Array.from(availableItems.restaurant).map(item => [item, !allSelected])
                          )
                        }));
                      }}
                    >
                      {Object.values(selectedFilters.restaurant).every(v => v) ? 'Unselect All' : 'Select All'}
                    </button>
                  </div>
                  <div className="theme-park-dropdown-items">
                    {Array.from(availableItems.restaurant).map(item => (
                      <label key={`restaurant-${item}`} className="theme-park-filter-item">
                        <input
                          type="checkbox"
                          checked={selectedFilters.restaurant[item] || false}
                          onChange={() => {
                            setSelectedFilters(prev => ({
                              ...prev,
                              restaurant: {
                                ...prev.restaurant,
                                [item]: !prev.restaurant[item]
                              }
                            }));
                          }}
                        />
                        <span>{item}</span>
                      </label>
                    ))}
                  </div>
                </div>
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
                  <th onClick={() => handleSort('type')} className="sortable">
                    Type {sortConfig.key === 'type' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th onClick={() => handleSort('item')} className="sortable">
                    Item {sortConfig.key === 'item' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th onClick={() => handleSort('customerName')} className="sortable">
                    Customer {sortConfig.key === 'customerName' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th onClick={() => handleSort('amount')} className="sortable">
                    Amount {sortConfig.key === 'amount' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th onClick={() => handleSort('paymentMethod')} className="sortable">
                    Payment {sortConfig.key === 'paymentMethod' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th onClick={() => handleSort('date')} className="sortable">
                    Date {sortConfig.key === 'date' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
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
                      <td className="theme-park-amount">
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