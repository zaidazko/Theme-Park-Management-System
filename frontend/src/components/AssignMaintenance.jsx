import { useState, useEffect } from "react";
import { maintenanceRequestAPI, employeeAPI } from "../api";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";
import "./ThemePark.css";
import "./UnifiedSalesReport.css";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const AssignMaintenance = () => {
  const [maintenanceRequests, setMaintenanceRequests] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);
  const [selectedDescription, setSelectedDescription] = useState("");

  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    status: "",
    ride: "",
  });

  const [availableRides, setAvailableRides] = useState(new Set());

  // Stats state
  const [stats, setStats] = useState({
    totalCompleted: 0,
    totalInProgress: 0,
    totalCancelled: 0,
    totalCancelledAvgPerMonth: 0,
    incomingRequests: 0,
    breakdowns: {
      completed: {},
      inProgress: {},
      cancelled: {},
      incoming: {},
    },
  });

  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "asc",
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  // Filter helper
  const getFilteredRequests = () => {
    return (maintenanceRequests || []).filter((request) => {
      const rawDate = request.requestDate;
      if (!rawDate) return false;
      const requestDate = new Date(rawDate);

      // Date filters
      if (filters.startDate) {
        const start = new Date(filters.startDate);
        if (requestDate < start) return false;
      }
      if (filters.endDate) {
        const end = new Date(filters.endDate);
        end.setHours(23, 59, 59, 999);
        if (requestDate > end) return false;
      }

      // Status filter
      if (filters.status) {
        const requestStatus = (request.status || "").toLowerCase();
        if (requestStatus !== filters.status.toLowerCase()) return false;
      }

      // Ride filter
      if (filters.ride) {
        const rideName = request.ride?.ride_Name;
        if (!rideName || rideName !== filters.ride) return false;
      }

      return true;
    });
  };

  useEffect(() => {
    const filteredData = getFilteredRequests();
    calculateStats(filteredData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maintenanceRequests, filters]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [requestsData, employeesData] = await Promise.all([
        maintenanceRequestAPI.getAllMaintenanceRequests(),
        employeeAPI.getAllEmployees(),
      ]);

      setMaintenanceRequests(requestsData || []);

      // Filter employees to only show those in Maintenance department with Maintenance Worker role
      const maintenanceWorkers = employeesData.filter((employee) => {
        const departmentName =
          employee.department?.department_Name ||
          employee.department?.departmentName ||
          employee.department?.name ||
          employee.departmentName;

        const roleName =
          employee.role?.role_Name ||
          employee.role?.roleName ||
          employee.role?.name ||
          employee.roleName;

        return (
          departmentName?.toLowerCase() === "maintenance" &&
          roleName?.toLowerCase() === "maintenance worker"
        );
      });

      setEmployees(maintenanceWorkers);

      // Collect unique rides from maintenance requests
      const uniqueRides = new Set();
      requestsData?.forEach((request) => {
        if (request.ride?.ride_Name) {
          uniqueRides.add(request.ride.ride_Name);
        }
      });
      setAvailableRides(uniqueRides);

      setError(null);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(`Failed to load maintenance data: ${err.message}`);
      setMaintenanceRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleAssignRequest = async (requestId) => {
    if (!selectedEmployee) {
      alert("Please select an employee to assign this request to");
      return;
    }

    try {
      await maintenanceRequestAPI.assignMaintenanceRequest(
        requestId,
        parseInt(selectedEmployee)
      );

      // Reload data to get updated status
      await fetchAllData();
      setSelectedRequest(null);
      setSelectedEmployee("");
      alert("Maintenance request assigned successfully!");
    } catch (err) {
      console.error("Error assigning request:", err);
      alert("Failed to assign maintenance request. Please try again.");
    }
  };

  const handleCancelRequest = async (requestId) => {
    if (
      !window.confirm(
        "Are you sure you want to cancel this unassigned maintenance request? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      await maintenanceRequestAPI.cancelMaintenanceRequest(requestId);

      // Reload data to get updated status
      await fetchAllData();
      alert("Maintenance request cancelled successfully!");
    } catch (err) {
      console.error("Error cancelling request:", err);
      alert("Failed to cancel maintenance request. Please try again.");
    }
  };

  const calculateStats = (filteredRequests) => {
    // Count by status
    const completed = filteredRequests.filter(
      (req) => (req.status || "").toLowerCase() === "completed"
    );
    const inProgress = filteredRequests.filter(
      (req) => (req.status || "").toLowerCase() === "in progress"
    );
    const cancelled = filteredRequests.filter(
      (req) => (req.status || "").toLowerCase() === "cancelled"
    );
    const incoming = filteredRequests.filter((req) => {
      const status = (req.status || "").toLowerCase();
      return status === "open";
    });

    // Calculate average cancelled per month
    let cancelledAvgPerMonth = 0;
    if (cancelled.length > 0) {
      const cancelledDates = cancelled
        .map((req) => new Date(req.completionDate || req.requestDate))
        .filter((date) => !isNaN(date.getTime()));

      if (cancelledDates.length > 0) {
        const minDate = new Date(Math.min(...cancelledDates));
        const maxDate = new Date(Math.max(...cancelledDates));
        const months =
          (maxDate.getFullYear() - minDate.getFullYear()) * 12 +
          (maxDate.getMonth() - minDate.getMonth()) +
          1;
        cancelledAvgPerMonth = months > 0 ? cancelled.length / months : 0;
      }
    }

    // Calculate breakdowns by ride
    const breakdownByRide = (requests) => {
      return requests.reduce((acc, request) => {
        const rideName = request.ride?.ride_Name || "Unknown";
        acc[rideName] = (acc[rideName] || 0) + 1;
        return acc;
      }, {});
    };

    setStats({
      totalCompleted: completed.length,
      totalInProgress: inProgress.length,
      totalCancelled: cancelled.length,
      totalCancelledAvgPerMonth: cancelledAvgPerMonth,
      incomingRequests: incoming.length,
      breakdowns: {
        completed: breakdownByRide(completed),
        inProgress: breakdownByRide(inProgress),
        cancelled: breakdownByRide(cancelled),
        incoming: breakdownByRide(incoming),
      },
    });
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const getSortedData = (data) => {
    if (!sortConfig.key) return data;

    return [...data].sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      // Handle nested or computed values
      if (sortConfig.key === "ride") {
        aValue = a.ride?.ride_Name || "";
        bValue = b.ride?.ride_Name || "";
      } else if (sortConfig.key === "status") {
        aValue = (a.status || "").toLowerCase();
        bValue = (b.status || "").toLowerCase();
      } else if (sortConfig.key === "reporter") {
        aValue = `${a.reporter?.firstName || ""} ${
          a.reporter?.lastName || ""
        }`.trim();
        bValue = `${b.reporter?.firstName || ""} ${
          b.reporter?.lastName || ""
        }`.trim();
      } else if (sortConfig.key === "assignee") {
        aValue = a.assignee
          ? `${a.assignee.firstName || ""} ${a.assignee.lastName || ""}`.trim()
          : "";
        bValue = b.assignee
          ? `${b.assignee.firstName || ""} ${b.assignee.lastName || ""}`.trim()
          : "";
      } else if (sortConfig.key === "requestDate") {
        aValue = new Date(a.requestDate || 0).getTime();
        bValue = new Date(b.requestDate || 0).getTime();
      } else if (sortConfig.key === "completionDate") {
        aValue = a.completionDate ? new Date(a.completionDate).getTime() : 0;
        bValue = b.completionDate ? new Date(b.completionDate).getTime() : 0;
      }

      if (aValue < bValue) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    });
  };

  const getStatusColor = (status) => {
    switch ((status || "").toLowerCase()) {
      case "open":
        return "#fbbf24";
      case "assigned":
        return "#3b82f6";
      case "in progress":
        return "#8b5cf6";
      case "completed":
        return "#10b981";
      case "cancelled":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDateShort = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="theme-park-page">
        <div className="theme-park-loading">
          <div className="theme-park-spinner"></div>
          <div className="theme-park-loading-text">
            Loading maintenance data...
          </div>
        </div>
      </div>
    );
  }

  const filteredRequests = getSortedData(getFilteredRequests());

  return (
    <div className="theme-park-page" style={{ padding: "40px 10px" }}>
      <div
        className="theme-park-container"
        style={{ maxWidth: "1800px", width: "100%" }}
      >
        <div className="theme-park-header">
          <h1 className="theme-park-title">Maintenance Report</h1>
          <p className="theme-park-subtitle">
            Comprehensive view of all maintenance requests
          </p>
        </div>

        {error && (
          <div className="theme-park-alert theme-park-alert-error">
            <span className="theme-park-alert-icon">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Maintenance Statistics Bar Chart */}
        <div className="theme-park-card" style={{ marginTop: "1.5rem" }}>
          <div className="theme-park-card-header">
            <h3 className="theme-park-card-title">
              <span>📊</span> Maintenance Statistics
            </h3>
          </div>
          <div style={{ padding: "1.5rem", height: "400px" }}>
            <Bar
              data={{
                labels: ["Completed", "In Progress", "Cancelled", "Incoming"],
                datasets: [
                  {
                    label: "Number of Requests",
                    data: [
                      stats.totalCompleted,
                      stats.totalInProgress,
                      stats.totalCancelled,
                      stats.incomingRequests,
                    ],
                    backgroundColor: [
                      "rgba(5, 150, 105, 0.9)",
                      "rgba(124, 58, 237, 0.9)",
                      "rgba(220, 38, 38, 0.9)",
                      "rgba(217, 119, 6, 0.9)",
                    ],
                    borderColor: [
                      "rgba(4, 120, 87, 1)",
                      "rgba(109, 40, 217, 1)",
                      "rgba(185, 28, 28, 1)",
                      "rgba(180, 83, 9, 1)",
                    ],
                    borderWidth: 2,
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false,
                  },
                  title: {
                    display: false,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      stepSize: 1,
                    },
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Breakdown by Ride Charts */}
        {(stats.totalCompleted > 0 ||
          stats.totalInProgress > 0 ||
          stats.totalCancelled > 0 ||
          stats.incomingRequests > 0) && (
          <div className="theme-park-card" style={{ marginTop: "1.5rem" }}>
            <div className="theme-park-card-header">
              <h3 className="theme-park-card-title">
                <span>🎢</span> Breakdown by Ride
              </h3>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
                gap: "1.5rem",
                padding: "1.5rem",
              }}
            >
              {/* Completed Breakdown */}
              {stats.totalCompleted > 0 &&
                Object.keys(stats.breakdowns.completed).length > 0 && (
                  <div>
                    <h4
                      style={{
                        fontSize: "1rem",
                        fontWeight: "600",
                        marginBottom: "1rem",
                        color: "#10b981",
                        textAlign: "center",
                      }}
                    >
                      Completed ({stats.totalCompleted})
                    </h4>
                    <div style={{ height: "300px" }}>
                      <Doughnut
                        data={{
                          labels: Object.keys(stats.breakdowns.completed).sort(
                            (a, b) =>
                              stats.breakdowns.completed[b] -
                              stats.breakdowns.completed[a]
                          ),
                          datasets: [
                            {
                              data: Object.keys(stats.breakdowns.completed)
                                .sort(
                                  (a, b) =>
                                    stats.breakdowns.completed[b] -
                                    stats.breakdowns.completed[a]
                                )
                                .map(
                                  (ride) => stats.breakdowns.completed[ride]
                                ),
                              backgroundColor: [
                                "rgba(4, 120, 87, 0.9)",
                                "rgba(6, 95, 70, 0.9)",
                                "rgba(20, 83, 45, 0.9)",
                                "rgba(22, 101, 52, 0.9)",
                                "rgba(15, 118, 110, 0.9)",
                              ],
                              borderColor: [
                                "rgba(4, 120, 87, 1)",
                                "rgba(6, 95, 70, 1)",
                                "rgba(20, 83, 45, 1)",
                                "rgba(22, 101, 52, 1)",
                                "rgba(15, 118, 110, 1)",
                              ],
                              borderWidth: 2,
                            },
                          ],
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: "bottom",
                              labels: {
                                padding: 15,
                                font: {
                                  size: 12,
                                },
                              },
                            },
                          },
                        }}
                      />
                    </div>
                  </div>
                )}

              {/* In Progress Breakdown */}
              {stats.totalInProgress > 0 &&
                Object.keys(stats.breakdowns.inProgress).length > 0 && (
                  <div>
                    <h4
                      style={{
                        fontSize: "1rem",
                        fontWeight: "600",
                        marginBottom: "1rem",
                        color: "#8b5cf6",
                        textAlign: "center",
                      }}
                    >
                      In Progress ({stats.totalInProgress})
                    </h4>
                    <div style={{ height: "300px" }}>
                      <Doughnut
                        data={{
                          labels: Object.keys(stats.breakdowns.inProgress).sort(
                            (a, b) =>
                              stats.breakdowns.inProgress[b] -
                              stats.breakdowns.inProgress[a]
                          ),
                          datasets: [
                            {
                              data: Object.keys(stats.breakdowns.inProgress)
                                .sort(
                                  (a, b) =>
                                    stats.breakdowns.inProgress[b] -
                                    stats.breakdowns.inProgress[a]
                                )
                                .map(
                                  (ride) => stats.breakdowns.inProgress[ride]
                                ),
                              backgroundColor: [
                                "rgba(109, 40, 217, 0.9)",
                                "rgba(91, 33, 182, 0.9)",
                                "rgba(76, 29, 149, 0.9)",
                                "rgba(67, 56, 202, 0.9)",
                                "rgba(55, 48, 163, 0.9)",
                              ],
                              borderColor: [
                                "rgba(109, 40, 217, 1)",
                                "rgba(91, 33, 182, 1)",
                                "rgba(76, 29, 149, 1)",
                                "rgba(67, 56, 202, 1)",
                                "rgba(55, 48, 163, 1)",
                              ],
                              borderWidth: 2,
                            },
                          ],
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: "bottom",
                              labels: {
                                padding: 15,
                                font: {
                                  size: 12,
                                },
                              },
                            },
                          },
                        }}
                      />
                    </div>
                  </div>
                )}

              {/* Cancelled Breakdown */}
              {stats.totalCancelled > 0 &&
                Object.keys(stats.breakdowns.cancelled).length > 0 && (
                  <div>
                    <h4
                      style={{
                        fontSize: "1rem",
                        fontWeight: "600",
                        marginBottom: "1rem",
                        color: "#ef4444",
                        textAlign: "center",
                      }}
                    >
                      Cancelled ({stats.totalCancelled})
                    </h4>
                    <div style={{ height: "300px" }}>
                      <Doughnut
                        data={{
                          labels: Object.keys(stats.breakdowns.cancelled).sort(
                            (a, b) =>
                              stats.breakdowns.cancelled[b] -
                              stats.breakdowns.cancelled[a]
                          ),
                          datasets: [
                            {
                              data: Object.keys(stats.breakdowns.cancelled)
                                .sort(
                                  (a, b) =>
                                    stats.breakdowns.cancelled[b] -
                                    stats.breakdowns.cancelled[a]
                                )
                                .map(
                                  (ride) => stats.breakdowns.cancelled[ride]
                                ),
                              backgroundColor: [
                                "rgba(185, 28, 28, 0.9)",
                                "rgba(153, 27, 27, 0.9)",
                                "rgba(127, 29, 29, 0.9)",
                                "rgba(99, 23, 23, 0.9)",
                                "rgba(69, 10, 10, 0.9)",
                              ],
                              borderColor: [
                                "rgba(185, 28, 28, 1)",
                                "rgba(153, 27, 27, 1)",
                                "rgba(127, 29, 29, 1)",
                                "rgba(99, 23, 23, 1)",
                                "rgba(69, 10, 10, 1)",
                              ],
                              borderWidth: 2,
                            },
                          ],
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: "bottom",
                              labels: {
                                padding: 15,
                                font: {
                                  size: 12,
                                },
                              },
                            },
                          },
                        }}
                      />
                    </div>
                  </div>
                )}

              {/* Incoming Breakdown */}
              {stats.incomingRequests > 0 &&
                Object.keys(stats.breakdowns.incoming).length > 0 && (
                  <div>
                    <h4
                      style={{
                        fontSize: "1rem",
                        fontWeight: "600",
                        marginBottom: "1rem",
                        color: "#fbbf24",
                        textAlign: "center",
                      }}
                    >
                      Incoming ({stats.incomingRequests})
                    </h4>
                    <div style={{ height: "300px" }}>
                      <Doughnut
                        data={{
                          labels: Object.keys(stats.breakdowns.incoming).sort(
                            (a, b) =>
                              stats.breakdowns.incoming[b] -
                              stats.breakdowns.incoming[a]
                          ),
                          datasets: [
                            {
                              data: Object.keys(stats.breakdowns.incoming)
                                .sort(
                                  (a, b) =>
                                    stats.breakdowns.incoming[b] -
                                    stats.breakdowns.incoming[a]
                                )
                                .map((ride) => stats.breakdowns.incoming[ride]),
                              backgroundColor: [
                                "rgba(217, 119, 6, 0.9)",
                                "rgba(180, 83, 9, 0.9)",
                                "rgba(146, 64, 14, 0.9)",
                                "rgba(120, 53, 15, 0.9)",
                                "rgba(96, 40, 16, 0.9)",
                              ],
                              borderColor: [
                                "rgba(217, 119, 6, 1)",
                                "rgba(180, 83, 9, 1)",
                                "rgba(146, 64, 14, 1)",
                                "rgba(120, 53, 15, 1)",
                                "rgba(96, 40, 16, 1)",
                              ],
                              borderWidth: 2,
                            },
                          ],
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: "bottom",
                              labels: {
                                padding: 15,
                                font: {
                                  size: 12,
                                },
                              },
                            },
                          },
                        }}
                      />
                    </div>
                  </div>
                )}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="theme-park-card">
          <div className="theme-park-card-header">
            <h3 className="theme-park-card-title">
              <span>🔍</span> Filters
            </h3>
            {(filters.startDate ||
              filters.endDate ||
              filters.status ||
              filters.ride) && (
              <button
                onClick={() => {
                  setFilters({
                    startDate: "",
                    endDate: "",
                    status: "",
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
                Status
              </label>
              <select
                name="status"
                value={filters.status}
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
                <option value="">All Statuses</option>
                <option value="open">Open</option>
                <option value="in progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
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

        {/* Maintenance Requests Table */}
        <div className="theme-park-card" style={{ padding: "30px 15px" }}>
          <div className="theme-park-card-header">
            <h3 className="theme-park-card-title">
              <span>📋</span> Maintenance Requests
            </h3>
            <div className="theme-park-badge theme-park-badge-primary">
              {filteredRequests.length}{" "}
              {filteredRequests.length === 1 ? "Request" : "Requests"}
            </div>
          </div>

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
                  <th
                    onClick={() => handleSort("status")}
                    className="sortable"
                    style={{ width: "10%", minWidth: "100px" }}
                  >
                    Status{" "}
                    {sortConfig.key === "status" &&
                      (sortConfig.direction === "asc" ? "↑" : "↓")}
                  </th>
                  <th
                    onClick={() => handleSort("ride")}
                    className="sortable"
                    style={{ width: "12%", minWidth: "120px" }}
                  >
                    Ride{" "}
                    {sortConfig.key === "ride" &&
                      (sortConfig.direction === "asc" ? "↑" : "↓")}
                  </th>
                  <th
                    onClick={() => handleSort("issueDescription")}
                    className="sortable"
                    style={{ width: "15%", minWidth: "150px" }}
                  >
                    Issue Description{" "}
                    {sortConfig.key === "issueDescription" &&
                      (sortConfig.direction === "asc" ? "↑" : "↓")}
                  </th>
                  <th
                    onClick={() => handleSort("reporter")}
                    className="sortable"
                    style={{ width: "12%", minWidth: "120px" }}
                  >
                    Reported By{" "}
                    {sortConfig.key === "reporter" &&
                      (sortConfig.direction === "asc" ? "↑" : "↓")}
                  </th>
                  <th
                    onClick={() => handleSort("assignee")}
                    className="sortable"
                    style={{ width: "12%", minWidth: "120px" }}
                  >
                    Assigned To{" "}
                    {sortConfig.key === "assignee" &&
                      (sortConfig.direction === "asc" ? "↑" : "↓")}
                  </th>
                  <th
                    onClick={() => handleSort("requestDate")}
                    className="sortable"
                    style={{ width: "7%", minWidth: "80px" }}
                  >
                    Request Date{" "}
                    {sortConfig.key === "requestDate" &&
                      (sortConfig.direction === "asc" ? "↑" : "↓")}
                  </th>
                  <th
                    onClick={() => handleSort("completionDate")}
                    className="sortable"
                    style={{ width: "6%", minWidth: "70px" }}
                  >
                    Completion Date{" "}
                    {sortConfig.key === "completionDate" &&
                      (sortConfig.direction === "asc" ? "↑" : "↓")}
                  </th>
                  <th style={{ width: "8%", minWidth: "120px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.length === 0 ? (
                  <tr>
                    <td
                      colSpan="8"
                      style={{ textAlign: "center", padding: "40px" }}
                    >
                      <div className="theme-park-empty">
                        <div className="theme-park-empty-icon">🔧</div>
                        <div className="theme-park-empty-title">
                          No Maintenance Requests Found
                        </div>
                        <div className="theme-park-empty-text">
                          No maintenance requests match the current filters.
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredRequests.map((request) => (
                    <tr
                      key={request.requestId}
                      style={{
                        transition: "background-color 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#f9fafb";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "transparent";
                      }}
                    >
                      <td
                        style={{
                          padding: "12px 16px",
                          verticalAlign: "middle",
                        }}
                      >
                        <span
                          style={{
                            padding: "4px 10px",
                            borderRadius: "12px",
                            color: "white",
                            fontSize: "11px",
                            fontWeight: "600",
                            textTransform: "uppercase",
                            display: "inline-block",
                            backgroundColor: getStatusColor(request.status),
                            whiteSpace: "nowrap",
                          }}
                        >
                          {request.status || "Unknown"}
                        </span>
                      </td>
                      <td
                        style={{
                          padding: "12px 16px",
                          verticalAlign: "middle",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {request.ride?.ride_Name || "N/A"}
                      </td>
                      <td
                        style={{
                          padding: "12px 16px",
                          verticalAlign: "middle",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          cursor: "pointer",
                          color: "#374151",
                        }}
                        onClick={() => {
                          setSelectedDescription(
                            request.issueDescription || "No description"
                          );
                          setShowDescriptionModal(true);
                        }}
                        title="Click to view full description"
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = "#1f2937";
                          e.currentTarget.style.textDecoration = "underline";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = "#374151";
                          e.currentTarget.style.textDecoration = "none";
                        }}
                      >
                        {request.issueDescription || "No description"}
                      </td>
                      <td
                        style={{
                          padding: "12px 16px",
                          verticalAlign: "middle",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {request.reporter?.firstName}{" "}
                        {request.reporter?.lastName}
                      </td>
                      <td
                        style={{
                          padding: "12px 16px",
                          verticalAlign: "middle",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {request.assignee ? (
                          `${request.assignee.firstName} ${request.assignee.lastName}`
                        ) : (
                          <span
                            style={{ color: "#9ca3af", fontStyle: "italic" }}
                          >
                            Unassigned
                          </span>
                        )}
                      </td>
                      <td
                        style={{
                          padding: "12px 16px",
                          verticalAlign: "middle",
                          whiteSpace: "nowrap",
                          fontSize: "0.875rem",
                          color: "#374151",
                        }}
                        title={
                          request.requestDate
                            ? formatDate(request.requestDate)
                            : ""
                        }
                      >
                        {formatDateShort(request.requestDate)}
                      </td>
                      <td
                        style={{
                          padding: "12px 16px",
                          verticalAlign: "middle",
                          whiteSpace: "nowrap",
                          fontSize: "0.875rem",
                          color: "#374151",
                        }}
                        title={
                          request.completionDate
                            ? formatDate(request.completionDate)
                            : ""
                        }
                      >
                        {request.completionDate ? (
                          formatDateShort(request.completionDate)
                        ) : (
                          <span style={{ color: "#9ca3af" }}>N/A</span>
                        )}
                      </td>
                      <td
                        style={{
                          padding: "12px 16px",
                          verticalAlign: "middle",
                          whiteSpace: "nowrap",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            gap: "0.5rem",
                            justifyContent: "flex-start",
                          }}
                        >
                          <button
                            onClick={() => {
                              if (request.status?.toLowerCase() === "open") {
                                setSelectedRequest(request);
                              }
                            }}
                            style={{
                              backgroundColor:
                                request.status?.toLowerCase() === "open"
                                  ? "#3b82f6"
                                  : "#9ca3af",
                              color: "white",
                              border: "none",
                              padding: "6px 14px",
                              borderRadius: "6px",
                              cursor:
                                request.status?.toLowerCase() === "open"
                                  ? "pointer"
                                  : "not-allowed",
                              fontSize: "12px",
                              fontWeight: "500",
                              whiteSpace: "nowrap",
                              transition: "all 0.2s",
                              opacity:
                                request.status?.toLowerCase() === "open"
                                  ? 1
                                  : 0.6,
                            }}
                            onMouseEnter={(e) => {
                              if (request.status?.toLowerCase() === "open") {
                                e.currentTarget.style.backgroundColor =
                                  "#2563eb";
                                e.currentTarget.style.transform =
                                  "translateY(-1px)";
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (request.status?.toLowerCase() === "open") {
                                e.currentTarget.style.backgroundColor =
                                  "#3b82f6";
                                e.currentTarget.style.transform =
                                  "translateY(0)";
                              }
                            }}
                            disabled={request.status?.toLowerCase() !== "open"}
                          >
                            Assign
                          </button>
                          <button
                            onClick={() =>
                              handleCancelRequest(request.requestId)
                            }
                            style={{
                              backgroundColor:
                                request.status?.toLowerCase() === "open"
                                  ? "#ef4444"
                                  : "#9ca3af",
                              color: "white",
                              border: "none",
                              padding: "6px 14px",
                              borderRadius: "6px",
                              cursor:
                                request.status?.toLowerCase() === "open"
                                  ? "pointer"
                                  : "not-allowed",
                              fontSize: "12px",
                              fontWeight: "500",
                              whiteSpace: "nowrap",
                              transition: "all 0.2s",
                              opacity:
                                request.status?.toLowerCase() === "open"
                                  ? 1
                                  : 0.6,
                            }}
                            onMouseEnter={(e) => {
                              if (request.status?.toLowerCase() === "open") {
                                e.currentTarget.style.backgroundColor =
                                  "#dc2626";
                                e.currentTarget.style.transform =
                                  "translateY(-1px)";
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (request.status?.toLowerCase() === "open") {
                                e.currentTarget.style.backgroundColor =
                                  "#ef4444";
                                e.currentTarget.style.transform =
                                  "translateY(0)";
                              }
                            }}
                            disabled={request.status?.toLowerCase() !== "open"}
                          >
                            Cancel
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Description Modal */}
        {showDescriptionModal && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
            }}
            onClick={() => setShowDescriptionModal(false)}
          >
            <div
              style={{
                backgroundColor: "white",
                padding: "30px",
                borderRadius: "8px",
                maxWidth: "600px",
                width: "90%",
                maxHeight: "80vh",
                overflow: "auto",
                boxShadow: "0 20px 25px rgba(0, 0, 0, 0.15)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "20px",
                }}
              >
                <h3
                  style={{
                    fontSize: "20px",
                    fontWeight: "bold",
                    margin: 0,
                  }}
                >
                  Issue Description
                </h3>
                <button
                  onClick={() => setShowDescriptionModal(false)}
                  style={{
                    backgroundColor: "transparent",
                    border: "none",
                    fontSize: "24px",
                    cursor: "pointer",
                    color: "#6b7280",
                    padding: "0",
                    width: "30px",
                    height: "30px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  ×
                </button>
              </div>
              <div
                style={{
                  padding: "15px",
                  backgroundColor: "#f9fafb",
                  borderRadius: "6px",
                  border: "1px solid #e5e7eb",
                  whiteSpace: "pre-wrap",
                  wordWrap: "break-word",
                  lineHeight: "1.6",
                  color: "#374151",
                }}
              >
                {selectedDescription}
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  marginTop: "20px",
                }}
              >
                <button
                  onClick={() => setShowDescriptionModal(false)}
                  style={{
                    backgroundColor: "#6b7280",
                    color: "white",
                    border: "none",
                    padding: "10px 20px",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "16px",
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Assignment Modal */}
        {selectedRequest && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
            }}
          >
            <div
              style={{
                backgroundColor: "white",
                padding: "30px",
                borderRadius: "8px",
                maxWidth: "500px",
                width: "90%",
                maxHeight: "80vh",
                overflow: "auto",
              }}
            >
              <h3
                style={{
                  fontSize: "20px",
                  fontWeight: "bold",
                  marginBottom: "15px",
                }}
              >
                Assign Request #{selectedRequest.requestId}
              </h3>
              <p style={{ marginBottom: "20px", color: "#6b7280" }}>
                Select a maintenance worker to assign this maintenance request
                to:
              </p>

              {employees.length === 0 ? (
                <div
                  style={{
                    padding: "15px",
                    backgroundColor: "#fef3c7",
                    border: "1px solid #f59e0b",
                    borderRadius: "6px",
                    color: "#92400e",
                    fontSize: "14px",
                    marginBottom: "20px",
                    textAlign: "center",
                  }}
                >
                  No maintenance workers available. Please ensure there are
                  employees in the Maintenance department with the Maintenance
                  Worker role.
                </div>
              ) : (
                <select
                  value={selectedEmployee}
                  onChange={(e) => setSelectedEmployee(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    fontSize: "16px",
                    marginBottom: "20px",
                  }}
                >
                  <option value="">Select a maintenance worker...</option>
                  {employees.map((employee) => (
                    <option
                      key={employee.employeeId || employee.employee_ID}
                      value={employee.employeeId || employee.employee_ID}
                    >
                      {employee.firstName} {employee.lastName} (ID:{" "}
                      {employee.employeeId || employee.employee_ID})
                    </option>
                  ))}
                </select>
              )}

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  justifyContent: "flex-end",
                }}
              >
                <button
                  onClick={() => {
                    setSelectedRequest(null);
                    setSelectedEmployee("");
                  }}
                  style={{
                    backgroundColor: "#6b7280",
                    color: "white",
                    border: "none",
                    padding: "10px 20px",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "16px",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleAssignRequest(selectedRequest.requestId)}
                  style={{
                    backgroundColor:
                      employees.length === 0 ? "#9ca3af" : "#10b981",
                    color: "white",
                    border: "none",
                    padding: "10px 20px",
                    borderRadius: "6px",
                    cursor: employees.length === 0 ? "not-allowed" : "pointer",
                    fontSize: "16px",
                  }}
                  disabled={employees.length === 0}
                >
                  Assign Request
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignMaintenance;
