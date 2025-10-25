import React, { useState, useEffect } from "react";
import { maintenanceRequestAPI, employeeAPI } from "../api";

const AssignMaintanence = () => {
  const [maintenanceRequests, setMaintenanceRequests] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [requestsData, employeesData] = await Promise.all([
        maintenanceRequestAPI.getAllMaintenanceRequests(),
        employeeAPI.getAllEmployees(),
      ]);
      setMaintenanceRequests(requestsData);

      // Filter employees to only show those in Maintenance department with Maintenance Worker role
      const maintenanceWorkers = employeesData.filter((employee) => {
        // Try different possible property name formats
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
      setError(null);
    } catch (err) {
      console.error("Error loading data:", err);
      setError("Failed to load maintenance requests and employees");
    } finally {
      setLoading(false);
    }
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

      // Update local state to reflect the assignment
      setMaintenanceRequests((prev) =>
        prev.map((req) =>
          req.requestId === requestId
            ? {
                ...req,
                assignedTo: parseInt(selectedEmployee),
                status: "In Progress",
              }
            : req
        )
      );
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

      // Update local state to reflect the cancellation
      setMaintenanceRequests((prev) =>
        prev.map((req) =>
          req.requestId === requestId
            ? {
                ...req,
                status: "Cancelled",
                completionDate: new Date().toISOString(),
              }
            : req
        )
      );
      alert("Maintenance request cancelled successfully!");
    } catch (err) {
      console.error("Error cancelling request:", err);
      alert("Failed to cancel maintenance request. Please try again.");
    }
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

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>Loading maintenance requests...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.error}>{error}</div>
        <button onClick={loadData} style={styles.retryButton}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Maintenance Request Assignment</h2>
        <button onClick={() => loadData()} style={styles.refreshButton}>
          Refresh
        </button>
      </div>

      {maintenanceRequests.length === 0 ? (
        <div style={styles.emptyState}>No maintenance requests found.</div>
      ) : (
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeader}>
                <th style={{ ...styles.tableHeaderCell, width: "100px" }}>
                  Request ID
                </th>
                <th style={{ ...styles.tableHeaderCell, width: "120px" }}>
                  Status
                </th>
                <th style={{ ...styles.tableHeaderCell, width: "150px" }}>
                  Ride
                </th>
                <th style={{ ...styles.tableHeaderCell, width: "250px" }}>
                  Issue Description
                </th>
                <th style={{ ...styles.tableHeaderCell, width: "180px" }}>
                  Reported By
                </th>
                <th style={{ ...styles.tableHeaderCell, width: "180px" }}>
                  Assigned To
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
              {maintenanceRequests.map((request) => (
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
                    {request.reporter?.firstName} {request.reporter?.lastName}
                    <br />
                    <small style={styles.smallText}>
                      (ID: {request.reportedBy})
                    </small>
                  </td>
                  <td style={styles.tableCell}>
                    {request.assignee ? (
                      <>
                        {request.assignee.firstName} {request.assignee.lastName}
                        <br />
                        <small style={styles.smallText}>
                          (ID: {request.assignedTo})
                        </small>
                      </>
                    ) : (
                      "Unassigned"
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
                    <div style={styles.actionButtons}>
                      <button
                        onClick={() => {
                          if (request.status?.toLowerCase() === "open") {
                            setSelectedRequest(request);
                          }
                        }}
                        style={{
                          ...styles.assignButton,
                          ...(request.status?.toLowerCase() !== "open"
                            ? styles.disabledAssignButton
                            : {}),
                        }}
                        disabled={request.status?.toLowerCase() !== "open"}
                      >
                        Assign
                      </button>
                      <button
                        onClick={() => handleCancelRequest(request.requestId)}
                        style={{
                          ...styles.cancelRequestButton,
                          ...(request.status?.toLowerCase() !== "open"
                            ? styles.disabledCancelButton
                            : {}),
                        }}
                        disabled={request.status?.toLowerCase() !== "open"}
                      >
                        Cancel
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Assignment Modal */}
      {selectedRequest && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h3 style={styles.modalTitle}>
              Assign Request #{selectedRequest.requestId}
            </h3>
            <p style={styles.modalDescription}>
              Select a maintenance worker to assign this maintenance request to:
            </p>

            {employees.length === 0 ? (
              <div style={styles.noWorkersMessage}>
                No maintenance workers available. Please ensure there are
                employees in the Maintenance department with the Maintenance
                Worker role.
              </div>
            ) : (
              <select
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
                style={styles.employeeSelect}
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

            <div style={styles.modalActions}>
              <button
                onClick={() => {
                  setSelectedRequest(null);
                  setSelectedEmployee("");
                }}
                style={styles.cancelButton}
              >
                Cancel
              </button>
              <button
                onClick={() => handleAssignRequest(selectedRequest.requestId)}
                style={{
                  ...styles.confirmButton,
                  ...(employees.length === 0 ? styles.disabledButton : {}),
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
    fontSize: "24px",
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
    minWidth: "1500px",
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
  tableRowHover: {
    backgroundColor: "#f9fafb",
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
    maxWidth: "240px",
    wordWrap: "break-word",
    lineHeight: "1.4",
  },
  smallText: {
    color: "#6b7280",
    fontSize: "12px",
  },
  assignButton: {
    backgroundColor: "#3b82f6",
    color: "white",
    border: "none",
    padding: "8px 16px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
  },
  disabledAssignButton: {
    backgroundColor: "#9ca3af",
    color: "#6b7280",
    cursor: "not-allowed",
    opacity: 0.6,
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
    maxWidth: "500px",
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
  employeeSelect: {
    width: "100%",
    padding: "10px",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    fontSize: "16px",
    marginBottom: "20px",
  },
  noWorkersMessage: {
    padding: "15px",
    backgroundColor: "#fef3c7",
    border: "1px solid #f59e0b",
    borderRadius: "6px",
    color: "#92400e",
    fontSize: "14px",
    marginBottom: "20px",
    textAlign: "center",
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
  disabledButton: {
    backgroundColor: "#9ca3af",
    cursor: "not-allowed",
  },
  actionButtons: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
  },
  cancelRequestButton: {
    backgroundColor: "#ef4444",
    color: "white",
    border: "none",
    padding: "8px 16px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
  },
  disabledCancelButton: {
    backgroundColor: "#9ca3af",
    color: "#6b7280",
    cursor: "not-allowed",
    opacity: 0.6,
  },
};

export default AssignMaintanence;
