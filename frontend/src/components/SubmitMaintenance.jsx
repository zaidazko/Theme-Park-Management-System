import React, { useState, useEffect, useCallback } from "react";
import { maintenanceRequestAPI } from "../api";

const SubmitMaintenance = ({ user }) => {
  const [assignedRequests, setAssignedRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("requestDate");
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [workDetails, setWorkDetails] = useState("");

  const loadAssignedRequests = useCallback(async () => {
    if (!user?.employeeId) return;

    try {
      setLoading(true);
      const requests =
        await maintenanceRequestAPI.getMaintenanceRequestsAssignedToEmployee(
          user.employeeId
        );
      setAssignedRequests(requests);
      setError(null);
    } catch (err) {
      console.error("Error loading assigned requests:", err);
      setError("Failed to load your assigned maintenance tasks");
    } finally {
      setLoading(false);
    }
  }, [user?.employeeId]);

  useEffect(() => {
    if (user?.userType === "Employee" && user?.employeeId) {
      loadAssignedRequests();
    } else {
      setLoading(false);
    }
  }, [user, loadAssignedRequests]);

  const handleCompleteRequest = (requestId) => {
    setSelectedRequestId(requestId);
    setWorkDetails("");
    setShowCompleteModal(true);
  };

  const handleSubmitCompletion = async () => {
    if (!workDetails.trim()) {
      alert("Please provide details about the work performed.");
      return;
    }

    try {
      await maintenanceRequestAPI.completeMaintenanceRequest(
        selectedRequestId,
        workDetails
      );

      // Update local state
      setAssignedRequests((prev) =>
        prev.map((req) =>
          req.requestId === selectedRequestId
            ? {
                ...req,
                status: "Completed",
                completionDate: new Date().toISOString(),
              }
            : req
        )
      );

      setShowCompleteModal(false);
      setWorkDetails("");
      setSelectedRequestId(null);
      alert("Maintenance task completed successfully!");
    } catch (err) {
      console.error("Error completing request:", err);
      alert("Failed to complete maintenance task. Please try again.");
    }
  };

  const handleCancelCompletion = () => {
    setShowCompleteModal(false);
    setWorkDetails("");
    setSelectedRequestId(null);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
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
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getFilteredAndSortedRequests = () => {
    let filtered = assignedRequests;

    // Filter by status
    if (filterStatus !== "all") {
      filtered = filtered.filter(
        (req) => req.status?.toLowerCase() === filterStatus.toLowerCase()
      );
    }

    // Sort requests
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "requestDate":
          return new Date(b.requestDate) - new Date(a.requestDate);
        case "priority": {
          const statusOrder = {
            "in progress": 1,
            assigned: 2,
            completed: 3,
            open: 4,
          };
          return (
            (statusOrder[a.status?.toLowerCase()] || 5) -
            (statusOrder[b.status?.toLowerCase()] || 5)
          );
        }
        case "ride":
          return (a.ride?.ride_Name || "").localeCompare(
            b.ride?.ride_Name || ""
          );
        default:
          return 0;
      }
    });

    return filtered;
  };

  const getStatusCounts = () => {
    const counts = {
      total: assignedRequests.length,
      inProgress: assignedRequests.filter(
        (req) => req.status?.toLowerCase() === "in progress"
      ).length,
      completed: assignedRequests.filter(
        (req) => req.status?.toLowerCase() === "completed"
      ).length,
      assigned: assignedRequests.filter(
        (req) => req.status?.toLowerCase() === "assigned"
      ).length,
    };
    return counts;
  };

  if (!user || user.userType !== "Employee") {
    return (
      <div style={styles.container}>
        <div style={styles.error}>
          Access denied. This page is only available to employees.
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>Loading your maintenance tasks...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.error}>{error}</div>
        <button onClick={loadAssignedRequests} style={styles.retryButton}>
          Retry
        </button>
      </div>
    );
  }

  const filteredRequests = getFilteredAndSortedRequests();
  const statusCounts = getStatusCounts();

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>My Maintenance Tasks</h2>
        <button onClick={loadAssignedRequests} style={styles.refreshButton}>
          Refresh
        </button>
      </div>

      {/* Status Summary Cards */}
      <div style={styles.summaryCards}>
        <div style={styles.summaryCard}>
          <div style={styles.summaryNumber}>{statusCounts.total}</div>
          <div style={styles.summaryLabel}>Total Tasks</div>
        </div>
        <div style={styles.summaryCard}>
          <div style={{ ...styles.summaryNumber, color: "#8b5cf6" }}>
            {statusCounts.inProgress}
          </div>
          <div style={styles.summaryLabel}>In Progress</div>
        </div>
        <div style={styles.summaryCard}>
          <div style={{ ...styles.summaryNumber, color: "#10b981" }}>
            {statusCounts.completed}
          </div>
          <div style={styles.summaryLabel}>Completed</div>
        </div>
        <div style={styles.summaryCard}>
          <div style={{ ...styles.summaryNumber, color: "#3b82f6" }}>
            {statusCounts.assigned}
          </div>
          <div style={styles.summaryLabel}>Assigned</div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div style={styles.controls}>
        <div style={styles.filterGroup}>
          <label style={styles.filterLabel}>Filter by Status:</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={styles.filterSelect}
          >
            <option value="all">All Status</option>
            <option value="in progress">In Progress</option>
            <option value="assigned">Assigned</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        <div style={styles.filterGroup}>
          <label style={styles.filterLabel}>Sort by:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={styles.filterSelect}
          >
            <option value="requestDate">Request Date</option>
            <option value="priority">Priority</option>
            <option value="ride">Ride Name</option>
          </select>
        </div>
      </div>

      {/* Tasks Table */}
      {filteredRequests.length === 0 ? (
        <div style={styles.emptyState}>
          {filterStatus === "all"
            ? "You have no assigned maintenance tasks."
            : `No tasks found with status: ${filterStatus}`}
        </div>
      ) : (
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeader}>
                <th style={{ ...styles.tableHeaderCell, width: "100px" }}>
                  Task ID
                </th>
                <th style={{ ...styles.tableHeaderCell, width: "120px" }}>
                  Status
                </th>
                <th style={{ ...styles.tableHeaderCell, width: "150px" }}>
                  Ride
                </th>
                <th style={{ ...styles.tableHeaderCell, width: "300px" }}>
                  Issue Description
                </th>
                <th style={{ ...styles.tableHeaderCell, width: "180px" }}>
                  Reported By
                </th>
                <th style={{ ...styles.tableHeaderCell, width: "160px" }}>
                  Request Date
                </th>
                <th style={{ ...styles.tableHeaderCell, width: "160px" }}>
                  Completion Date
                </th>
                <th style={{ ...styles.tableHeaderCell, width: "120px" }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map((request) => (
                <tr
                  key={request.requestId}
                  style={styles.tableRow}
                  onMouseEnter={(e) =>
                    (e.target.style.backgroundColor = "#f9fafb")
                  }
                  onMouseLeave={(e) =>
                    (e.target.style.backgroundColor = "transparent")
                  }
                >
                  <td style={styles.tableCell}>
                    <strong>#{request.requestId}</strong>
                  </td>
                  <td style={styles.tableCell}>
                    <span
                      style={{
                        ...styles.statusBadge,
                        backgroundColor: getStatusColor(request.status),
                      }}
                    >
                      {request.status || "Unknown"}
                    </span>
                  </td>
                  <td style={styles.tableCell}>
                    {request.ride?.ride_Name || "N/A"}
                  </td>
                  <td style={styles.tableCell}>
                    <div style={styles.issueDescription}>
                      {request.issueDescription || "No description"}
                    </div>
                  </td>
                  <td style={styles.tableCell}>
                    {request.reporter ? (
                      <>
                        {request.reporter.firstName} {request.reporter.lastName}
                        <br />
                        <small style={styles.smallText}>
                          (ID: {request.reportedBy})
                        </small>
                      </>
                    ) : (
                      <span style={{ color: "#9ca3af", fontStyle: "italic" }}>
                        Former Employee
                      </span>
                    )}
                  </td>
                  <td style={styles.tableCell}>
                    {formatDate(request.requestDate)}
                  </td>
                  <td style={styles.tableCell}>
                    {request.completionDate
                      ? formatDate(request.completionDate)
                      : "N/A"}
                  </td>
                  <td style={styles.tableCell}>
                    {request.status?.toLowerCase() === "in progress" && (
                      <button
                        onClick={() => handleCompleteRequest(request.requestId)}
                        style={styles.completeButton}
                      >
                        Complete
                      </button>
                    )}
                    {request.status?.toLowerCase() === "completed" && (
                      <span style={styles.completedText}>✓ Completed</span>
                    )}
                    {request.status?.toLowerCase() === "assigned" && (
                      <span style={styles.assignedText}>Ready to Start</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Completion Modal */}
      {showCompleteModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h3 style={styles.modalTitle}>Complete Maintenance Task</h3>
            <p style={styles.modalDescription}>
              Please provide details about the work you performed:
            </p>

            <textarea
              value={workDetails}
              onChange={(e) => setWorkDetails(e.target.value)}
              placeholder="Describe the maintenance work performed, parts replaced, issues found, etc."
              style={styles.workDetailsTextarea}
              rows={6}
            />

            <div style={styles.modalActions}>
              <button
                onClick={handleCancelCompletion}
                style={styles.cancelButton}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitCompletion}
                style={styles.confirmButton}
              >
                Complete Task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: "20px",
    maxWidth: "1600px",
    margin: "0 auto",
    width: "100%",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  title: {
    fontSize: "28px",
    fontWeight: "bold",
    margin: 0,
    color: "#1f2937",
  },
  loading: {
    textAlign: "center",
    fontSize: "18px",
    color: "#6b7280",
    padding: "40px",
  },
  error: {
    textAlign: "center",
    fontSize: "18px",
    color: "#ef4444",
    padding: "20px",
    backgroundColor: "#fef2f2",
    border: "1px solid #fecaca",
    borderRadius: "8px",
    marginBottom: "20px",
  },
  retryButton: {
    backgroundColor: "#3b82f6",
    color: "white",
    border: "none",
    padding: "10px 20px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "16px",
  },
  refreshButton: {
    backgroundColor: "#3b82f6",
    color: "white",
    border: "none",
    padding: "10px 20px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "500",
  },
  summaryCards: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "20px",
    marginBottom: "30px",
  },
  summaryCard: {
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "8px",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
    textAlign: "center",
  },
  summaryNumber: {
    fontSize: "32px",
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: "5px",
  },
  summaryLabel: {
    fontSize: "14px",
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  controls: {
    display: "flex",
    gap: "20px",
    marginBottom: "20px",
    flexWrap: "wrap",
  },
  filterGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "5px",
  },
  filterLabel: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#374151",
  },
  filterSelect: {
    padding: "8px 12px",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    fontSize: "14px",
    backgroundColor: "white",
  },
  emptyState: {
    textAlign: "center",
    fontSize: "18px",
    color: "#6b7280",
    padding: "40px",
    backgroundColor: "#f9fafb",
    borderRadius: "8px",
  },
  tableContainer: {
    backgroundColor: "white",
    borderRadius: "8px",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
    overflow: "auto",
    width: "100%",
  },
  table: {
    width: "100%",
    minWidth: "1200px",
    borderCollapse: "collapse",
    fontSize: "14px",
  },
  tableHeader: {
    backgroundColor: "#f8fafc",
    borderBottom: "2px solid #e5e7eb",
  },
  tableHeaderCell: {
    padding: "12px 16px",
    textAlign: "left",
    fontWeight: "600",
    color: "#374151",
    fontSize: "12px",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  tableRow: {
    borderBottom: "1px solid #e5e7eb",
    transition: "background-color 0.2s",
  },
  tableCell: {
    padding: "12px 16px",
    verticalAlign: "top",
    color: "#374151",
    fontSize: "14px",
  },
  statusBadge: {
    padding: "4px 8px",
    borderRadius: "12px",
    color: "white",
    fontSize: "11px",
    fontWeight: "600",
    textTransform: "uppercase",
    display: "inline-block",
  },
  issueDescription: {
    maxWidth: "280px",
    wordWrap: "break-word",
    lineHeight: "1.4",
  },
  smallText: {
    color: "#6b7280",
    fontSize: "12px",
  },
  completeButton: {
    backgroundColor: "#10b981",
    color: "white",
    border: "none",
    padding: "8px 16px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
  },
  completedText: {
    color: "#10b981",
    fontWeight: "600",
    fontSize: "14px",
  },
  assignedText: {
    color: "#3b82f6",
    fontWeight: "500",
    fontSize: "14px",
  },
  modalOverlay: {
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
  },
  modal: {
    backgroundColor: "white",
    padding: "30px",
    borderRadius: "8px",
    maxWidth: "600px",
    width: "90%",
    maxHeight: "80vh",
    overflow: "auto",
  },
  modalTitle: {
    fontSize: "20px",
    fontWeight: "bold",
    marginBottom: "15px",
    color: "#1f2937",
  },
  modalDescription: {
    marginBottom: "20px",
    color: "#6b7280",
  },
  workDetailsTextarea: {
    width: "100%",
    padding: "12px",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    fontSize: "14px",
    fontFamily: "inherit",
    resize: "vertical",
    marginBottom: "20px",
    minHeight: "120px",
  },
  modalActions: {
    display: "flex",
    gap: "10px",
    justifyContent: "flex-end",
  },
  cancelButton: {
    backgroundColor: "#6b7280",
    color: "white",
    border: "none",
    padding: "10px 20px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "16px",
  },
  confirmButton: {
    backgroundColor: "#10b981",
    color: "white",
    border: "none",
    padding: "10px 20px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "16px",
  },
};

export default SubmitMaintenance;
