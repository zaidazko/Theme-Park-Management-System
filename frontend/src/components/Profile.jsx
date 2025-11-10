import React, { useState, useEffect, useCallback } from "react";
import { authAPI, maintenanceRequestAPI } from "../api";
import "./ThemePark.css";

const extractRoleId = (data) => {
  return (
    data?.roleId ??
    data?.roleID ??
    data?.Role_ID ??
    data?.RoleId ??
    data?.role?.roleId ??
    data?.role?.roleID ??
    data?.role?.role_ID ??
    data?.role?.Role_ID ??
    null
  );
};

const extractRoleName = (data) => {
  return (
    data?.roleName ??
    data?.RoleName ??
    data?.role?.roleName ??
    data?.role?.role_Name ??
    data?.role?.RoleName ??
    ""
  );
};

const extractEmployeeId = (data, fallbackId) => {
  return (
    data?.employeeId ??
    data?.EmployeeId ??
    data?.employee_ID ??
    data?.Employee_ID ??
    fallbackId
  );
};

function Profile({ user }) {
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    password: "",
    username: "",
  });
  const [message, setMessage] = useState("");
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [isRideOperator, setIsRideOperator] = useState(false);
  const [assignedMaintenance, setAssignedMaintenance] = useState([]);
  const [maintenanceLoading, setMaintenanceLoading] = useState(false);
  const [maintenanceError, setMaintenanceError] = useState("");

  const fetchAssignedMaintenance = useCallback(async (employeeId) => {
    if (!employeeId) {
      setAssignedMaintenance([]);
      return;
    }

    setMaintenanceLoading(true);
    setMaintenanceError("");
    try {
      const assignments =
        await maintenanceRequestAPI.getMaintenanceRequestsAssignedToEmployee(
          employeeId
        );
      const inProgressAssignments = (assignments || []).filter((request) => {
        const alertID = request.alertId || request.AlertID || request.alert?.alertID || request.alert?.AlertID;
        return alertID !== null && alertID !== undefined && [1,2,3].includes(alertID);
      });

      // Optional: sort by request date descending
      inProgressAssignments.sort((b, a) => {
        const aDate = new Date(a.requestDate || 0).getTime();
        const bDate = new Date(b.requestDate || 0).getTime();
        return bDate - aDate;
      });

      setAssignedMaintenance(inProgressAssignments);
    } catch (err) {
      console.error("Error loading assigned maintenance:", err);
      setAssignedMaintenance([]);
      setMaintenanceError("Unable to load assigned maintenance at this time.");
    } finally {
      setMaintenanceLoading(false);
    }
  }, []);

  const loadProfile = useCallback(async () => {
    try {
      const userId =
        user.userType === "Employee" ? user.employeeId : user.customerId;
      const data = await authAPI.getProfile(userId, user.userType);
      setProfile(data);
      const newForm = {
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        email: data.email || "",
        phone: data.phone || "",
        dateOfBirth: data.dateOfBirth ? data.dateOfBirth.split("T")[0] : "",
        password: "",
        username: "",
      };

      // If customer, fetch username from user_login
      if (user.userType === "Customer") {
        try {
          const login = await authAPI.getCustomerLogin(userId);
          if (login && login.username) newForm.username = login.username;
        } catch (loginErr) {
          // ignore if username cannot be fetched; leave blank
          console.warn("Could not fetch customer username:", loginErr);
        }
      }

      setFormData(newForm);

      if (user.userType === "Employee") {
        const roleId = extractRoleId(data);
        const roleName = extractRoleName(data);
        const normalizedRoleName = roleName.toLowerCase().trim();
        const rideOperator =
          roleId === 4 ||
          normalizedRoleName === "ride operator" ||
          normalizedRoleName.includes("ride operator");
        setIsRideOperator(rideOperator);

        if (rideOperator) {
          const employeeId = extractEmployeeId(data, user.employeeId);
          await fetchAssignedMaintenance(employeeId);
        } else {
          setAssignedMaintenance([]);
          setMaintenanceLoading(false);
          setMaintenanceError("");
        }
      } else {
        setIsRideOperator(false);
        setAssignedMaintenance([]);
        setMaintenanceLoading(false);
        setMaintenanceError("");
      }

      setLoading(false);
    } catch (err) {
      setLoading(false);
      console.error("Error loading profile:", err);
    }
  }, [
    fetchAssignedMaintenance,
    user.customerId,
    user.employeeId,
    user.userType,
  ]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Clear inline error for the field being edited
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: undefined });
    }
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userId =
        user.userType === "Employee" ? user.employeeId : user.customerId;
      // Build payload and include password only when provided
      const payload = {
        FirstName: formData.firstName,
        LastName: formData.lastName,
        Email: formData.email,
        Phone: formData.phone,
        DateOfBirth: formData.dateOfBirth || null,
      };

      if (
        user.userType === "Customer" &&
        formData.password &&
        formData.password.trim() !== ""
      ) {
        payload.Password = formData.password;
      }

      if (
        user.userType === "Customer" &&
        formData.username &&
        formData.username.trim() !== ""
      ) {
        payload.Username = formData.username;
      }
      // Clear previous form errors
      setFormErrors({});

      await authAPI.updateProfile(userId, payload, user.userType);
      setMessage("Profile updated successfully!");
      setIsEditing(false);
      loadProfile();
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      // If backend returned a field-specific error, show it inline
      const serverMsg = err?.response?.data?.message;
      const serverField = err?.response?.data?.field;
      if (serverField) {
        setFormErrors({
          ...formErrors,
          [serverField]: serverMsg || "Invalid value",
        });
        setMessage(serverMsg || "Error updating profile");
      } else {
        setMessage("Error updating profile");
      }
      console.error("Error updating profile:", err);
    }
  };

  if (loading) {
    return (
      <div className="theme-park-page">
        <div className="theme-park-loading">
          <div className="theme-park-spinner"></div>
          <div className="theme-park-loading-text">Loading your profile...</div>
        </div>
      </div>
    );
  }

  const getAssignedHoursAgo = (dateString) => {
    if (!dateString) return "N/A";
    const assignedDate = new Date(dateString);
    if (Number.isNaN(assignedDate.getTime())) return "N/A";
    const diffMs = Date.now() - assignedDate.getTime();
    const hours = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60)));
    return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
  };

  return (
    <div className="theme-park-page">
      <div className="theme-park-container">
        <div className="theme-park-header">
          <h1 className="theme-park-title">My Profile</h1>
          <p className="theme-park-subtitle">
            Manage your personal information and settings
          </p>
        </div>
        {/* Welcome Card */}
        <div
          className="theme-park-card theme-park-card-gradient"
          style={{ marginBottom: "30px" }}
        >
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: "64px", marginBottom: "20px" }}>
              {user.userType === "Employee" ? "👨‍💼" : "🎉"}
            </div>
            <h2
              style={{
                fontSize: "32px",
                fontWeight: "700",
                marginBottom: "10px",
                color: "var(--text-dark)",
              }}
            >
              Welcome back, {profile?.firstName}!
            </h2>
            <div
              className="theme-park-badge theme-park-badge-primary"
              style={{ fontSize: "14px" }}
            >
              {user.userType === "Employee"
                ? "🎯 Employee Account"
                : "⭐ Customer Account"}
            </div>
          </div>
        </div>

        {message && (
          <div
            className={
              message.includes("success")
                ? "theme-park-alert theme-park-alert-success"
                : "theme-park-alert theme-park-alert-error"
            }
          >
            <span style={{ fontSize: "20px" }}>
              {message.includes("success") ? "✅" : "❌"}
            </span>
            <span>{message}</span>
          </div>
        )}

        {user.userType === "Employee" && isRideOperator && (
          <div
            className="theme-park-card"
            style={{ marginBottom: "30px", borderTop: "4px solid #3b82f6" }}
          >
            <div className="theme-park-card-header">
              <h3 className="theme-park-card-title">
                <span>🛠️</span> Your Active Maintenance Assignments
              </h3>
            </div>
            {maintenanceLoading ? (
              <div
                style={{
                  padding: "30px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <div className="theme-park-spinner"></div>
              </div>
            ) : maintenanceError ? (
              <div className="theme-park-alert theme-park-alert-error">
                <span>⚠️</span>
                <span>{maintenanceError}</span>
              </div>
            ) : assignedMaintenance.length === 0 ? (
              <div
                style={{
                  padding: "30px",
                  textAlign: "center",
                  color: "#6b7280",
                  fontStyle: "italic",
                }}
              >
                You have no maintenance assignments currently in progress.
              </div>
            ) : (
              <div
                className="theme-park-table-container"
                style={{ overflowX: "auto" }}
              >
                <table className="theme-park-table">
                  <thead>
                    <tr>
                      <th style={{ width: "12%", minWidth: "100px" }}>
                        Request ID
                      </th>
                      <th style={{ width: "14%", minWidth: "140px" }}>Ride</th>
                      <th style={{ width: "42%", minWidth: "260px" }}>
                        Issue Description
                      </th>
                      <th style={{ width: "22%", minWidth: "200px" }}>
                        Assigned (hours ago)
                      </th>
                      <th style={{ width: "10%", minWidth: "120px" }}>
                        Priority
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {assignedMaintenance.map((request) => (
                      <tr key={request.requestId || request.RequestId}>
                        <td style={{ fontWeight: "600" }}>
                          #{request.requestId || request.RequestId}
                        </td>
                        <td>{request.ride?.ride_Name || "Unknown Ride"}</td>
                        <td>
                          {request.issueDescription
                            ? request.issueDescription
                            : "No description provided"}
                        </td>
                        <td>{getAssignedHoursAgo(request.requestDate)}</td>
                        <td>
                          {(() => {
                            // Get priority from alert relationship or alertId
                            const alertId =
                              request.alertId ||
                              request.AlertId ||
                              request.alert?.alertId ||
                              request.alert?.AlertId;
                            const priorityType =
                              request.alert?.priorityType ||
                              request.alert?.PriorityType;

                            // Map Alert_ID to priority type if not available from alert object
                            let priority = priorityType;
                            if (!priority && alertId) {
                              const priorityMap = {
                                1: "Low",
                                2: "Medium",
                                3: "High",
                                4: "None",
                              };
                              priority = priorityMap[alertId] || "Unknown";
                            }

                            // Default to "Low" if no priority is set
                            if (!priority) {
                              priority = "Low";
                            }

                            // Color coding based on priority
                            const getPriorityStyle = (priority) => {
                              const priorityLower = priority.toLowerCase();
                              if (priorityLower === "high") {
                                return {
                                  backgroundColor: "#fee2e2",
                                  color: "#991b1b",
                                };
                              } else if (priorityLower === "medium") {
                                return {
                                  backgroundColor: "#fef3c7",
                                  color: "#92400e",
                                };
                              } else if (priorityLower === "low") {
                                return {
                                  backgroundColor: "#dbeafe",
                                  color: "#1e40af",
                                };
                              } else {
                                return {
                                  backgroundColor: "#f3f4f6",
                                  color: "#4b5563",
                                };
                              }
                            };

                            const priorityStyle = getPriorityStyle(priority);

                            return (
                              <span
                                style={{
                                  display: "inline-block",
                                  padding: "4px 10px",
                                  borderRadius: "12px",
                                  ...priorityStyle,
                                  fontWeight: "600",
                                  fontSize: "12px",
                                  textTransform: "uppercase",
                                }}
                              >
                                {priority}
                              </span>
                            );
                          })()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        <div className="theme-park-card">
          <div className="theme-park-card-header">
            <h3 className="theme-park-card-title">
              <span>👤</span> Personal Information
            </h3>
            {/* Employees are not allowed to edit their own profile via this UI */}
            {!isEditing && user.userType !== "Employee" && (
              <button
                onClick={() => setIsEditing(true)}
                className="theme-park-btn theme-park-btn-primary theme-park-btn-sm"
              >
                ✏️ Edit Profile
              </button>
            )}
          </div>

          {!isEditing ? (
            <div style={{ display: "grid", gap: "20px" }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                  gap: "25px",
                }}
              >
                <div
                  style={{
                    padding: "20px",
                    background:
                      "linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)",
                    borderRadius: "12px",
                    borderLeft: "4px solid var(--primary-color)",
                  }}
                >
                  <div
                    style={{
                      fontSize: "12px",
                      fontWeight: "600",
                      color: "var(--text-medium)",
                      marginBottom: "8px",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    Full Name
                  </div>
                  <div
                    style={{
                      fontSize: "18px",
                      fontWeight: "700",
                      color: "var(--text-dark)",
                    }}
                  >
                    {profile?.firstName} {profile?.lastName}
                  </div>
                </div>

                <div
                  style={{
                    padding: "20px",
                    background:
                      "linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)",
                    borderRadius: "12px",
                    borderLeft: "4px solid var(--accent-color)",
                  }}
                >
                  <div
                    style={{
                      fontSize: "12px",
                      fontWeight: "600",
                      color: "var(--text-medium)",
                      marginBottom: "8px",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    Email Address
                  </div>
                  <div
                    style={{
                      fontSize: "18px",
                      fontWeight: "700",
                      color: "var(--text-dark)",
                    }}
                  >
                    {profile?.email}
                  </div>
                </div>

                <div
                  style={{
                    padding: "20px",
                    background:
                      "linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)",
                    borderRadius: "12px",
                    borderLeft: "4px solid var(--success-color)",
                  }}
                >
                  <div
                    style={{
                      fontSize: "12px",
                      fontWeight: "600",
                      color: "var(--text-medium)",
                      marginBottom: "8px",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    Phone Number
                  </div>
                  <div
                    style={{
                      fontSize: "18px",
                      fontWeight: "700",
                      color: "var(--text-dark)",
                    }}
                  >
                    {profile?.phone || "Not provided"}
                  </div>
                </div>

                <div
                  style={{
                    padding: "20px",
                    background:
                      "linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)",
                    borderRadius: "12px",
                    borderLeft: "4px solid var(--warning-color)",
                  }}
                >
                  <div
                    style={{
                      fontSize: "12px",
                      fontWeight: "600",
                      color: "var(--text-medium)",
                      marginBottom: "8px",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    Date of Birth
                  </div>
                  <div
                    style={{
                      fontSize: "18px",
                      fontWeight: "700",
                      color: "var(--text-dark)",
                    }}
                  >
                    {profile?.dateOfBirth
                      ? new Date(profile.dateOfBirth).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )
                      : "Not provided"}
                  </div>
                </div>

                {user.userType === "Customer" && (
                  <div
                    style={{
                      padding: "20px",
                      background:
                        "linear-gradient(135deg, rgba(255, 0, 110, 0.05) 0%, rgba(255, 69, 0, 0.05) 100%)",
                      borderRadius: "12px",
                      borderLeft: "4px solid var(--accent-color)",
                    }}
                  ></div>
                )}
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="theme-park-form">
              <div className="theme-park-form-row">
                <div className="theme-park-form-group">
                  <label className="theme-park-label">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="theme-park-input"
                    required
                  />
                </div>

                <div className="theme-park-form-group">
                  <label className="theme-park-label">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="theme-park-input"
                    required
                  />
                </div>
              </div>

              <div className="theme-park-form-group">
                <label className="theme-park-label">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="theme-park-input"
                  required
                />
              </div>

              {/* Allow customers to change their username */}
              {user.userType === "Customer" && (
                <div className="theme-park-form-group">
                  <label className="theme-park-label">Username</label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className="theme-park-input"
                    placeholder="Choose a unique username"
                    required
                  />
                  {formErrors.username && (
                    <div
                      style={{
                        color: "#dc2626",
                        marginTop: "6px",
                        fontSize: "13px",
                      }}
                    >
                      {formErrors.username}
                    </div>
                  )}
                </div>
              )}

              <div className="theme-park-form-group">
                <label className="theme-park-label">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="theme-park-input"
                  placeholder="(555) 123-4567"
                />
              </div>

              <div className="theme-park-form-group">
                <label className="theme-park-label">Date of Birth</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  className="theme-park-input"
                />
              </div>

              {/* Allow customers to change their password here (blank by default) */}
              {user.userType === "Customer" && (
                <div className="theme-park-form-group">
                  <label className="theme-park-label">Password</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    placeholder="Leave blank to keep current password"
                    onChange={handleChange}
                    className="theme-park-input"
                  />
                </div>
              )}

              <div style={{ display: "flex", gap: "15px", marginTop: "10px" }}>
                <button
                  type="submit"
                  className="theme-park-btn theme-park-btn-success w-full"
                >
                  💾 Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="theme-park-btn theme-park-btn-outline w-full"
                >
                  ✖️ Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;
