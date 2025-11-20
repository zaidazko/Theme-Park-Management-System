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

// Determine age demographic from a sale's customer DOB
const getDemographicLabel = (sale) => {
  const dobVal = sale.customerDOB || sale.customerDob || sale.dateOfBirth || sale.dob;
  if (!dobVal) return "Unknown";
  const bd = new Date(dobVal);
  if (Number.isNaN(bd.getTime())) return "Unknown";
  const age = Math.floor((Date.now() - bd.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
  if (age < 18) return "<18";
  if (age <= 20) return "18-20";
  if (age <= 30) return "21-30";
  if (age <= 40) return "31-40";
  if (age <= 50) return "41-50";
  return "51+";
};

const UnifiedSalesReport = () => {
  const [ticketSales, setTicketSales] = useState([]);
  const [commoditySales, setCommoditySales] = useState([]);
  const [menuSales, setMenuSales] = useState([]);
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    paymentMethod: "",
    minRevenue: 0,
    maxRevenue: Infinity,
    saleType: {
      tickets: true,
      commodities: true,
      menu: true,
    },
  });
  const [pendingFilters, setPendingFilters] = useState({
    startDate: "",
    endDate: "",
    paymentMethod: "",
    minRevenue: "",
    maxRevenue: "",
    saleType: {
      tickets: true,
      commodities: true,
      menu: true,
    },
  });
  const [filterError, setFilterError] = useState("");
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
  const [pendingSelectedItems, setPendingSelectedItems] = useState({
    tickets: {},
    commodities: {},
    menu: {},
  });
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [currentSalesPage, setCurrentSalesPage] = useState(1);
  const rowsPerPage = 10;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openDropdown, setOpenDropdown] = useState(null);
  const [historySearch, setHistorySearch] = useState("");

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

        // Fetch customers to try to enrich sales with DateOfBirth when sales
        // endpoints do not return DOB. We'll map by full name (first + last).
        let customersData = [];
        try {
          const customersResp = await fetch(`${baseUrl}/customers`);
          if (customersResp.ok) {
            customersData = await customersResp.json();
          }
        } catch (e) {
          // ignore - customers lookup is best-effort
          customersData = [];
        }

        const customerDobMap = (customersData || []).reduce((acc, c) => {
          const first = (c.firstName ?? c.FirstName ?? c.First_Name ?? "").toString();
          const last = (c.lastName ?? c.LastName ?? c.Last_Name ?? "").toString();
          const key = (first + " " + last).trim().toLowerCase();
          if (key) {
            acc[key] = (c.dateOfBirth ?? c.DateOfBirth ?? c.Date_Of_Birth) ?? null;
          }
          return acc;
        }, {});

        const normalizedTickets = (ticketData ?? []).map((sale) => ({
          id: sale.ticketId,
          category: "tickets",
          itemName: sale.ticketType ?? "Ticket",
          amount: Number(sale.price ?? 0),
          paymentMethod: (sale.paymentMethod ?? "Unknown").toString(),
          date: sale.purchaseDate,
          customerName: sale.customerName ?? "Unknown Customer",
          quantity: sale.quantity ?? 1,
          customerDOB:
            sale.customerDOB ??
            sale.customerDob ??
            sale.dob ??
            sale.dateOfBirth ??
            (sale.customerName ? customerDobMap[(sale.customerName || "").toString().toLowerCase().trim()] : null),
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
          customerDOB:
            sale.customerDOB ??
            sale.customerDob ??
            sale.dob ??
            sale.dateOfBirth ??
            (sale.customerName ? customerDobMap[(sale.customerName || "").toString().toLowerCase().trim()] : null),
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
          customerDOB:
            sale.customerDOB ??
            sale.customerDob ??
            sale.dob ??
            sale.dateOfBirth ??
            (sale.customerName ? customerDobMap[(sale.customerName || "").toString().toLowerCase().trim()] : null),
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

        const ticketSelections = buildSelectionMap(Array.from(ticketNames));
        const commoditySelections = buildSelectionMap(Array.from(commodityNames));
        const menuSelections = buildSelectionMap(Array.from(menuNames));

        setSelectedItems({
          tickets: ticketSelections,
          commodities: commoditySelections,
          menu: menuSelections,
        });
        setPendingSelectedItems({
          tickets: ticketSelections,
          commodities: commoditySelections,
          menu: menuSelections,
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
        setPendingSelectedItems({
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

    // Use unfiltered sales for breakdown (circle charts show all items, not filtered)
    const ticketBreakdown = buildBreakdown(ticketSales);
    const commodityBreakdown = buildBreakdown(commoditySales);
    const menuBreakdown = buildBreakdown(menuSales);

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
  }, [filteredTicketSales, filteredCommoditySales, filteredMenuSales, ticketSales, commoditySales, menuSales]);

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

  const visibleSales = useMemo(() => {
    const q = (historySearch || "").trim().toLowerCase();
    if (!q) return sortedSales;
    return sortedSales.filter((s) => {
      const typeLabel = (CATEGORY_META[s.category]?.label ?? s.category).toString().toLowerCase();
      const item = (s.itemName ?? "").toString().toLowerCase();
      const customer = (s.customerName ?? "").toString().toLowerCase();
      return (
        typeLabel.includes(q) ||
        item.includes(q) ||
        customer.includes(q)
      );
    });
  }, [sortedSales, historySearch]);

  const totalSalesPages = Math.max(1, Math.ceil(visibleSales.length / rowsPerPage));
  const currentSalesRows = visibleSales.slice((currentSalesPage * rowsPerPage) - rowsPerPage, currentSalesPage * rowsPerPage);

  const summaryData = useMemo(() => {
    const sales = allFilteredSales || [];
    const typeCounts = {};
    const itemCounts = {};
    const demCounts = {};
    const paymentCounts = {};
    let totalAmount = 0;
    const daySet = new Set();

    sales.forEach((s) => {
      const type = (CATEGORY_META[s.category]?.label ?? s.category) || "Unknown";
      const item = (s.itemName ?? "Unknown");
      const dem = getDemographicLabel(s) || "Unknown";
      const payment = formatPaymentMethod(s.paymentMethod) || "Unknown";

      typeCounts[type] = (typeCounts[type] || 0) + 1;
      itemCounts[item] = (itemCounts[item] || 0) + 1;
      demCounts[dem] = (demCounts[dem] || 0) + 1;
      paymentCounts[payment] = (paymentCounts[payment] || 0) + 1;

      const amt = Number.isFinite(s.amount) ? s.amount : 0;
      totalAmount += amt;

      if (s.date) {
        const d = new Date(s.date);
        if (!Number.isNaN(d.getTime())) {
          daySet.add(d.toISOString().slice(0, 10));
        }
      }
    });

    const findMaxEntry = (counts) => {
      let best = null;
      let bestCount = -1;
      Object.entries(counts).forEach(([k, v]) => {
        if (v > bestCount) {
          best = k;
          bestCount = v;
        }
      });
      return { key: best ?? "N/A", count: bestCount >= 0 ? bestCount : 0 };
    };

    const avgPerDay = daySet.size ? totalAmount / daySet.size : 0;

    const topType = findMaxEntry(typeCounts);
    const topItem = findMaxEntry(itemCounts);
    const topDem = findMaxEntry(demCounts);
    const topPayment = findMaxEntry(paymentCounts);

    return {
      mostCommonType: topType.key,
      mostCommonTypeCount: topType.count,
      mostCommonItem: topItem.key,
      mostCommonItemCount: topItem.count,
      mostCommonDemographic: topDem.key,
      mostCommonDemographicCount: topDem.count,
      mostCommonPayment: topPayment.key,
      mostCommonPaymentCount: topPayment.count,
      averageSpentPerDay: avgPerDay,
    };
  }, [allFilteredSales]);

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
    setFilterError("");

    if (type === "checkbox") {
      setPendingFilters((prev) => ({
        ...prev,
        saleType: {
          ...prev.saleType,
          [name]: checked,
        },
      }));
      return;
    }

    setPendingFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateAndApplyFilters = () => {
    setFilterError("");

    const minRevenueValue = pendingFilters.minRevenue === "" ? 0 : parseFloat(pendingFilters.minRevenue);
    const maxRevenueValue = pendingFilters.maxRevenue === "" ? Infinity : parseFloat(pendingFilters.maxRevenue);

    // Validation checks
    if (pendingFilters.minRevenue !== "" && isNaN(minRevenueValue)) {
      setFilterError("Min Revenue must be a valid number");
      return;
    }

    if (pendingFilters.maxRevenue !== "" && isNaN(maxRevenueValue)) {
      setFilterError("Max Revenue must be a valid number");
      return;
    }

    if (pendingFilters.minRevenue !== "" && !Number.isInteger(minRevenueValue * 100)) {
      setFilterError("Min Revenue cannot have more than 2 decimal places");
      return;
    }

    if (pendingFilters.maxRevenue !== "" && !Number.isInteger(maxRevenueValue * 100)) {
      setFilterError("Max Revenue cannot have more than 2 decimal places");
      return;
    }

    if (pendingFilters.minRevenue !== "" && minRevenueValue < 0) {
      setFilterError("Min Revenue cannot be negative");
      return;
    }

    if (pendingFilters.maxRevenue !== "" && maxRevenueValue < 0) {
      setFilterError("Max Revenue cannot be negative");
      return;
    }

    if (pendingFilters.minRevenue !== "" && pendingFilters.maxRevenue !== "" && minRevenueValue > maxRevenueValue) {
      setFilterError("Min Revenue cannot be greater than Max Revenue");
      return;
    }

    // Apply the filters and selected items
    setFilters({
      startDate: pendingFilters.startDate,
      endDate: pendingFilters.endDate,
      paymentMethod: pendingFilters.paymentMethod,
      minRevenue: minRevenueValue,
      maxRevenue: maxRevenueValue,
      saleType: pendingFilters.saleType,
    });

    setSelectedItems({
      tickets: pendingSelectedItems.tickets,
      commodities: pendingSelectedItems.commodities,
      menu: pendingSelectedItems.menu,
    });
  };

  const toggleSelectAll = (categoryKey) => {
    const items = Array.from(availableItems[categoryKey] ?? []);
    const selections = pendingSelectedItems[categoryKey] ?? {};
    const allSelected =
      items.length > 0 && items.every((item) => selections[item]);

    const nextSelection = Object.fromEntries(
      items.map((item) => [item, !allSelected])
    );

    setPendingSelectedItems((prev) => ({
      ...prev,
      [categoryKey]: nextSelection,
    }));
  };

  const toggleItemSelection = (categoryKey, itemName) => {
    setPendingSelectedItems((prev) => {
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

  

  return (
    <div className="theme-park-page">
      <div className="theme-park-container">
        <div className="theme-park-header">
          <h1 className="theme-park-title">Sales Report</h1>
          <p className="theme-park-subtitle">
            Comprehensive view of ticket, merchandise, and menu sales
          </p>
        </div>

                <div className="theme-park-card">
          <div className="theme-park-card-header">
            <h3 className="theme-park-card-title">
             Filter
            </h3>
          </div>
          <div className="theme-park-filter-row">
            <div className="theme-park-filter-item">
              <label>Start Date</label>
              <input
                type="date"
                name="startDate"
                value={pendingFilters.startDate}
                onChange={handleFilterChange}
              />
            </div>
            <div className="theme-park-filter-item">
              <label>End Date</label>
              <input
                type="date"
                name="endDate"
                value={pendingFilters.endDate}
                onChange={handleFilterChange}
              />
            </div>
            <div className="theme-park-filter-item">
              <label>Payment</label>
              <select
                name="paymentMethod"
                value={pendingFilters.paymentMethod}
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
            <div className="theme-park-filter-item">
              <label>Min Item Revenue</label>
              <input
                type="number"
                name="minRevenue"
                value={pendingFilters.minRevenue}
                onChange={handleFilterChange}
                min="0"
                step="0.01"
                placeholder="0"
              />
            </div>
            <div className="theme-park-filter-item">
              <label>Max Item Revenue</label>
              <input
                type="number"
                name="maxRevenue"
                value={pendingFilters.maxRevenue}
                onChange={handleFilterChange}
                min="0"
                step="0.01"
                placeholder="No limit"
              />
            </div>
          </div>

          <div className="theme-park-filter-row">
            {CATEGORY_ORDER.map((key) => {
              const meta = CATEGORY_META[key];
              const items = Array.from(availableItems[key] ?? []);
              const selections = pendingSelectedItems[key] ?? {};
              const dropdownDisabled = !pendingFilters.saleType[key];

              return (
                <div className="theme-park-filter-group" key={`filter-${key}`}>
                  <div className="theme-park-filter-main">
                    <label className="theme-park-filter-label">
                      <input
                        type="checkbox"
                        name={key}
                        checked={pendingFilters.saleType[key]}
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

          <div style={{ marginTop: "1rem", display: "flex", gap: "1rem" }}>
            <button
              onClick={validateAndApplyFilters}
              style={{
                padding: "0.625rem 1.5rem",
                backgroundColor: "#3b82f6",
                color: "white",
                border: "none",
                borderRadius: "6px",
                fontSize: "1rem",
                fontWeight: "600",
                cursor: "pointer",
                transition: "background-color 0.2s",
              }}
              onMouseEnter={(e) => (e.target.style.backgroundColor = "#2563eb")}
              onMouseLeave={(e) => (e.target.style.backgroundColor = "#3b82f6")}
            >
              Apply Filters
            </button>
            {filterError && (
              <div style={{ color: "#dc2626", fontSize: "0.875rem", display: "flex", alignItems: "center" }}>
                ⚠️ {filterError}
              </div>
            )}
          </div>
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

            // Prepare Doughnut chart data
            const chartData = {
              labels: breakdown.map((item) => item.name),
              datasets: [
                {
                  data: breakdown.map((item) => item.revenue),
                  backgroundColor: breakdown.map(
                    (_, i) =>
                      [
                        "#3b82f6",
                        "#2563eb",
                        "#60a5fa",
                        "#10b981",
                        "#fbbf24",
                        "#f59e42",
                        "#f472b6",
                        "#6366f1",
                        "#a21caf",
                        "#e11d48",
                      ][i % 10]
                  ),
                  borderColor: "#fff",
                  borderWidth: 2,
                },
              ],
            };

            const chartOptions = {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: "bottom",
                  align: "center",
                  labels: {
                    font: {
                      size: 11,
                    },
                    padding: 8,
                    boxWidth: 12,
                    boxHeight: 12,
                    usePointStyle: true,
                  },
                  maxWidth: 400,
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
            };

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
                <div style={{ padding: "1rem", display: "flex", flexDirection: "column", height: "100%" }}>
                  <div style={{ flex: 1, minHeight: 0, overflow: "auto" }}>
                    {breakdown.length > 0 ? (
                      <div style={{ height: "280px", position: "relative" }}>
                        <Doughnut data={chartData} options={chartOptions} />
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
          <div className="theme-park-card-header" style={{ alignItems: 'center', gap: '1rem' }}>
              <h3 className="theme-park-card-title">
                Sales History
              </h3>
              <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div className="history-search-wrapper">
                  <input
                    type="text"
                    className="history-search-input"
                    value={historySearch}
                    onChange={(e) => { setHistorySearch(e.target.value); setCurrentSalesPage(1); }}
                    placeholder="Search history (type, item, customer)"
                    aria-label="Search sales history"
                  />
                  {historySearch && (
                    <button
                      className="history-clear-btn"
                      onClick={() => { setHistorySearch(''); setCurrentSalesPage(1); }}
                      aria-label="Clear search"
                    >
                      ×
                    </button>
                  )}
                </div>
                <div className="theme-park-badge theme-park-badge-primary">
                  {visibleSales.length} {visibleSales.length === 1 ? "Sale" : "Sales"}
                </div>
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
                  <th>Price / Item</th>
                  <th>Age Demographic</th>
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
                {currentSalesRows.map((sale) => {
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
                          {(() => {
                            const qty = sale.quantity && sale.quantity > 0 ? sale.quantity : 1;
                            const pricePerItem = amount / qty;
                            const demographic = getDemographicLabel(sale);
                            return (
                              <>
                                <td>{formatCurrency(pricePerItem)}</td>
                                <td>{demographic}</td>
                              </>
                            );
                          })()}
                          <td>💳 {formatPaymentMethod(sale.paymentMethod)}</td>
                          <td>{formatDate(sale.date)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "1rem",
              borderTop: "1px solid #e5e7eb",
              fontSize: "0.875rem",
              color: "#6b7280",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <label>Page:</label>
              <input
                type="number"
                min="1"
                max={totalSalesPages}
                value={currentSalesPage}
                onChange={(e) => {
                  const page = Math.max(1, Math.min(totalSalesPages, parseInt(e.target.value) || 1));
                  setCurrentSalesPage(page);
                }}
                style={{
                  width: "50px",
                  padding: "0.4rem 0.5rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "4px",
                  fontSize: "0.875rem",
                }}
              />
              <span>of {totalSalesPages}</span>
            </div>
            <div style={{ color: "#6b7280" }}>
              {visibleSales.length} total sales
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              margin: "20px 0px 20px 0px",
              gap: "10px",
            }}
          >
            <button
              className="theme-park-btn theme-park-btn-primary theme-park-btn-sm"
              style={{ margin: "5px" }}
              onClick={() => setCurrentSalesPage((page) => Math.max(page - 1, 1))}
              disabled={currentSalesPage === 1}
            >
              Prev
            </button>

            <button
              className="theme-park-btn theme-park-btn-primary theme-park-btn-sm"
              style={{ margin: "5px" }}
              onClick={() => setCurrentSalesPage((page) => Math.min(page + 1, totalSalesPages))}
              disabled={currentSalesPage === totalSalesPages}
            >
              Next
            </button>
          </div>
          
          <div className="theme-park-card quick-highlights-card" style={{ marginTop: '1rem' }}>
            <div className="theme-park-card-header">
              <h3 className="theme-park-card-title">Sales Summary</h3>
            </div>
            <div className="quick-highlights-grid">
              <div className="quick-highlight-tile">
                <div className="quick-highlight-title">Most Common Type</div>
                <div className="quick-highlight-value">
                  <span>{summaryData.mostCommonType}</span>
                  <span className="quick-highlight-count">({summaryData.mostCommonTypeCount})</span>
                </div>
              </div>
              <div className="quick-highlight-tile">
                <div className="quick-highlight-title">Most Common Item</div>
                <div className="quick-highlight-value">
                  <span>{summaryData.mostCommonItem}</span>
                  <span className="quick-highlight-count">({summaryData.mostCommonItemCount})</span>
                </div>
              </div>
              <div className="quick-highlight-tile">
                <div className="quick-highlight-title">Most Common Demographic</div>
                <div className="quick-highlight-value">
                  <span>{summaryData.mostCommonDemographic}</span>
                  <span className="quick-highlight-count">({summaryData.mostCommonDemographicCount})</span>
                </div>
              </div>
              <div className="quick-highlight-tile">
                <div className="quick-highlight-title">Avg Spent / Day</div>
                <div className="quick-highlight-value">
                  <span>{allFilteredSales.length ? formatCurrency(summaryData.averageSpentPerDay) : 'N/A'}</span>
                </div>
              </div>
              <div className="quick-highlight-tile">
                <div className="quick-highlight-title">Most Common Payment</div>
                <div className="quick-highlight-value">
                  <span>{summaryData.mostCommonPayment}</span>
                  <span className="quick-highlight-count">({summaryData.mostCommonPaymentCount})</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnifiedSalesReport;