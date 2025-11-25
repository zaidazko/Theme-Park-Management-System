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
} from "chart.js/auto";
import { Line } from "react-chartjs-2";
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

const Ridership = () => {
    const [reviews, setReviews] = useState([]);
    const [rides, setRides] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [ticketSales, setTicketSales] = useState([]);
    const [filters, setFilters] = useState({
        startDate: "",
        endDate: "",
        ride: "",
    });

    const [statFilters, setStatFilters] = useState({
        minAverageRating: "",
        maxAverageRating: "",
        minTotalRidership: "",
        maxTotalRidership: "",
        minAverageRidership: "",
        maxAverageRidership: "",
        minCapacity: "",
        maxCapacity: ""
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
        fetchRidershipData();
    }, []);

    const fetchRidershipData = async () => {
        setLoading(true);
        try {
            const [ticketSaleResponse, ticketTypeResponse, discontinuedTicketTypeResponse] = await Promise.all([
                fetch(`${import.meta.env.VITE_API_URL}/ticket/sales`),
                fetch(`${import.meta.env.VITE_API_URL}/ticket/types`),
                fetch(`${import.meta.env.VITE_API_URL}/ticket/types/discontinued`)
            ]);

            if (!ticketSaleResponse.ok) throw new Error("Failed to fetch ticket sales");
            if (!ticketTypeResponse.ok) throw new Error("Failed to fetch ticket types");
            if (!discontinuedTicketTypeResponse.ok) throw new Error("Failed to fetch discontinued ticket types");

            const [ridesData, reviewsData, ticketSalesData, ticketTypesData, discontinuedTicketTypesData] = await Promise.all([
                ridesAPI.getAllRides(),
                ReviewsAPI.getAllReviews(),
                ticketSaleResponse.json(),
                ticketTypeResponse.json(),
                discontinuedTicketTypeResponse.json()
            ]);

            const salesWithRides = ticketSalesData.map((sale) => {
                let ticketType = ticketTypesData.find((t) => t.typeName === sale.ticketType);

                if (!ticketType) {
                    ticketType = discontinuedTicketTypesData.find((t) => t.typeName === sale.ticketType);
                };

                if (!ticketType) return sale

                const ride = ridesData.find((r) => r.ride_ID === ticketType.rideId)
                return {
                    ...sale,
                    rideName: ride.ride_Name,
                };
            });

            setRides(ridesData);
            setReviews(reviewsData);
            setTicketSales(salesWithRides);

            const uniqueRides = new Set();
            ticketTypesData?.forEach((ticket) => {
                if (ticket.rideName) {
                    uniqueRides.add(ticket.rideName);
                }
            });
            setAvailableRides(uniqueRides);

        } catch (error) {
            console.error("Error fetching data:", error);
            setError("Error fetching rides")
            setTimeout(() => setError(""), 3000);
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

            if (filters.ride) {
                const rideName = sale.rideName;
                if (!rideName || rideName !== filters.ride) return false;
            }

            return true;
        });
    };

    const filteredSales = filterSales()

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    const getDaysInFilterRange = (data) => {
        if (!filters.startDate || !filters.endDate) {
            const totalDates = new Set(data.map(item => new Date(item.purchaseDate).toDateString()));
            return totalDates.size;
        }
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

        return [...data].sort((a, b) => {
            let aValue = a[sortConfig.key];
            let bValue = b[sortConfig.key];

            if (sortConfig.key === "rideName") {
                aValue = a.rideName || "";
                bValue = b.rideName || "";
            }

            else if (sortConfig.key === "totalRidership") {
                aValue = a.totalRidership || 0;
                bValue = b.totalRidership || 0;
            }

            else if (sortConfig.key === "averageRidershipPerDay") {
                aValue = parseFloat(a.averageRidershipPerDay) || 0;
                bValue = parseFloat(b.averageRidershipPerDay) || 0;
            }

            else if (sortConfig.key === "averageRating") {
                aValue = a.averageRating === "N/A" ? 0 : parseFloat(a.averageRating);
                bValue = b.averageRating === "N/A" ? 0 : parseFloat(b.averageRating);
            }

            else if (sortConfig.key === "totalReviews") {
                aValue = a.totalReviews || 0;
                bValue = b.totalReviews || 0;
            }

            else if (sortConfig.key === "heightRequirement") {
                aValue = a.heightRequirement === "Any Height" ? 100 : parseInt(a.heightRequirement);
                bValue = b.heightRequirement === "Any Height" ? 100 : parseInt(b.heightRequirement);
            }

            else if (sortConfig.key == "capacity") {
                aValue = a.capacity || 0;
                bValue = b.capacity || 0;
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
                (sale) => sale.rideName === rideName
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

            const totalDays = getDaysInFilterRange(rideSales)
            const averageRidershipPerDay =
                totalDays > 0
                    ? (
                        totalRidership / totalDays
                    ).toFixed(1)
                    : 0;
            
            const capacity = ride.capacity
            const heightRequirement = ride.height_Requirement ?? "Any Height"

            rideStats[rideName] = {
                rideName,
                totalRidership,
                averageRidershipPerDay,
                averageRating,
                totalReviews,
                totalDays,
                heightRequirement,
                capacity
            };
        });

        return Object.values(rideStats);
    };

    const filterRideStats = (stats) => {
        return stats.filter((ride) => {
            if (statFilters.minAverageRating && (ride.averageRating === "N/A" || parseFloat(ride.averageRating) < parseFloat(statFilters.minAverageRating))) {
                return false;
            }

            if (statFilters.maxAverageRating && (ride.averageRating === "N/A" || parseFloat(ride.averageRating) > parseFloat(statFilters.maxAverageRating))) {
                return false;
            }

            if (statFilters.minTotalRidership && parseInt(ride.totalRidership) < parseInt(statFilters.minTotalRidership)) {
                return false;
            }

            if (statFilters.maxTotalRidership && parseInt(ride.totalRidership) > parseInt(statFilters.maxTotalRidership)) {
                return false;
            }

            if (statFilters.minAverageRidership && parseFloat(ride.averageRidershipPerDay) < parseFloat(statFilters.minAverageRidership)) {
                return false;
            }

            if (statFilters.maxAverageRidership && parseFloat(ride.averageRidershipPerDay) > parseFloat(statFilters.maxAverageRidership)) {
                return false;
            }

            if (statFilters.minCapacity && parseInt(ride.capacity) < parseInt(statFilters.minCapacity)){
                return false;
            }

            if (statFilters.maxCapacity && parseInt(ride.capacity) > parseInt(statFilters.maxCapacity)){
                return false;
            }

            return true;
        });
    };

    const handleStatFilterChange = (e) => {
        const { name, value } = e.target;
        setStatFilters((prev) => ({ ...prev, [name]: value }));
    };

    const rideStats = computeRideStats();
    const filteredRideStats = filterRideStats(rideStats)
    const sortedRideStats = getSortedData(filteredRideStats);
    const filterRidesByStats = () => {
        return filteredRideStats.map((ride) => ride.rideName);
    };

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
        rideName: sale.rideName,
        customerName: sale.customerName,
        date: sale.purchaseDate,
    }));

    const getSortedHistory = (data) => {
        if (!sortHistoryConfig) return data;

        return [...data].sort((a, b) => {
            let aValue = a[sortHistoryConfig.key];
            let bValue = b[sortHistoryConfig.key];

            if (sortHistoryConfig.key === "ticketId") {
                aValue = a.ticketId || 0;
                bValue = b.ticketId || 0;
            }

            else if (sortHistoryConfig.key === "rideName") {
                aValue = a.rideName || "";
                bValue = b.rideName || "";
            }

            else if (sortHistoryConfig.key === "customerName") {
                aValue = a.customerName || "";
                bValue = b.customerName || "";
            }

            else if (sortHistoryConfig.key === "date") {
                aValue = a.date ? new Date(a.date).getTime() : 0;
                bValue = b.date ? new Date(b.date).getTime() : 0;
            }

            if (aValue < bValue) return sortHistoryConfig.direction === "asc" ? -1 : 1;
            if (aValue > bValue) return sortHistoryConfig.direction === "asc" ? 1 : -1;
            return 0;
        })
    }

    const sortedHistory = getSortedHistory(ticketHistory);
    const filteredHistoryByStats = sortedHistory.filter((sale) => filterRidesByStats().includes(sale.rideName))

    const formatDateShort = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    const computeRidershipByDay = () => {
        const dailyData = {};
        const validRides = new Set(filterRidesByStats())

        filterSales().forEach((sale) => {
            if (!validRides.has(sale.rideName)) return;

            const date = sale.purchaseDate.split("T")[0];
            const ride = sale.rideName;
            const qty = sale.quantity || 1;

            if (!dailyData[date]) dailyData[date] = {};
            if (!dailyData[date][ride]) dailyData[date][ride] = 0;

            dailyData[date][ride] += qty;
        });

        return dailyData;
    }

    const buildLineChartData = () => {
        const dailyData = computeRidershipByDay();

        const dates = Object.keys(dailyData).sort();

        const rideNames = new Set();
        dates.forEach((d) => {
            Object.keys(dailyData[d]).forEach((r) => rideNames.add(r));
        });

        const datasets = Array.from(rideNames).map((ride) => ({
            label: ride,
            data: dates.map((d) => dailyData[d][ride] || 0),
            fill: false,
            tension: 0.3,
        }));

        return { dates, datasets };
    };

    const { dates, datasets } = buildLineChartData();

    const lineChartData = {
        labels: dates,
        datasets,
    };

    const lineChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: "top" },
            title: { display: true, text: "Daily Ridership" },
        },
        scales: {
            x: { title: { display: true, text: "Date" } },
            y: {
                title: { display: true, text: "Total Ridership" },
                beginAtZero: true,
                ticks: { stepSize: 1 },
            },
        },
    };

    const [currentHistoryPage, setCurrentHistoryPage] = useState(1);
    const rowsPerPage = 10;
    const currentHistoryRows = filteredHistoryByStats.slice((currentHistoryPage * rowsPerPage) - rowsPerPage, currentHistoryPage * rowsPerPage);
    const totalHistoryPages = Math.ceil(filteredHistoryByStats.length / rowsPerPage);

    const handleQuickDateFilter = (days) => {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - days);

        // Format dates as YYYY-MM-DD for input fields
        const formatDate = (date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const day = String(date.getDate()).padStart(2, "0");
            return `${year}-${month}-${day}`;
        };

        setFilters((prev) => ({
            ...prev,
            startDate: formatDate(startDate),
            endDate: formatDate(endDate),
        }));
    };

    const handleTodayFilter = () => {
        const today = new Date();

        // Format date as YYYY-MM-DD for input fields
        const formatDate = (date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const day = String(date.getDate()).padStart(2, "0");
            return `${year}-${month}-${day}`;
        };

        const todayFormatted = formatDate(today);
        setFilters((prev) => ({
            ...prev,
            startDate: todayFormatted,
            endDate: todayFormatted,
        }));
    };

    return (
        <div className="theme-park-page" style={{ padding: "40px 10px" }}>
            <div
                className="theme-park-container"
                style={{ maxWidth: "1800px", width: "100%" }}
            >
                <div className="theme-park-header">

                    <h1 className="theme-park-title">
                        {"Ridership Report"}
                    </h1>

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
                <div className="theme-park-page">
                    <div className="theme-park-loading">
                        <div className="theme-park-spinner"></div>
                        <div className="theme-park-loading-text">Loading ride data...</div>
                    </div>
                </div>
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

                                <div style={{ padding: "1.5rem", height: "400px", flex: 1 }}>
                                    <Line key={lineChartData.labels.join(",")} data={lineChartData} options={lineChartOptions} />
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
                                        filters.ride ||
                                        statFilters.minAverageRating ||
                                        statFilters.maxAverageRating ||
                                        statFilters.minTotalRidership ||
                                        statFilters.maxTotalRidership ||
                                        statFilters.minAverageRidership ||
                                        statFilters.maxAverageRidership) && (
                                            <button
                                                onClick={() => {
                                                    setFilters({
                                                        startDate: "",
                                                        endDate: "",
                                                        ride: "",
                                                    });
                                                    setStatFilters({
                                                        minAverageRating: "",
                                                        maxAverageRating: "",
                                                        minTotalRidership: "",
                                                        maxTotalRidership: "",
                                                        minAverageRidership: "",
                                                        maxAverageRidership: "",
                                                    })
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
                                        display: "flex",
                                        gap: "0.75rem",
                                        flexWrap: "wrap",
                                        padding: "1rem 0",
                                        borderBottom: "1px solid #e5e7eb",
                                        marginBottom: "1rem",
                                    }}
                                >
                                    <button
                                        onClick={handleTodayFilter}
                                        className="theme-park-btn theme-park-btn-sm"
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor = "#e5e7eb";
                                            e.currentTarget.style.borderColor = "#9ca3af";
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = "#f3f4f6";
                                            e.currentTarget.style.borderColor = "#d1d5db";
                                        }}
                                    >
                                        Today
                                    </button>
                                    <button
                                        onClick={() => handleQuickDateFilter(7)}
                                        className="theme-park-btn theme-park-btn-sm"
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor = "#e5e7eb";
                                            e.currentTarget.style.borderColor = "#9ca3af";
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = "#f3f4f6";
                                            e.currentTarget.style.borderColor = "#d1d5db";
                                        }}
                                    >
                                        Last 7 Days
                                    </button>
                                    <button
                                        onClick={() => handleQuickDateFilter(30)}
                                        className="theme-park-btn theme-park-btn-sm"
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor = "#e5e7eb";
                                            e.currentTarget.style.borderColor = "#9ca3af";
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = "#f3f4f6";
                                            e.currentTarget.style.borderColor = "#d1d5db";
                                        }}
                                    >
                                        Last 30 Days
                                    </button>
                                    <button
                                        onClick={() => handleQuickDateFilter(90)}
                                        className="theme-park-btn theme-park-btn-sm"
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor = "#e5e7eb";
                                            e.currentTarget.style.borderColor = "#9ca3af";
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = "#f3f4f6";
                                            e.currentTarget.style.borderColor = "#d1d5db";
                                        }}
                                    >
                                        Last 90 Days
                                    </button>
                                    <button
                                        onClick={() => handleQuickDateFilter(365)}
                                        className="theme-park-btn theme-park-btn-sm"
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor = "#e5e7eb";
                                            e.currentTarget.style.borderColor = "#9ca3af";
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = "#f3f4f6";
                                            e.currentTarget.style.borderColor = "#d1d5db";
                                        }}
                                    >
                                        Last Year
                                    </button>
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
                                            Min Total Ridership
                                        </label>
                                        <input
                                            type="number"
                                            placeholder="0"
                                            min="0"
                                            name="minTotalRidership"
                                            value={statFilters.minTotalRidership}
                                            onChange={handleStatFilterChange}
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
                                            Max Total Ridership
                                        </label>
                                        <input
                                            type="number"
                                            placeholder="No Limit"
                                            min="0"
                                            name="maxTotalRidership"
                                            value={statFilters.maxTotalRidership}
                                            onChange={handleStatFilterChange}
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
                                            Min Avg Rating
                                        </label>
                                        <input
                                            type="number"
                                            placeholder="0"
                                            min="0"
                                            max="5"
                                            name="minAverageRating"
                                            value={statFilters.minAverageRating}
                                            onChange={handleStatFilterChange}
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
                                            Max Avg Rating
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="5"
                                            placeholder="5"
                                            name="maxAverageRating"
                                            value={statFilters.maxAverageRating}
                                            onChange={handleStatFilterChange}
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
                                            Min Avg Ridership Per Day
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            placeholder="0"
                                            name="minAverageRidership"
                                            value={statFilters.minAverageRidership}
                                            onChange={handleStatFilterChange}
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
                                            Max Avg Ridership Per Day
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            placeholder="No Limit"
                                            name="maxAverageRidership"
                                            value={statFilters.maxAverageRidership}
                                            onChange={handleStatFilterChange}
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
                                            Min Capacity
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="50"
                                            placeholder="0"
                                            name="minCapacity"
                                            value={statFilters.minCapacity}
                                            onChange={handleStatFilterChange}
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
                                            Max Capacity
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="50"
                                            placeholder="50"
                                            name="maxCapacity"
                                            value={statFilters.maxCapacity}
                                            onChange={handleStatFilterChange}
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
                                </div>
                            </div>


                            <div className="theme-park-grid-3" style={{ display: "flex", justifyContent: "center" }}>
                                <div className="theme-park-card" style={{ width: "600px", height: "200px", marginRight: "40px" }}>
                                    <div className="theme-park-card-header">
                                        <h3>Total Ridership</h3>
                                    </div>
                                    <div style={{ fontSize: "30px", textAlign: "center", color: "#667eea" }}>
                                        <b>{(sortedRideStats.reduce((accumulator, ride) => accumulator + ride.totalRidership, 0))}</b> Total Riders
                                    </div>
                                </div>
                                <div className="theme-park-card" style={{ width: "600px" }}>
                                    <div className="theme-park-card-header">
                                        <h3>Total Average Ridership</h3>
                                    </div>
                                    <div style={{ fontSize: "30px", textAlign: "center", color: "#667eea" }}>
                                        <b>{(() => {
                                            const allDays = (sortedRideStats.reduce((acc, ride) => acc + ride.totalDays, 0))
                                            const allRidership = (sortedRideStats.reduce((acc, ride) => acc + ride.totalRidership, 0))
                                            return allDays > 0
                                                ? (allRidership / allDays).toFixed(2)
                                                : 0
                                        })()}
                                        </b> Average Riders Per Day
                                    </div>
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

                            {/*Ride Features Table*/}
                            <div className="theme-park-card">
                                <div className="theme-park-card-header">
                                    <h3 className="theme-park-card-title">
                                        Ride Features
                                    </h3>
                                </div>

                                <div
                                    className="theme-park-table-container"
                                    style={{ overflowX: "auto", overflowY: "auto", width: "100%" }}
                                >
                                    <table className="theme-park-table" style={{ tableLayout: "fixed", width: "100%" }}>
                                        <thead style={{ position: "sticky", top: "0", zIndex: "1" }}>
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
                                                    onClick={() => handleSort("capacity")}
                                                    className="sortable"
                                                >
                                                    Capacity
                                                    {sortConfig.key === "capacity" ?
                                                        sortConfig.direction === "asc"
                                                            ? " ↑"
                                                            : " ↓"
                                                        : ""}
                                                </th>

                                                <th
                                                    onClick={() => handleSort("heightRequirement")}
                                                    className="sortable"
                                                >
                                                    Height Requirement
                                                    {sortConfig.key === "heightRequirement" ?
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
                                                    <td colSpan="2" style={{ textAlign: "center", padding: "20px" }}>
                                                        No data available for the selected filters.
                                                    </td>
                                                </tr>
                                            ) : (
                                                sortedRideStats.map((stat) => (
                                                    <tr key={stat.rideName}>
                                                        <td>{stat.rideName}</td>
                                                        <td>{stat.capacity}</td>
                                                        <td>{isNaN(stat.heightRequirement) ? stat.heightRequirement : `${stat.heightRequirement}"`}</td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/*Ridership History Table*/}
                            <div className="theme-park-card">
                                <div className="theme-park-card-header">
                                    <h3 className="theme-park-card-title">
                                        Ridership History
                                    </h3>
                                </div>

                                <div
                                    className="theme-park-table-container"
                                    style={{ overflowX: "auto", overflowY: "auto", width: "100%" }}
                                >

                                    <table className="theme-park-table" style={{ tableLayout: "fixed", width: "100%" }}>

                                        <thead style={{ position: "sticky", top: "0", zIndex: "1" }}>
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
                                            {currentHistoryRows.length === 0 ? (
                                                <tr>
                                                    <td
                                                        colSpan="4"
                                                        style={{ textAlign: "center", padding: "40px" }}
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
                                                currentHistoryRows.map((rider) => (
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

                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        paddingTop: "1rem",
                                        borderTop: "1px solid #e5e7eb",
                                        fontSize: "0.875rem",
                                        color: "#6b7280",
                                    }}
                                >
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "5px"
                                        }}
                                    >
                                        <label>Page: </label>
                                        <input
                                            type="number"
                                            min="1"
                                            max={totalHistoryPages}
                                            value={currentHistoryPage}
                                            onChange={(e) => {
                                                const page = Math.max(1, Math.min(totalHistoryPages, parseInt(e.target.value) || 1));
                                                setCurrentHistoryPage(page);
                                            }}
                                            style={{
                                                width: "50px",
                                                padding: "0.4rem 0.5rem",
                                                border: "1px solid #d1d5db",
                                                borderRadius: "4px",
                                                fontSize: "0.875rem",
                                            }}
                                        />
                                        <span> of {totalHistoryPages}</span>
                                    </div>
                                    <div style={{ color: "#6b7280" }}>
                                        {filteredHistoryByStats.length} total history
                                    </div>
                                </div>

                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                    }}
                                >
                                    <button
                                        className="theme-park-btn theme-park-btn-primary theme-park-btn-sm"
                                        style={{ margin: "5px" }}
                                        onClick={() => setCurrentHistoryPage((page) => Math.max(page - 1, 1))}
                                        disabled={currentHistoryPage === 1}
                                    >
                                        Prev
                                    </button>
                                    <button
                                        className="theme-park-btn theme-park-btn-primary theme-park-btn-sm"
                                        style={{ margin: "5px" }}
                                        onClick={() => setCurrentHistoryPage((page) => Math.min(page + 1, totalHistoryPages))}
                                        disabled={currentHistoryPage === totalHistoryPages}
                                    >
                                        Next
                                    </button>
                                </div>

                            </div>
                        </>
                    )}
                </>
            )}
        </div>
    );
}

export default Ridership;
