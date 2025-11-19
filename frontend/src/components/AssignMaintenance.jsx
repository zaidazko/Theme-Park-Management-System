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
  const [showWorkDetailsModal, setShowWorkDetailsModal] = useState(false);
  const [selectedWorkDetails, setSelectedWorkDetails] = useState("");
  const [selectedTimeTakenHours, setSelectedTimeTakenHours] = useState(null);

  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    status: "",
    ride: "",
  });

  const [workerFilters, setWorkerFilters] = useState({
    startDate: "",
    endDate: "",
    minCompleted: "",
    showOnlyActive: false,
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
    workers: {
      totalWorkers: 0,
      workerDetails: [],
    },
  });

  const [sortConfig, setSortConfig] = useState({
    key: "status",
    direction: "desc",
  });

  const [workerSortConfig, setWorkerSortConfig] = useState({
    key: null,
    direction: "asc",
  });

  const [selectedWorker, setSelectedWorker] = useState(null);
  const [showWorkerModal, setShowWorkerModal] = useState(false);
  const [workerRequestSortConfig, setWorkerRequestSortConfig] = useState({
    key: null,
    direction: "asc",
  });
  const [activeTab, setActiveTab] = useState("requests"); // "workers" or "requests"

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

      // Filter employees to include Maintenance department OR Role_ID 4 (Ride Operator)
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

        const roleId =
          employee.role?.roleId ||
          employee.role?.role_ID ||
          employee.roleId ||
          employee.Role_ID;

        const departmentNormalized = (departmentName || "")
          .toLowerCase()
          .trim();
        const roleNormalized = (roleName || "").toLowerCase().trim();

        const isMaintenanceDept =
          departmentNormalized === "maintenance" ||
          departmentNormalized.includes("maintenance");

        const isMaintenanceRole =
          roleNormalized.includes("maintenance") ||
          roleNormalized === "maintenance worker";

        const isRideOperatorRole =
          roleNormalized === "ride operator" || roleId === 4;

        // Eligible if in Maintenance dept OR explicitly a Ride Operator (Role_ID 4)
        return isMaintenanceDept || isMaintenanceRole || isRideOperatorRole;
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

  const handleWorkerFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setWorkerFilters((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

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

  const handleWorkerQuickDateFilter = (days) => {
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

    setWorkerFilters((prev) => ({
      ...prev,
      startDate: formatDate(startDate),
      endDate: formatDate(endDate),
    }));
  };

  const handleWorkerTodayFilter = () => {
    const today = new Date();
    
    // Format date as YYYY-MM-DD for input fields
    const formatDate = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    const todayFormatted = formatDate(today);
    setWorkerFilters((prev) => ({
      ...prev,
      startDate: todayFormatted,
      endDate: todayFormatted,
    }));
  };

  // Filter workers based on workerFilters
  const getFilteredWorkers = () => {
    if (!stats.workers || !stats.workers.workerDetails) {
      return [];
    }

    let filtered = [...stats.workers.workerDetails];

    // Filter by minimum completed count
    if (workerFilters.minCompleted) {
      const minCompleted = parseInt(workerFilters.minCompleted, 10);
      if (!isNaN(minCompleted)) {
        filtered = filtered.filter((worker) => worker.completed >= minCompleted);
      }
    }

    // Filter by date range (based on last completed date)
    if (workerFilters.startDate || workerFilters.endDate) {
      filtered = filtered.filter((worker) => {
        if (!worker.lastCompletedDate) {
          // If no completion date and we have a start date filter, exclude
          return !workerFilters.startDate;
        }

        const lastCompleted = new Date(worker.lastCompletedDate);
        lastCompleted.setHours(0, 0, 0, 0);

        if (workerFilters.startDate) {
          const start = new Date(workerFilters.startDate);
          start.setHours(0, 0, 0, 0);
          if (lastCompleted < start) return false;
        }

        if (workerFilters.endDate) {
          const end = new Date(workerFilters.endDate);
          end.setHours(23, 59, 59, 999);
          if (lastCompleted > end) return false;
        }

        return true;
      });
    }

    // Filter by active workers (those with in-progress tasks)
    if (workerFilters.showOnlyActive) {
      filtered = filtered.filter((worker) => worker.inProgress > 0);
    }

    return filtered;
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

    // Calculate worker statistics with detailed information
    const workerStats = {};
    filteredRequests.forEach((request) => {
      if (request.assignee) {
        const workerId =
          request.assignee.employeeId || request.assignee.employee_ID;
        const workerName = `${request.assignee.firstName || ""} ${
          request.assignee.lastName || ""
        }`.trim();

        if (!workerStats[workerId]) {
          workerStats[workerId] = {
            name: workerName,
            employeeId: workerId,
            completed: 0,
            inProgress: 0,
            cancelled: 0,
            total: 0,
            lastCompletedDate: null,
          };
        }

        const status = (request.status || "").toLowerCase();
        if (status === "completed") {
          workerStats[workerId].completed++;
          if (request.completionDate) {
            const completionDate = new Date(request.completionDate);
            if (
              !workerStats[workerId].lastCompletedDate ||
              completionDate > new Date(workerStats[workerId].lastCompletedDate)
            ) {
              workerStats[workerId].lastCompletedDate = request.completionDate;
            }
          }
        } else if (status === "in progress") {
          workerStats[workerId].inProgress++;
        } else if (status === "cancelled") {
          workerStats[workerId].cancelled++;
        }
        workerStats[workerId].total++;
      }
    });

    // Convert workerStats to array and sort by total completed
    const workerDetails = Object.values(workerStats).sort(
      (a, b) => b.completed - a.completed
    );

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
      workers: {
        totalWorkers: employees.length,
        workerDetails: workerDetails,
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
        // Priority order: Open > In Progress > Assigned > Completed > Cancelled
        // Lower number = higher priority (should appear first)
        const statusPriority = {
          open: 1,
          "in progress": 2,
          assigned: 3,
          completed: 4,
          cancelled: 5,
        };
        const aStatus = (a.status || "").toLowerCase();
        const bStatus = (b.status || "").toLowerCase();
        aValue = statusPriority[aStatus] || 99;
        bValue = statusPriority[bStatus] || 99;
        // For status priority, "desc" means show higher priority (lower numbers) first
        // So we use ascending order of priority values when direction is "desc"
        if (sortConfig.direction === "desc") {
          // Ascending order of priority values (1 before 2)
          if (aValue < bValue) return -1;
          if (aValue > bValue) return 1;
          return 0;
        } else {
          // Ascending direction: reverse the priority order
          if (aValue < bValue) return 1;
          if (aValue > bValue) return -1;
          return 0;
        }
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

  // Helper function to format time taken (converts minutes to hours if >= 60)
  const formatTimeTaken = (minutes) => {
    if (minutes === null || minutes === undefined) {
      return "N/A";
    }

    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      if (remainingMinutes === 0) {
        return `${hours} hour${hours !== 1 ? "s" : ""}`;
      } else {
        return `${hours} hour${
          hours !== 1 ? "s" : ""
        } ${remainingMinutes} minute${remainingMinutes !== 1 ? "s" : ""}`;
      }
    } else {
      return `${minutes} minute${minutes !== 1 ? "s" : ""}`;
    }
  };

  // Helper function to extract work details and time taken from maintenance request
  const getWorkDetailsAndTimeFromRequest = async (request) => {
    // Handle different possible field name formats (camelCase, PascalCase, snake_case)
    const maintenanceLogs =
      request.maintenanceLogs ||
      request.MaintenanceLogs ||
      request.maintenance_logs ||
      request.maintenanceLogsCollection ||
      [];

    // If logs are included in the request, use them
    if (maintenanceLogs && maintenanceLogs.length > 0) {
      // Find the log that matches this request ID
      const requestId =
        request.requestId ||
        request.RequestId ||
        request.request_ID ||
        request.Request_ID;

      const matchingLog =
        maintenanceLogs.find((log) => {
          const logRequestId =
            log.requestId || log.RequestId || log.request_ID || log.Request_ID;
          return logRequestId === requestId;
        }) || maintenanceLogs[0]; // Fallback to first log if no match found

      // Extract work details handling different field name formats
      const workDetails =
        matchingLog?.workDetails ||
        matchingLog?.WorkDetails ||
        matchingLog?.work_Details ||
        matchingLog?.Work_Details ||
        "";

      // Extract time taken hours handling different field name formats
      const timeTakenHours =
        matchingLog?.timeTakenHours ||
        matchingLog?.TimeTakenHours ||
        matchingLog?.time_Taken_Hours ||
        matchingLog?.Time_Taken_Hours ||
        null;

      // Return work details and time taken if work details exist
      if (workDetails && workDetails.trim() !== "") {
        return { workDetails, timeTakenHours };
      }
      // If no work details but we have a log, still extract time taken for potential use
      // (though we'll still need to fetch from API to be sure we have the most recent log)
    }

    // If no logs in request or no work details found, fetch from API
    try {
      const requestId =
        request.requestId ||
        request.RequestId ||
        request.request_ID ||
        request.Request_ID;

      if (!requestId) {
        console.log("No request ID found");
        return {
          workDetails: "No work details available",
          timeTakenHours: null,
        };
      }

      console.log("Fetching logs for request ID:", requestId);
      const logs = await maintenanceRequestAPI.getMaintenanceLogsByRequestId(
        requestId
      );

      console.log("Received logs from API:", logs);

      if (logs && Array.isArray(logs) && logs.length > 0) {
        // Get the most recent log (they're ordered by DatePerformed descending)
        const mostRecentLog = logs[0];
        console.log("Most recent log:", mostRecentLog);

        const workDetails =
          mostRecentLog.workDetails ||
          mostRecentLog.WorkDetails ||
          mostRecentLog.work_Details ||
          mostRecentLog.Work_Details ||
          "";

        // Extract time taken hours handling different field name formats
        const timeTakenHours =
          mostRecentLog.timeTakenHours ||
          mostRecentLog.TimeTakenHours ||
          mostRecentLog.time_Taken_Hours ||
          mostRecentLog.Time_Taken_Hours ||
          null;

        console.log("Extracted work details:", workDetails);
        console.log("Extracted time taken hours:", timeTakenHours);

        // Return work details (even if empty) and time taken hours
        // If work details are empty, we'll show "No work details available"
        return {
          workDetails:
            workDetails && workDetails.trim() !== ""
              ? workDetails
              : "No work details available",
          timeTakenHours,
        };
      } else {
        console.log("No logs found or empty array");
      }
    } catch (error) {
      console.error("Error fetching maintenance logs:", error);
      console.error("Error response:", error.response);
      console.error("Error URL:", error.config?.url);

      // If it's a 404, that's okay - just means no logs exist or route doesn't exist
      if (error.response && error.response.status === 404) {
        console.log("404 error - route might not exist or no logs found");
        return {
          workDetails: "No work details available",
          timeTakenHours: null,
        };
      }
    }

    return { workDetails: "No work details available", timeTakenHours: null };
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

  // Get worker's maintenance requests (in progress and completed)
  const getWorkerRequests = (workerId) => {
    if (!workerId) return [];
    return maintenanceRequests.filter((request) => {
      const assigneeId =
        request.assignee?.employeeId || request.assignee?.employee_ID;
      const status = (request.status || "").toLowerCase();
      return (
        assigneeId === workerId &&
        (status === "in progress" || status === "completed")
      );
    });
  };

  // Sort worker requests
  const getSortedWorkerRequests = (requests) => {
    if (!workerRequestSortConfig.key) return requests;

    return [...requests].sort((a, b) => {
      let aValue, bValue;

      if (workerRequestSortConfig.key === "ride") {
        aValue = a.ride?.ride_Name || "";
        bValue = b.ride?.ride_Name || "";
      } else if (workerRequestSortConfig.key === "status") {
        aValue = (a.status || "").toLowerCase();
        bValue = (b.status || "").toLowerCase();
      } else if (workerRequestSortConfig.key === "requestDate") {
        aValue = new Date(a.requestDate || 0).getTime();
        bValue = new Date(b.requestDate || 0).getTime();
      } else if (workerRequestSortConfig.key === "completionDate") {
        aValue = a.completionDate ? new Date(a.completionDate).getTime() : 0;
        bValue = b.completionDate ? new Date(b.completionDate).getTime() : 0;
      } else if (workerRequestSortConfig.key === "issueDescription") {
        aValue = (a.issueDescription || "").toLowerCase();
        bValue = (b.issueDescription || "").toLowerCase();
      }

      if (aValue < bValue) {
        return workerRequestSortConfig.direction === "asc" ? -1 : 1;
      }
      if (aValue > bValue) {
        return workerRequestSortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    });
  };

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

        {/* Reports Section with Tabs */}
        <div style={{ marginTop: "2rem" }}>
          <div style={{ marginBottom: "1.5rem" }}>
            <h2
              style={{
                fontSize: "1.5rem",
                fontWeight: "600",
                color: "#1f2937",
                marginBottom: "0.5rem",
              }}
            >
              📊 Maintenance Reports
            </h2>
            <p
              style={{
                color: "#6b7280",
                fontSize: "0.875rem",
                margin: 0,
                marginBottom: "1.5rem",
              }}
            >
              View maintenance worker performance and track all maintenance requests
            </p>

            {/* Tab Navigation */}
            <div
              style={{
                display: "flex",
                gap: "0.5rem",
                borderBottom: "2px solid #e5e7eb",
                marginBottom: "1.5rem",
              }}
            >
              <button
                onClick={() => setActiveTab("requests")}
                style={{
                  padding: "12px 24px",
                  fontSize: "0.875rem",
                  fontWeight: "600",
                  color: activeTab === "requests" ? "#3b82f6" : "#6b7280",
                  backgroundColor: "transparent",
                  border: "none",
                  borderBottom: activeTab === "requests" ? "3px solid #3b82f6" : "3px solid transparent",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  marginBottom: "-2px",
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== "requests") {
                    e.currentTarget.style.color = "#374151";
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== "requests") {
                    e.currentTarget.style.color = "#6b7280";
                  }
                }}
              >
                📋 Requests Report
              </button>
              <button
                onClick={() => setActiveTab("workers")}
                style={{
                  padding: "12px 24px",
                  fontSize: "0.875rem",
                  fontWeight: "600",
                  color: activeTab === "workers" ? "#3b82f6" : "#6b7280",
                  backgroundColor: "transparent",
                  border: "none",
                  borderBottom: activeTab === "workers" ? "3px solid #3b82f6" : "3px solid transparent",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  marginBottom: "-2px",
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== "workers") {
                    e.currentTarget.style.color = "#374151";
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== "workers") {
                    e.currentTarget.style.color = "#6b7280";
                  }
                }}
              >
                👷 Workers Report
              </button>
            </div>
          </div>

          {/* Workers Tab Content */}
          {activeTab === "workers" && (
            <div>
              {/* Worker Filters */}
              <div className="theme-park-card" style={{ marginBottom: "1.5rem" }}>
                <div className="theme-park-card-header">
                  <h3 className="theme-park-card-title">
                    <span>🔍</span> Filters
                  </h3>
                  {(workerFilters.startDate ||
                    workerFilters.endDate ||
                    workerFilters.minCompleted ||
                    workerFilters.showOnlyActive) && (
                    <button
                      onClick={() => {
                        setWorkerFilters({
                          startDate: "",
                          endDate: "",
                          minCompleted: "",
                          showOnlyActive: false,
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

                {/* Quick Date Filter Buttons */}
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
                    onClick={handleWorkerTodayFilter}
                    style={{
                      backgroundColor: "#f3f4f6",
                      color: "#374151",
                      border: "1px solid #d1d5db",
                      padding: "8px 16px",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontSize: "14px",
                      fontWeight: "500",
                      transition: "all 0.2s",
                    }}
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
                    onClick={() => handleWorkerQuickDateFilter(7)}
                    style={{
                      backgroundColor: "#f3f4f6",
                      color: "#374151",
                      border: "1px solid #d1d5db",
                      padding: "8px 16px",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontSize: "14px",
                      fontWeight: "500",
                      transition: "all 0.2s",
                    }}
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
                    onClick={() => handleWorkerQuickDateFilter(30)}
                    style={{
                      backgroundColor: "#f3f4f6",
                      color: "#374151",
                      border: "1px solid #d1d5db",
                      padding: "8px 16px",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontSize: "14px",
                      fontWeight: "500",
                      transition: "all 0.2s",
                    }}
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
                    onClick={() => handleWorkerQuickDateFilter(90)}
                    style={{
                      backgroundColor: "#f3f4f6",
                      color: "#374151",
                      border: "1px solid #d1d5db",
                      padding: "8px 16px",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontSize: "14px",
                      fontWeight: "500",
                      transition: "all 0.2s",
                    }}
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
                    onClick={() => handleWorkerQuickDateFilter(365)}
                    style={{
                      backgroundColor: "#f3f4f6",
                      color: "#374151",
                      border: "1px solid #d1d5db",
                      padding: "8px 16px",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontSize: "14px",
                      fontWeight: "500",
                      transition: "all 0.2s",
                    }}
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
                      Start Date (Last Completed)
                    </label>
                    <input
                      type="date"
                      name="startDate"
                      value={workerFilters.startDate}
                      onChange={handleWorkerFilterChange}
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
                      End Date (Last Completed)
                    </label>
                    <input
                      type="date"
                      name="endDate"
                      value={workerFilters.endDate}
                      onChange={handleWorkerFilterChange}
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
                      Minimum Completed
                    </label>
                    <input
                      type="number"
                      name="minCompleted"
                      value={workerFilters.minCompleted}
                      onChange={handleWorkerFilterChange}
                      min="0"
                      placeholder="Any"
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
                      justifyContent: "flex-end",
                    }}
                  >
                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        cursor: "pointer",
                        fontSize: "0.875rem",
                        fontWeight: "600",
                        color: "#374151",
                      }}
                    >
                      <input
                        type="checkbox"
                        name="showOnlyActive"
                        checked={workerFilters.showOnlyActive}
                        onChange={handleWorkerFilterChange}
                        style={{
                          width: "18px",
                          height: "18px",
                          cursor: "pointer",
                        }}
                      />
                      Show Only Active Workers
                      <span
                        style={{
                          fontSize: "0.75rem",
                          color: "#6b7280",
                          fontWeight: "400",
                        }}
                      >
                        (with in-progress tasks)
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {stats.workers &&
              stats.workers.workerDetails &&
              stats.workers.workerDetails.length > 0 ? (
            <div className="theme-park-card">
              <div className="theme-park-card-header">
                <h3 className="theme-park-card-title">
                  <span>📊</span> Worker Performance
                </h3>
                <div className="theme-park-badge theme-park-badge-info">
                  {getFilteredWorkers().length}{" "}
                  {getFilteredWorkers().length === 1
                    ? "Worker"
                    : "Workers"}
                  {getFilteredWorkers().length !== stats.workers.workerDetails.length && 
                    ` (of ${stats.workers.workerDetails.length} total)`}
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
                        style={{
                          width: "30%",
                          minWidth: "200px",
                          textAlign: "left",
                          padding: "12px 16px",
                          backgroundColor: "#f9fafb",
                          borderBottom: "2px solid #e5e7eb",
                          fontWeight: "600",
                          fontSize: "0.875rem",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                          color: "#374151",
                        }}
                      >
                        Worker Name
                      </th>
                      <th
                        onClick={() => {
                          const direction =
                            workerSortConfig.key === "completed" &&
                            workerSortConfig.direction === "asc"
                              ? "desc"
                              : "asc";
                          setWorkerSortConfig({ key: "completed", direction });
                        }}
                        className="sortable"
                        style={{
                          width: "18%",
                          minWidth: "120px",
                          textAlign: "center",
                          padding: "12px 16px",
                          backgroundColor: "#f9fafb",
                          borderBottom: "2px solid #e5e7eb",
                          fontWeight: "600",
                          fontSize: "0.875rem",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                          color: "#374151",
                          cursor: "pointer",
                          userSelect: "none",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "#f3f4f6";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "#f9fafb";
                        }}
                      >
                        Completed{" "}
                        {workerSortConfig.key === "completed" &&
                          (workerSortConfig.direction === "asc" ? "↑" : "↓")}
                      </th>
                      <th
                        onClick={() => {
                          const direction =
                            workerSortConfig.key === "inProgress" &&
                            workerSortConfig.direction === "asc"
                              ? "desc"
                              : "asc";
                          setWorkerSortConfig({ key: "inProgress", direction });
                        }}
                        className="sortable"
                        style={{
                          width: "18%",
                          minWidth: "120px",
                          textAlign: "center",
                          padding: "12px 16px",
                          backgroundColor: "#f9fafb",
                          borderBottom: "2px solid #e5e7eb",
                          fontWeight: "600",
                          fontSize: "0.875rem",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                          color: "#374151",
                          cursor: "pointer",
                          userSelect: "none",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "#f3f4f6";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "#f9fafb";
                        }}
                      >
                        In Progress{" "}
                        {workerSortConfig.key === "inProgress" &&
                          (workerSortConfig.direction === "asc" ? "↑" : "↓")}
                      </th>
                      <th
                        onClick={() => {
                          const direction =
                            workerSortConfig.key === "total" &&
                            workerSortConfig.direction === "asc"
                              ? "desc"
                              : "asc";
                          setWorkerSortConfig({ key: "total", direction });
                        }}
                        className="sortable"
                        style={{
                          width: "12%",
                          minWidth: "100px",
                          textAlign: "center",
                          padding: "12px 16px",
                          backgroundColor: "#f9fafb",
                          borderBottom: "2px solid #e5e7eb",
                          fontWeight: "600",
                          fontSize: "0.875rem",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                          color: "#374151",
                          cursor: "pointer",
                          userSelect: "none",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "#f3f4f6";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "#f9fafb";
                        }}
                      >
                        Total{" "}
                        {workerSortConfig.key === "total" &&
                          (workerSortConfig.direction === "asc" ? "↑" : "↓")}
                      </th>
                      <th
                        onClick={() => {
                          const direction =
                            workerSortConfig.key === "lastCompleted" &&
                            workerSortConfig.direction === "asc"
                              ? "desc"
                              : "asc";
                          setWorkerSortConfig({
                            key: "lastCompleted",
                            direction,
                          });
                        }}
                        className="sortable"
                        style={{
                          width: "22%",
                          minWidth: "180px",
                          textAlign: "left",
                          padding: "12px 16px",
                          backgroundColor: "#f9fafb",
                          borderBottom: "2px solid #e5e7eb",
                          fontWeight: "600",
                          fontSize: "0.875rem",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                          color: "#374151",
                          cursor: "pointer",
                          userSelect: "none",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "#f3f4f6";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "#f9fafb";
                        }}
                      >
                        Last Completed{" "}
                        {workerSortConfig.key === "lastCompleted" &&
                          (workerSortConfig.direction === "asc" ? "↑" : "↓")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      // Get filtered workers first
                      const filteredWorkersList = getFilteredWorkers();
                      // Sort workers based on sortConfig
                      let sortedWorkers = [...filteredWorkersList];
                      if (workerSortConfig.key) {
                        sortedWorkers.sort((a, b) => {
                          let aValue, bValue;

                          if (workerSortConfig.key === "completed") {
                            aValue = a.completed;
                            bValue = b.completed;
                          } else if (workerSortConfig.key === "inProgress") {
                            aValue = a.inProgress;
                            bValue = b.inProgress;
                          } else if (workerSortConfig.key === "lastCompleted") {
                            aValue = a.lastCompletedDate
                              ? new Date(a.lastCompletedDate).getTime()
                              : 0;
                            bValue = b.lastCompletedDate
                              ? new Date(b.lastCompletedDate).getTime()
                              : 0;
                          } else if (workerSortConfig.key === "total") {
                            aValue = a.total;
                            bValue = b.total;
                          }

                          if (aValue < bValue) {
                            return workerSortConfig.direction === "asc"
                              ? -1
                              : 1;
                          }
                          if (aValue > bValue) {
                            return workerSortConfig.direction === "asc"
                              ? 1
                              : -1;
                          }
                          return 0;
                        });
                      }

                      if (sortedWorkers.length === 0) {
                        return (
                          <tr>
                            <td
                              colSpan="5"
                              style={{
                                textAlign: "center",
                                padding: "40px",
                                color: "#6b7280",
                              }}
                            >
                              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>
                                🔍
                              </div>
                              <div
                                style={{
                                  fontSize: "1.125rem",
                                  fontWeight: "600",
                                  color: "#374151",
                                  marginBottom: "0.5rem",
                                }}
                              >
                                No Workers Match Filters
                              </div>
                              <div>
                                Try adjusting your filter criteria to see more workers.
                              </div>
                            </td>
                          </tr>
                        );
                      }

                      const formatDate = (dateString) => {
                        if (!dateString) return "N/A";
                        const date = new Date(dateString);
                        return date.toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        });
                      };

                      return sortedWorkers.map((worker, index) => {
                        return (
                        <tr
                          key={worker.employeeId}
                          style={{
                            backgroundColor:
                              index % 2 === 0 ? "#ffffff" : "#f9fafb",
                            transition: "background-color 0.2s",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "#f3f4f6";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor =
                              index % 2 === 0 ? "#ffffff" : "#f9fafb";
                          }}
                        >
                          <td
                            onClick={() => {
                              setSelectedWorker(worker);
                              setShowWorkerModal(true);
                            }}
                            style={{
                              padding: "12px 16px",
                              verticalAlign: "middle",
                              fontWeight: "600",
                              color: "#3b82f6",
                              cursor: "pointer",
                              textDecoration: "underline",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.color = "#2563eb";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.color = "#3b82f6";
                            }}
                          >
                            {worker.name}
                          </td>
                          <td
                            style={{
                              padding: "12px 16px",
                              verticalAlign: "middle",
                              textAlign: "center",
                            }}
                          >
                            <span
                              style={{
                                display: "inline-block",
                                padding: "4px 12px",
                                borderRadius: "12px",
                                backgroundColor: "#f0fdf4",
                                color: "#10b981",
                                fontWeight: "600",
                                fontSize: "0.875rem",
                              }}
                            >
                              {worker.completed}
                            </span>
                          </td>
                          <td
                            style={{
                              padding: "12px 16px",
                              verticalAlign: "middle",
                              textAlign: "center",
                            }}
                          >
                            <span
                              style={{
                                display: "inline-block",
                                padding: "4px 12px",
                                borderRadius: "12px",
                                backgroundColor: "#faf5ff",
                                color: "#8b5cf6",
                                fontWeight: "600",
                                fontSize: "0.875rem",
                              }}
                            >
                              {worker.inProgress}
                            </span>
                          </td>
                          <td
                            style={{
                              padding: "12px 16px",
                              verticalAlign: "middle",
                              textAlign: "center",
                              fontWeight: "600",
                              color: "#374151",
                            }}
                          >
                            {worker.total}
                          </td>
                          <td
                            style={{
                              padding: "12px 16px",
                              verticalAlign: "middle",
                              color: "#6b7280",
                              fontSize: "0.875rem",
                            }}
                          >
                            {worker.lastCompletedDate
                              ? formatDate(worker.lastCompletedDate)
                              : "No completions yet"}
                          </td>
                        </tr>
                        );
                      });
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="theme-park-card">
              <div
                style={{
                  textAlign: "center",
                  padding: "3rem",
                  color: "#6b7280",
                }}
              >
                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>
                  👷
                </div>
                <div
                  style={{
                    fontSize: "1.125rem",
                    fontWeight: "600",
                    color: "#374151",
                    marginBottom: "0.5rem",
                  }}
                >
                  No Maintenance Workers Found
                </div>
                <div>
                  No maintenance workers have been assigned to requests yet.
                </div>
              </div>
            </div>
          )}
            </div>
          )}

          {/* Requests Tab Content */}
          {activeTab === "requests" && (
            <div>
              {/* Filters */}
              <div className="theme-park-card" style={{ marginBottom: "1.5rem" }}>
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
          
          {/* Quick Date Filter Buttons */}
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
              style={{
                backgroundColor: "#f3f4f6",
                color: "#374151",
                border: "1px solid #d1d5db",
                padding: "8px 16px",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "500",
                transition: "all 0.2s",
              }}
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
              style={{
                backgroundColor: "#f3f4f6",
                color: "#374151",
                border: "1px solid #d1d5db",
                padding: "8px 16px",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "500",
                transition: "all 0.2s",
              }}
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
              style={{
                backgroundColor: "#f3f4f6",
                color: "#374151",
                border: "1px solid #d1d5db",
                padding: "8px 16px",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "500",
                transition: "all 0.2s",
              }}
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
              style={{
                backgroundColor: "#f3f4f6",
                color: "#374151",
                border: "1px solid #d1d5db",
                padding: "8px 16px",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "500",
                transition: "all 0.2s",
              }}
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
              style={{
                backgroundColor: "#f3f4f6",
                color: "#374151",
                border: "1px solid #d1d5db",
                padding: "8px 16px",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "500",
                transition: "all 0.2s",
              }}
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
                <span>📋</span> All Maintenance Requests
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
                        {request.status?.toLowerCase() === "completed" ? (
                          <button
                            onClick={async () => {
                              // Get work details and time taken from maintenance logs using helper function
                              setShowWorkDetailsModal(true);
                              setSelectedWorkDetails("Loading work details...");
                              setSelectedTimeTakenHours(null);
                              try {
                                const { workDetails, timeTakenHours } =
                                  await getWorkDetailsAndTimeFromRequest(
                                    request
                                  );
                                setSelectedWorkDetails(workDetails);
                                setSelectedTimeTakenHours(timeTakenHours);
                              } catch (error) {
                                console.error(
                                  "Error getting work details:",
                                  error
                                );
                                setSelectedWorkDetails(
                                  "Error loading work details. Please try again."
                                );
                                setSelectedTimeTakenHours(null);
                              }
                            }}
                            style={{
                              backgroundColor: "#10b981",
                              color: "white",
                              border: "none",
                              padding: "6px 14px",
                              borderRadius: "6px",
                              cursor: "pointer",
                              fontSize: "12px",
                              fontWeight: "500",
                              whiteSpace: "nowrap",
                              transition: "all 0.2s",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = "#059669";
                              e.currentTarget.style.transform =
                                "translateY(-1px)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = "#10b981";
                              e.currentTarget.style.transform = "translateY(0)";
                            }}
                          >
                            View Details
                          </button>
                        ) : (
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
                              disabled={
                                request.status?.toLowerCase() !== "open"
                              }
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
                              disabled={
                                request.status?.toLowerCase() !== "open"
                              }
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          </div>
            </div>
          )}
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

        {/* Work Details Modal */}
        {showWorkDetailsModal && (
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
            onClick={() => setShowWorkDetailsModal(false)}
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
                    color: "#10b981",
                  }}
                >
                  Work Details
                </h3>
                <button
                  onClick={() => setShowWorkDetailsModal(false)}
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
                  backgroundColor: "#f0fdf4",
                  borderRadius: "6px",
                  border: "1px solid #bbf7d0",
                  whiteSpace: "pre-wrap",
                  wordWrap: "break-word",
                  lineHeight: "1.6",
                  color: "#374151",
                  minHeight: "100px",
                }}
              >
                {selectedWorkDetails}
              </div>
              {selectedWorkDetails !== "Loading work details..." &&
                selectedWorkDetails !==
                  "Error loading work details. Please try again." && (
                  <div
                    style={{
                      marginTop: "15px",
                      padding: "12px 15px",
                      backgroundColor: "#eff6ff",
                      borderRadius: "6px",
                      border: "1px solid #bfdbfe",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "14px",
                        fontWeight: "600",
                        color: "#1e40af",
                        marginBottom: "4px",
                      }}
                    >
                      Time Taken:
                    </div>
                    <div
                      style={{
                        fontSize: "16px",
                        color: "#1e3a8a",
                        fontWeight: "500",
                      }}
                    >
                      {formatTimeTaken(selectedTimeTakenHours)}
                    </div>
                  </div>
                )}
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  marginTop: "20px",
                }}
              >
                <button
                  onClick={() => setShowWorkDetailsModal(false)}
                  style={{
                    backgroundColor: "#10b981",
                    color: "white",
                    border: "none",
                    padding: "10px 20px",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "16px",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#059669";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#10b981";
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

        {/* Worker Maintenance Requests Modal */}
        {showWorkerModal && selectedWorker && (
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
              zIndex: 1001,
            }}
            onClick={() => {
              setShowWorkerModal(false);
              setSelectedWorker(null);
            }}
          >
            <div
              style={{
                backgroundColor: "white",
                borderRadius: "8px",
                padding: "1.5rem",
                maxWidth: "1400px",
                width: "95%",
                maxHeight: "90vh",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "1.5rem",
                  paddingBottom: "1rem",
                  borderBottom: "2px solid #e5e7eb",
                }}
              >
                <h2
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: "600",
                    color: "#1f2937",
                    margin: 0,
                  }}
                >
                  {selectedWorker.name} - Maintenance Requests
                </h2>
                <button
                  onClick={() => {
                    setShowWorkerModal(false);
                    setSelectedWorker(null);
                  }}
                  style={{
                    backgroundColor: "#6b7280",
                    color: "white",
                    border: "none",
                    padding: "8px 16px",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "500",
                  }}
                >
                  Close
                </button>
              </div>

              <div
                style={{
                  flex: 1,
                  overflow: "auto",
                }}
              >
                {(() => {
                  const workerRequests = getWorkerRequests(
                    selectedWorker.employeeId
                  );
                  const sortedRequests =
                    getSortedWorkerRequests(workerRequests);

                  return sortedRequests.length > 0 ? (
                    <table
                      className="theme-park-table"
                      style={{
                        tableLayout: "fixed",
                        width: "100%",
                        fontSize: "0.875rem",
                      }}
                    >
                      <thead>
                        <tr>
                          <th
                            onClick={() => {
                              const direction =
                                workerRequestSortConfig.key === "ride" &&
                                workerRequestSortConfig.direction === "asc"
                                  ? "desc"
                                  : "asc";
                              setWorkerRequestSortConfig({
                                key: "ride",
                                direction,
                              });
                            }}
                            className="sortable"
                            style={{
                              width: "20%",
                              minWidth: "150px",
                              textAlign: "left",
                              padding: "10px 12px",
                              backgroundColor: "#f9fafb",
                              borderBottom: "2px solid #e5e7eb",
                              fontWeight: "600",
                              fontSize: "0.75rem",
                              textTransform: "uppercase",
                              letterSpacing: "0.05em",
                              color: "#374151",
                              cursor: "pointer",
                              userSelect: "none",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = "#f3f4f6";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = "#f9fafb";
                            }}
                          >
                            Ride{" "}
                            {workerRequestSortConfig.key === "ride" &&
                              (workerRequestSortConfig.direction === "asc"
                                ? "↑"
                                : "↓")}
                          </th>
                          <th
                            onClick={() => {
                              const direction =
                                workerRequestSortConfig.key === "status" &&
                                workerRequestSortConfig.direction === "asc"
                                  ? "desc"
                                  : "asc";
                              setWorkerRequestSortConfig({
                                key: "status",
                                direction,
                              });
                            }}
                            className="sortable"
                            style={{
                              width: "12%",
                              minWidth: "100px",
                              textAlign: "center",
                              padding: "10px 12px",
                              backgroundColor: "#f9fafb",
                              borderBottom: "2px solid #e5e7eb",
                              fontWeight: "600",
                              fontSize: "0.75rem",
                              textTransform: "uppercase",
                              letterSpacing: "0.05em",
                              color: "#374151",
                              cursor: "pointer",
                              userSelect: "none",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = "#f3f4f6";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = "#f9fafb";
                            }}
                          >
                            Status{" "}
                            {workerRequestSortConfig.key === "status" &&
                              (workerRequestSortConfig.direction === "asc"
                                ? "↑"
                                : "↓")}
                          </th>
                          <th
                            onClick={() => {
                              const direction =
                                workerRequestSortConfig.key === "requestDate" &&
                                workerRequestSortConfig.direction === "asc"
                                  ? "desc"
                                  : "asc";
                              setWorkerRequestSortConfig({
                                key: "requestDate",
                                direction,
                              });
                            }}
                            className="sortable"
                            style={{
                              width: "12%",
                              minWidth: "110px",
                              textAlign: "left",
                              padding: "10px 12px",
                              backgroundColor: "#f9fafb",
                              borderBottom: "2px solid #e5e7eb",
                              fontWeight: "600",
                              fontSize: "0.75rem",
                              textTransform: "uppercase",
                              letterSpacing: "0.05em",
                              color: "#374151",
                              cursor: "pointer",
                              userSelect: "none",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = "#f3f4f6";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = "#f9fafb";
                            }}
                          >
                            Request Date{" "}
                            {workerRequestSortConfig.key === "requestDate" &&
                              (workerRequestSortConfig.direction === "asc"
                                ? "↑"
                                : "↓")}
                          </th>
                          <th
                            onClick={() => {
                              const direction =
                                workerRequestSortConfig.key ===
                                  "completionDate" &&
                                workerRequestSortConfig.direction === "asc"
                                  ? "desc"
                                  : "asc";
                              setWorkerRequestSortConfig({
                                key: "completionDate",
                                direction,
                              });
                            }}
                            className="sortable"
                            style={{
                              width: "12%",
                              minWidth: "110px",
                              textAlign: "left",
                              padding: "10px 12px",
                              backgroundColor: "#f9fafb",
                              borderBottom: "2px solid #e5e7eb",
                              fontWeight: "600",
                              fontSize: "0.75rem",
                              textTransform: "uppercase",
                              letterSpacing: "0.05em",
                              color: "#374151",
                              cursor: "pointer",
                              userSelect: "none",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = "#f3f4f6";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = "#f9fafb";
                            }}
                          >
                            Completion Date{" "}
                            {workerRequestSortConfig.key === "completionDate" &&
                              (workerRequestSortConfig.direction === "asc"
                                ? "↑"
                                : "↓")}
                          </th>
                          <th
                            onClick={() => {
                              const direction =
                                workerRequestSortConfig.key ===
                                  "issueDescription" &&
                                workerRequestSortConfig.direction === "asc"
                                  ? "desc"
                                  : "asc";
                              setWorkerRequestSortConfig({
                                key: "issueDescription",
                                direction,
                              });
                            }}
                            className="sortable"
                            style={{
                              width: "44%",
                              minWidth: "200px",
                              textAlign: "left",
                              padding: "10px 12px",
                              backgroundColor: "#f9fafb",
                              borderBottom: "2px solid #e5e7eb",
                              fontWeight: "600",
                              fontSize: "0.75rem",
                              textTransform: "uppercase",
                              letterSpacing: "0.05em",
                              color: "#374151",
                              cursor: "pointer",
                              userSelect: "none",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = "#f3f4f6";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = "#f9fafb";
                            }}
                          >
                            Issue Description{" "}
                            {workerRequestSortConfig.key ===
                              "issueDescription" &&
                              (workerRequestSortConfig.direction === "asc"
                                ? "↑"
                                : "↓")}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {sortedRequests.map((request, index) => (
                          <tr
                            key={request.requestId}
                            style={{
                              backgroundColor:
                                index % 2 === 0 ? "#ffffff" : "#f9fafb",
                              transition: "background-color 0.2s",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = "#f3f4f6";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor =
                                index % 2 === 0 ? "#ffffff" : "#f9fafb";
                            }}
                          >
                            <td
                              style={{
                                padding: "10px 12px",
                                verticalAlign: "middle",
                                color: "#1f2937",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                              title={request.ride?.ride_Name || "Unknown"}
                            >
                              {request.ride?.ride_Name || "Unknown"}
                            </td>
                            <td
                              style={{
                                padding: "10px 12px",
                                verticalAlign: "middle",
                                textAlign: "center",
                              }}
                            >
                              <span
                                style={{
                                  display: "inline-block",
                                  padding: "4px 10px",
                                  borderRadius: "12px",
                                  fontSize: "0.75rem",
                                  fontWeight: "600",
                                  backgroundColor:
                                    (request.status || "").toLowerCase() ===
                                    "completed"
                                      ? "#f0fdf4"
                                      : "#faf5ff",
                                  color:
                                    (request.status || "").toLowerCase() ===
                                    "completed"
                                      ? "#10b981"
                                      : "#8b5cf6",
                                }}
                              >
                                {request.status || "N/A"}
                              </span>
                            </td>
                            <td
                              style={{
                                padding: "10px 12px",
                                verticalAlign: "middle",
                                color: "#6b7280",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {request.requestDate
                                ? formatDateShort(request.requestDate)
                                : "N/A"}
                            </td>
                            <td
                              style={{
                                padding: "10px 12px",
                                verticalAlign: "middle",
                                color: "#6b7280",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {request.completionDate
                                ? formatDateShort(request.completionDate)
                                : "N/A"}
                            </td>
                            <td
                              onClick={() => {
                                if (request.issueDescription) {
                                  setSelectedDescription(
                                    request.issueDescription
                                  );
                                  setShowDescriptionModal(true);
                                }
                              }}
                              style={{
                                padding: "10px 12px",
                                verticalAlign: "middle",
                                color: request.issueDescription
                                  ? "#374151"
                                  : "#9ca3af",
                                cursor: request.issueDescription
                                  ? "pointer"
                                  : "default",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                              title={
                                request.issueDescription || "No description"
                              }
                            >
                              {request.issueDescription || "No description"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div
                      style={{
                        textAlign: "center",
                        padding: "3rem",
                        color: "#6b7280",
                      }}
                    >
                      No maintenance requests found for this worker.
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignMaintenance;
