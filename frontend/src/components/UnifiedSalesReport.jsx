import { useEffect, useMemo, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Doughnut } from "react-chartjs-2";
import "./ThemePark.css";
import "./UnifiedSalesReport.css";

ChartJS.register(CategoryScale, LinearScale, ArcElement, Title, Tooltip, Legend);

const CATEGORY_ORDER = ["tickets", "commodities", "menu"];

const CATEGORY_META = {
  tickets: {
    label: "Tickets",
    filterLabel: "Tickets",
    icon: "🎫",
    color: "#3b82f6",
    background: "#f0f7ff",
    border: "#3b82f6",
    revenueKey: "ticketRevenue",
    breakdownKey: "ticketBreakdown",
    statsKey: "tickets",
    chart: {
      background: "rgba(59, 130, 246, 0.9)",
      border: "rgba(59, 130, 246, 1)",
    },
  },
  commodities: {
    label: "Merchandise",
    filterLabel: "Merchandise",
    icon: "🛍️",
    color: "#10b981",
    background: "#f0fdf4",
    border: "#10b981",
    revenueKey: "commodityRevenue",
    breakdownKey: "commodityBreakdown",
    statsKey: "commodities",
    chart: {
      background: "rgba(16, 185, 129, 0.9)",
      border: "rgba(16, 185, 129, 1)",
    },
  },
  menu: {
    label: "Menu",
    filterLabel: "Menu Items",
    icon: "🍔",
    color: "#fbbf24",
    background: "#fffbeb",
    border: "#fbbf24",
    revenueKey: "menuRevenue",
    breakdownKey: "menuBreakdown",
    statsKey: "menu",
    chart: {
      background: "rgba(251, 191, 36, 0.9)",
      border: "rgba(251, 191, 36, 1)",
    },
  },
};

const buildSelectionMap = (items) =>
  Object.fromEntries(items.map((item) => [item, true]));

const formatCurrency = (value) => `$${value.toFixed(2)}`;

const formatPaymentMethod = (value) => {
  if (!value) {
    return "Unknown";
  }
  const lower = value.toString().toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
};

const formatDate = (value) => {
  if (!value) {
    return "Unknown";
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "Unknown";
  }
  return parsed.toLocaleDateString();
};

const UnifiedSalesReport = () => {
  const [ticketSales, setTicketSales] = useState([]);
  const [commoditySales, setCommoditySales] = useState([]);
  const [menuSales, setMenuSales] = useState([]);
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    paymentMethod: "",
    saleType: {
      tickets: true,
      commodities: true,
      menu: true,
    },
  });
  const [availableItems, setAvailableItems] = useState({
    tickets: new Set(),
    commodities: new Set(),
    menu: new Set(),
  });
  const [selectedItems, setSelectedItems] = useState({
    tickets: {},
    commodities: {},
    menu: {},
  });
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openDropdown, setOpenDropdown] = useState(null);

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const isEmployee =
    currentUser.userType === "Employee" || currentUser.userType === "Manager";

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        !event.target.closest(".theme-park-dropdown-menu") &&
        !event.target.closest(".theme-park-dropdown-toggle")
      ) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (!isEmployee) {
      setLoading(false);
      setError("Sales report is restricted to staff accounts.");
      return;
    }

    const fetchAllSales = async () => {
      setLoading(true);
      setError("");

      try {
        const baseUrl = import.meta.env.VITE_API_URL;
        const [ticketResponse, commodityResponse, menuResponse] =
          await Promise.all([
            fetch(`${baseUrl}/Ticket/Sales`),
            fetch(`${baseUrl}/Commodity/Sales`),
            fetch(`${baseUrl}/Menu/Sales`),
          ]);

        if (!ticketResponse.ok) {
          throw new Error("Failed to fetch ticket sales");
        }
        if (!commodityResponse.ok) {
          throw new Error("Failed to fetch merchandise sales");
        }
        if (!menuResponse.ok) {
          throw new Error("Failed to fetch menu sales");
        }

        const [ticketData, commodityData, menuData] = await Promise.all([
          ticketResponse.json(),
          commodityResponse.json(),
          menuResponse.json(),
        ]);

        const normalizedTickets = (ticketData ?? []).map((sale) => ({
          id: sale.ticketId,
          category: "tickets",
          itemName: sale.ticketType ?? "Ticket",
          amount: Number(sale.price ?? 0),
          paymentMethod: (sale.paymentMethod ?? "Unknown").toString(),
          date: sale.purchaseDate,
          customerName: sale.customerName ?? "Unknown Customer",
          quantity: sale.quantity ?? 1,
        }));

        const normalizedCommodities = (commodityData ?? []).map((sale) => ({
          id: sale.commoditySaleId,
          category: "commodities",
          itemName: sale.commodityName ?? "Merchandise Item",
          amount: Number(sale.price ?? 0),
          paymentMethod: (sale.paymentMethod ?? "Unknown").toString(),
          date: sale.purchaseDate,
          customerName: sale.customerName ?? "Unknown Customer",
          quantity: sale.quantity ?? 1,
        }));

        const normalizedMenu = (menuData ?? []).map((sale) => ({
          id: sale.saleId,
          category: "menu",
          itemName: sale.menuItem ?? "Menu Item",
          amount: Number(sale.price ?? 0),
          paymentMethod: (sale.paymentMethod ?? "Unknown").toString(),
          date: sale.purchaseDate,
          customerName: sale.customerName ?? "Unknown Customer",
          quantity: sale.quantity ?? 1,
        }));

        setTicketSales(normalizedTickets);
        setCommoditySales(normalizedCommodities);
        setMenuSales(normalizedMenu);

        const ticketNames = new Set(
          normalizedTickets.map((sale) => sale.itemName)
        );
        const commodityNames = new Set(
          normalizedCommodities.map((sale) => sale.itemName)
        );
        const menuNames = new Set(normalizedMenu.map((sale) => sale.itemName));

        setAvailableItems({
          tickets: ticketNames,
          commodities: commodityNames,
          menu: menuNames,
        });

        setSelectedItems({
          tickets: buildSelectionMap(Array.from(ticketNames)),
          commodities: buildSelectionMap(Array.from(commodityNames)),
          menu: buildSelectionMap(Array.from(menuNames)),
        });
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load sales information."
        );
        setTicketSales([]);
        setCommoditySales([]);
        setMenuSales([]);
        setAvailableItems({
          tickets: new Set(),
          commodities: new Set(),
          menu: new Set(),
        });
        setSelectedItems({
          tickets: {},
          commodities: {},
          menu: {},
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAllSales();
  }, [isEmployee]);

  const getFilteredCategorySales = (sales, categoryKey) => {
    if (!filters.saleType[categoryKey]) {
      return [];
    }

    return (sales ?? []).filter((sale) => {
      if (!sale.date) {
        return false;
      }

      const saleDate = new Date(sale.date);
      if (Number.isNaN(saleDate.getTime())) {
        return false;
      }

      if (filters.startDate) {
        const start = new Date(filters.startDate);
        if (saleDate < start) {
          return false;
        }
      }

      if (filters.endDate) {
        const end = new Date(filters.endDate);
        end.setHours(23, 59, 59, 999);
        if (saleDate > end) {
          return false;
        }
      }

      if (filters.paymentMethod) {
        if (
          sale.paymentMethod.toLowerCase() !==
          filters.paymentMethod.toLowerCase()
        ) {
          return false;
        }
      }

      const selections = selectedItems[categoryKey];
      if (selections && Object.keys(selections).length > 0) {
        if (!selections[sale.itemName]) {
          return false;
        }
      }

      return true;
    });
  };

  const filteredTicketSales = useMemo(
    () => getFilteredCategorySales(ticketSales, "tickets"),
    [ticketSales, filters, selectedItems]
  );

  const filteredCommoditySales = useMemo(
    () => getFilteredCategorySales(commoditySales, "commodities"),
    [commoditySales, filters, selectedItems]
  );

  const filteredMenuSales = useMemo(
    () => getFilteredCategorySales(menuSales, "menu"),
    [menuSales, filters, selectedItems]
  );

  const aggregateStats = useMemo(() => {
    const sumRevenue = (sales) =>
      sales.reduce(
        (total, sale) => total + (Number.isFinite(sale.amount) ? sale.amount : 0),
        0
      );

    const buildBreakdown = (sales) => {
      const map = new Map();
      sales.forEach((sale) => {
        const key = sale.itemName;
        const previous = map.get(key) ?? { revenue: 0, quantity: 0 };
        previous.revenue += sale.amount;
        previous.quantity += sale.quantity ?? 1;
        map.set(key, previous);
      });
      return Array.from(map.entries())
        .map(([name, data]) => ({
          name,
          revenue: data.revenue,
          quantity: data.quantity,
        }))
        .sort((a, b) => b.revenue - a.revenue);
    };

    const profitStats = (breakdown) => {
      if (breakdown.length === 0) {
        return {
          mostProfitable: { name: null, revenue: 0 },
          leastProfitable: { name: null, revenue: Infinity },
        };
      }

      const sorted = [...breakdown].sort((a, b) => b.revenue - a.revenue);

      return {
        mostProfitable: {
          name: sorted[0].name,
          revenue: sorted[0].revenue,
        },
        leastProfitable: {
          name: sorted[sorted.length - 1].name,
          revenue: sorted[sorted.length - 1].revenue,
        },
      };
    };

    const ticketRevenue = sumRevenue(filteredTicketSales);
    const commodityRevenue = sumRevenue(filteredCommoditySales);
    const menuRevenue = sumRevenue(filteredMenuSales);

    const ticketBreakdown = buildBreakdown(filteredTicketSales);
    const commodityBreakdown = buildBreakdown(filteredCommoditySales);
    const menuBreakdown = buildBreakdown(filteredMenuSales);

    return {
      totalRevenue: ticketRevenue + commodityRevenue + menuRevenue,
      ticketRevenue,
      commodityRevenue,
      menuRevenue,
      tickets: profitStats(ticketBreakdown),
      commodities: profitStats(commodityBreakdown),
      menu: profitStats(menuBreakdown),
      ticketBreakdown,
      commodityBreakdown,
      menuBreakdown,
    };
  }, [filteredTicketSales, filteredCommoditySales, filteredMenuSales]);

  const allFilteredSales = useMemo(
    () => [
      ...filteredTicketSales,
      ...filteredCommoditySales,
      ...filteredMenuSales,
    ],
    [filteredTicketSales, filteredCommoditySales, filteredMenuSales]
  );

  const getSortedSales = (sales, sort) => {
    if (!sort.key) {
      return sales;
    }

    const sorted = [...sales].sort((a, b) => {
      let aValue;
      let bValue;

      switch (sort.key) {
        case "type":
          aValue = CATEGORY_META[a.category]?.label ?? a.category;
          bValue = CATEGORY_META[b.category]?.label ?? b.category;
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
          break;
        case "item":
          aValue = (a.itemName ?? "").toLowerCase();
          bValue = (b.itemName ?? "").toLowerCase();
          break;
        case "customerName":
          aValue = (a.customerName ?? "").toLowerCase();
          bValue = (b.customerName ?? "").toLowerCase();
          break;
        case "amount":
          aValue = a.amount ?? 0;
          bValue = b.amount ?? 0;
          break;
        case "paymentMethod":
          aValue = (a.paymentMethod ?? "").toLowerCase();
          bValue = (b.paymentMethod ?? "").toLowerCase();
          break;
        case "date":
          aValue = a.date ? new Date(a.date).getTime() : 0;
          bValue = b.date ? new Date(b.date).getTime() : 0;
          break;
        default:
          aValue = 0;
          bValue = 0;
      }

      if (aValue < bValue) {
        return sort.direction === "asc" ? -1 : 1;
      }
      if (aValue > bValue) {
        return sort.direction === "asc" ? 1 : -1;
      }
      return 0;
    });

    return sorted;
  };

  const sortedSales = useMemo(
    () => getSortedSales(allFilteredSales, sortConfig),
    [allFilteredSales, sortConfig]
  );

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

  const revenueChartData = useMemo(() => {
    const labels = CATEGORY_ORDER.map((key) => CATEGORY_META[key].label);
    const data = CATEGORY_ORDER.map(
      (key) => aggregateStats[CATEGORY_META[key].revenueKey] ?? 0
    );
    const backgroundColor = CATEGORY_ORDER.map(
      (key) => CATEGORY_META[key].chart.background
    );
    const borderColor = CATEGORY_ORDER.map(
      (key) => CATEGORY_META[key].chart.border
    );

    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor,
          borderColor,
          borderWidth: 3,
        },
      ],
    };
  }, [aggregateStats]);

  const revenueChartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            padding: 20,
            font: {
              size: 14,
              weight: "500",
            },
          },
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              const label = context.label || "";
              const value = context.parsed || 0;
              const total = context.dataset.data.reduce(
                (acc, val) => acc + val,
                0
              );
              const percentage = total
                ? ((value / total) * 100).toFixed(1)
                : "0.0";
              return `${label}: ${formatCurrency(value)} (${percentage}%)`;
            },
          },
        },
      },
    }),
    []
  );

  const handleFilterChange = (event) => {
    const { name, value, type, checked } = event.target;

    if (type === "checkbox") {
      if (!checked) {
        const items = Array.from(availableItems[name] ?? []);
        setSelectedItems((prev) => ({
          ...prev,
          [name]: buildSelectionMap(items),
        }));
        setOpenDropdown((current) => (current === name ? null : current));
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

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const toggleSelectAll = (categoryKey) => {
    const items = Array.from(availableItems[categoryKey] ?? []);
    const selections = selectedItems[categoryKey] ?? {};
    const allSelected =
      items.length > 0 && items.every((item) => selections[item]);

    const nextSelection = Object.fromEntries(
      items.map((item) => [item, !allSelected])
    );

    setSelectedItems((prev) => ({
      ...prev,
      [categoryKey]: nextSelection,
    }));
  };

  const toggleItemSelection = (categoryKey, itemName) => {
    setSelectedItems((prev) => {
      const previous = prev[categoryKey] ?? {};
      return {
        ...prev,
        [categoryKey]: {
          ...previous,
          [itemName]: !previous[itemName],
        },
      };
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

  const totalSalesCount = sortedSales.length;

  return (
    <div className="theme-park-page">
      <div className="theme-park-container">
        <div className="theme-park-header">
          <h1 className="theme-park-title">Sales Report</h1>
          <p className="theme-park-subtitle">
            Comprehensive view of ticket, merchandise, and menu sales
          </p>
        </div>

        {error && (
          <div className="theme-park-alert theme-park-alert-error">
            <span className="theme-park-alert-icon">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <div className="theme-park-card" style={{ marginTop: "1.5rem" }}>
          <div className="theme-park-card-header">
            <h3 className="theme-park-card-title">
              <span>💰</span> Total Revenue Breakdown
            </h3>
            <div
              style={{ fontSize: "1.25rem", fontWeight: "600", color: "#1f2937" }}
            >
              {formatCurrency(aggregateStats.totalRevenue)}
            </div>
          </div>
          <div style={{ padding: "1.5rem", height: "400px" }}>
            <Doughnut data={revenueChartData} options={revenueChartOptions} />
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "1rem",
              padding: "1rem 1.5rem",
              borderTop: "1px solid #e5e7eb",
            }}
          >
            {CATEGORY_ORDER.map((key) => {
              const meta = CATEGORY_META[key];
              const revenue = aggregateStats[meta.revenueKey] ?? 0;
              return (
                <div key={`summary-${key}`} style={{ textAlign: "center" }}>
                  <div
                    style={{
                      fontSize: "0.875rem",
                      color: "#6b7280",
                      marginBottom: "0.25rem",
                    }}
                  >
                    {meta.label} Revenue
                  </div>
                  <div
                    style={{
                      fontSize: "1.125rem",
                      fontWeight: "600",
                      color: meta.color,
                    }}
                  >
                    {formatCurrency(revenue)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "1.5rem",
            marginTop: "1.5rem",
          }}
        >
          {CATEGORY_ORDER.map((key) => {
            const meta = CATEGORY_META[key];
            const revenue = aggregateStats[meta.revenueKey] ?? 0;
            const breakdown = aggregateStats[meta.breakdownKey] ?? [];

            return (
              <div className="theme-park-card" key={`breakdown-${key}`}>
                <div className="theme-park-card-header">
                  <h3 className="theme-park-card-title" style={{ fontSize: "1rem" }}>
                    <span>{meta.icon}</span> {meta.label} Revenue
                  </h3>
                  <div
                    style={{
                      fontSize: "1.125rem",
                      fontWeight: "600",
                      color: meta.color,
                    }}
                  >
                    {formatCurrency(revenue)}
                  </div>
                </div>
                <div style={{ padding: "1rem" }}>
                  {breakdown.length > 0 ? (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.75rem",
                      }}
                    >
                      {breakdown.map((item) => {
                        const percentage = revenue
                          ? ((item.revenue / revenue) * 100).toFixed(1)
                          : 0;
                        return (
                          <div
                            key={`${key}-${item.name}`}
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              padding: "0.75rem",
                              backgroundColor: meta.background,
                              borderRadius: "6px",
                              borderLeft: `3px solid ${meta.border}`,
                            }}
                          >
                            <div style={{ flex: 1 }}>
                              <div
                                style={{
                                  fontSize: "0.875rem",
                                  fontWeight: "600",
                                  color: "#1f2937",
                                  marginBottom: "0.25rem",
                                }}
                              >
                                {item.name}
                              </div>
                              <div
                                style={{ fontSize: "0.75rem", color: "#6b7280" }}
                              >
                                {percentage}% of {meta.label.toLowerCase()} revenue
                              </div>
                            </div>
                            <div
                              style={{
                                fontSize: "0.875rem",
                                fontWeight: "600",
                                color: meta.color,
                              }}
                            >
                              {formatCurrency(item.revenue)}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div
                      style={{
                        textAlign: "center",
                        padding: "2rem",
                        color: "#6b7280",
                      }}
                    >
                      No {meta.label.toLowerCase()} sales data available
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="theme-park-analytics-grid">
          {CATEGORY_ORDER.map((key) => {
            const meta = CATEGORY_META[key];
            const categoryStats = aggregateStats[meta.statsKey];
            return (
              <div className="theme-park-analytics-card" key={`analytics-${key}`}>
                <div className="theme-park-analytics-title">
                  {meta.label} Profits
                </div>
                <div className="theme-park-analytics-item">
                  <span className="theme-park-analytics-label">Most Profitable:</span>
                  <span className="theme-park-analytics-value">
                    {categoryStats.mostProfitable.name || "N/A"}
                    {categoryStats.mostProfitable.revenue
                      ? ` (${formatCurrency(categoryStats.mostProfitable.revenue)})`
                      : ""}
                  </span>
                </div>
                <div className="theme-park-analytics-item">
                  <span className="theme-park-analytics-label">Least Profitable:</span>
                  <span className="theme-park-analytics-value">
                    {categoryStats.leastProfitable.name || "N/A"}
                    {categoryStats.leastProfitable.revenue !== Infinity
                      ? ` (${formatCurrency(categoryStats.leastProfitable.revenue)})`
                      : ""}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="theme-park-card">
          <div className="theme-park-card-header">
            <h3 className="theme-park-card-title">
              <span>🧭</span> Filter
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
          </div>

          <div className="theme-park-filter-row">
            {CATEGORY_ORDER.map((key) => {
              const meta = CATEGORY_META[key];
              const items = Array.from(availableItems[key] ?? []);
              const selections = selectedItems[key] ?? {};
              const dropdownDisabled = !filters.saleType[key];

              return (
                <div className="theme-park-filter-group" key={`filter-${key}`}>
                  <div className="theme-park-filter-main">
                    <label className="theme-park-filter-label">
                      <input
                        type="checkbox"
                        name={key}
                        checked={filters.saleType[key]}
                        onChange={handleFilterChange}
                      />
                      <span>{meta.filterLabel}</span>
                    </label>
                    <button
                      className={`theme-park-dropdown-toggle ${dropdownDisabled ? "disabled" : ""}`}
                      onClick={(event) => {
                        event.stopPropagation();
                        if (dropdownDisabled) {
                          return;
                        }
                        setOpenDropdown((current) =>
                          current === key ? null : key
                        );
                      }}
                    >
                      ▼
                    </button>
                  </div>
                  <div
                    className={`theme-park-dropdown-menu ${openDropdown === key ? "open" : ""}`}
                  >
                    <div className="theme-park-dropdown-header">
                      <button
                        className="theme-park-select-all"
                        onClick={() => toggleSelectAll(key)}
                      >
                        {items.length > 0 && items.every((item) => selections[item])
                          ? "Unselect All"
                          : "Select All"}
                      </button>
                    </div>
                    <div className="theme-park-dropdown-items">
                      {items.length > 0 ? (
                        items.map((item) => (
                          <label
                            key={`${key}-${item}`}
                            className="theme-park-filter-item"
                          >
                            <input
                              type="checkbox"
                              checked={Boolean(selections[item])}
                              onChange={() => toggleItemSelection(key, item)}
                            />
                            <span>{item}</span>
                          </label>
                        ))
                      ) : (
                        <div className="theme-park-dropdown-empty">
                          No items found
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="theme-park-card">
          <div className="theme-park-card-header">
            <h3 className="theme-park-card-title">
              <span>📋</span> Sales History
            </h3>
            <div className="theme-park-badge theme-park-badge-primary">
              {totalSalesCount} {totalSalesCount === 1 ? "Sale" : "Sales"}
            </div>
          </div>

          <div className="theme-park-table-container">
            <table className="theme-park-table">
              <thead>
                <tr>
                  <th
                    onClick={() => handleSort("type")}
                    className="sortable"
                  >
                    Type
                    {sortConfig.key === "type"
                      ? sortConfig.direction === "asc"
                        ? " ↑"
                        : " ↓"
                      : ""}
                  </th>
                  <th
                    onClick={() => handleSort("item")}
                    className="sortable"
                  >
                    Item
                    {sortConfig.key === "item"
                      ? sortConfig.direction === "asc"
                        ? " ↑"
                        : " ↓"
                      : ""}
                  </th>
                  <th
                    onClick={() => handleSort("customerName")}
                    className="sortable"
                  >
                    Customer
                    {sortConfig.key === "customerName"
                      ? sortConfig.direction === "asc"
                        ? " ↑"
                        : " ↓"
                      : ""}
                  </th>
                  <th
                    onClick={() => handleSort("amount")}
                    className="sortable"
                  >
                    Amount
                    {sortConfig.key === "amount"
                      ? sortConfig.direction === "asc"
                        ? " ↑"
                        : " ↓"
                      : ""}
                  </th>
                  <th
                    onClick={() => handleSort("paymentMethod")}
                    className="sortable"
                  >
                    Payment
                    {sortConfig.key === "paymentMethod"
                      ? sortConfig.direction === "asc"
                        ? " ↑"
                        : " ↓"
                      : ""}
                  </th>
                  <th
                    onClick={() => handleSort("date")}
                    className="sortable"
                  >
                    Date
                    {sortConfig.key === "date"
                      ? sortConfig.direction === "asc"
                        ? " ↑"
                        : " ↓"
                      : ""}
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedSales.map((sale) => {
                  const meta = CATEGORY_META[sale.category];
                  const key = sale.id ?? `${sale.category}-${sale.itemName}`;
                  const amount = Number.isFinite(sale.amount) ? sale.amount : 0;
                  const itemLabel =
                    sale.quantity && sale.quantity > 1
                      ? `${sale.itemName} ×${sale.quantity}`
                      : sale.itemName;

                  return (
                    <tr key={`sale-${key}`}>
                      <td>{meta?.label ?? sale.category}</td>
                      <td>{itemLabel}</td>
                      <td>{sale.customerName}</td>
                      <td className="theme-park-amount">{formatCurrency(amount)}</td>
                      <td>💳 {formatPaymentMethod(sale.paymentMethod)}</td>
                      <td>{formatDate(sale.date)}</td>
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