import React, { useState, useEffect } from "react";
import { ridesAPI, maintenanceRequestAPI } from "../api";
import "./ThemePark.css";

const RequestMaintenance = ({ user }) => {
  const [rides, setRides] = useState([]);
  const [selectedRide, setSelectedRide] = useState(null);
  const [maintenanceReason, setMaintenanceReason] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  useEffect(() => {
    loadRides();
  }, []);

  const loadRides = async () => {
    try {
      const ridesData = await ridesAPI.getAllRides();
      setRides(ridesData);
      setLoading(false);
    } catch (error) {
      console.error("Error loading rides:", error);
      setLoading(false);
    }
  };

  const handleRideSelect = (ride) => {
    setSelectedRide(ride);
    setMaintenanceReason(""); // Clear previous reason when selecting new ride
  };

  const handleSubmit = async (e) => {
    setError("")
    setSuccessMessage("")

    e.preventDefault();
    if (!selectedRide || !maintenanceReason.trim()) {
      setError("Please select a ride and provide a reason for maintenance.");
      return;
    }

    if (!user || !user.employeeId) {
      setError("Error: User information not available. Please log in again.");
      return;
    }

    setSubmitting(true);
    try {
      const requestData = {
        rideId: selectedRide.ride_ID,
        reportedBy: user.employeeId,
        issueDescription: maintenanceReason.trim(),
      };

      await maintenanceRequestAPI.createMaintenanceRequest(requestData);

      setSuccessMessage("Maintenance request submitted successfully!");
      setMaintenanceReason("");
      setSelectedRide(null);
    } catch (error) {
      console.error("Error submitting maintenance request:", error);
      setError("Error submitting maintenance request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const isRideUnderMaintenance = (ride) => {
    return ride.status === "Under Maintenance" || ride.status === "Maintenance";
  };

  const styles = {
    container: {
      maxWidth: "800px",
      margin: "0 auto",
      padding: "24px",
    },
    header: {
      marginBottom: "32px",
    },
    title: {
      fontSize: "28px",
      fontWeight: "bold",
      color: "#111827",
      marginBottom: "8px",
    },
    subtitle: {
      color: "#6b7280",
      fontSize: "16px",
    },
    ridesGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
      gap: "16px",
      marginBottom: "32px",
    },
    rideCard: {
      border: "2px solid #e5e7eb",
      borderRadius: "8px",
      padding: "16px",
      cursor: "pointer",
      transition: "all 0.2s ease",
      backgroundColor: "#ffffff",
    },
    rideCardSelected: {
      border: "2px solid #3b82f6",
      backgroundColor: "#eff6ff",
    },
    rideCardMaintenance: {
      border: "2px solid #ef4444",
      backgroundColor: "#fef2f2",
      opacity: 0.6,
      cursor: "not-allowed",
    },
    rideName: {
      fontSize: "18px",
      fontWeight: "600",
      color: "#111827",
      marginBottom: "8px",
    },
    rideNameMaintenance: {
      color: "#dc2626",
    },
    rideStatus: {
      fontSize: "14px",
      fontWeight: "500",
      padding: "4px 8px",
      borderRadius: "4px",
      display: "inline-block",
    },
    statusOperational: {
      backgroundColor: "#dcfce7",
      color: "#166534",
    },
    statusMaintenance: {
      backgroundColor: "#fecaca",
      color: "#dc2626",
    },
    capacity: {
      fontSize: "14px",
      color: "#6b7280",
      marginTop: "8px",
    },
    formSection: {
      backgroundColor: "#ffffff",
      border: "1px solid #e5e7eb",
      borderRadius: "8px",
      padding: "24px",
    },
    formTitle: {
      fontSize: "20px",
      fontWeight: "600",
      color: "#111827",
      marginBottom: "16px",
    },
    selectedRide: {
      backgroundColor: "#f3f4f6",
      padding: "12px",
      borderRadius: "6px",
      marginBottom: "16px",
    },
    selectedRideText: {
      fontSize: "16px",
      fontWeight: "500",
      color: "#374151",
    },
    formGroup: {
      marginBottom: "20px",
    },
    label: {
      display: "block",
      fontSize: "14px",
      fontWeight: "500",
      color: "#374151",
      marginBottom: "8px",
    },
    textarea: {
      width: "100%",
      minHeight: "100px",
      padding: "12px",
      border: "1px solid #d1d5db",
      borderRadius: "6px",
      fontSize: "14px",
      fontFamily: "inherit",
      resize: "vertical",
      boxSizing: "border-box",
    },
    textareaFocus: {
      outline: "none",
      borderColor: "#3b82f6",
      boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.1)",
    },
    button: {
      backgroundColor: "#3b82f6",
      color: "white",
      border: "none",
      borderRadius: "6px",
      padding: "12px 24px",
      fontSize: "16px",
      fontWeight: "500",
      cursor: "pointer",
      transition: "background-color 0.2s ease",
    },
    buttonHover: {
      backgroundColor: "#2563eb",
    },
    buttonDisabled: {
      backgroundColor: "#9ca3af",
      cursor: "not-allowed",
    },
    loading: {
      textAlign: "center",
      padding: "40px",
      color: "#6b7280",
    },
    noRides: {
      textAlign: "center",
      padding: "40px",
      color: "#6b7280",
    },
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>Loading rides...</div>
      </div>
    );
  }

  if (rides.length === 0) {
    return (
      <div style={styles.container}>
        <div style={styles.noRides}>No rides available.</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Request Maintenance</h1>
        <p style={styles.subtitle}>
          Select a ride that needs maintenance and provide details about the
          issue.
        </p>
      </div>

      {error && (
          <div className="theme-park-alert theme-park-alert-error">
            <span style={{ fontSize: "24px" }}>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className = "theme-park-alert theme-park-alert-success">
            <span style={{ fontSize: "24px" }}>🎉</span>
            <span>{successMessage}</span>
          </div>
        )}

      <div style={styles.ridesGrid}>
        {rides.map((ride) => {
          const isUnderMaintenance = isRideUnderMaintenance(ride);
          const isSelected = selectedRide?.ride_ID === ride.ride_ID;

          return (
            <div
              key={ride.ride_ID}
              style={{
                ...styles.rideCard,
                ...(isSelected ? styles.rideCardSelected : {}),
                ...(isUnderMaintenance ? styles.rideCardMaintenance : {}),
              }}
              onClick={() => !isUnderMaintenance && handleRideSelect(ride)}
            >
              <div
                style={{
                  ...styles.rideName,
                  ...(isUnderMaintenance ? styles.rideNameMaintenance : {}),
                }}
              >
                {ride.ride_Name}
              </div>
              <div
                style={{
                  ...styles.rideStatus,
                  ...(isUnderMaintenance
                    ? styles.statusMaintenance
                    : styles.statusOperational),
                }}
              >
                {isUnderMaintenance ? "Under Maintenance" : "Operational"}
              </div>
              <div style={styles.capacity}>
                Capacity: {ride.capacity} people
              </div>
            </div>
          );
        })}
      </div>

      {selectedRide && (
        <div style={styles.formSection}>
          <h2 style={styles.formTitle}>Maintenance Request Details</h2>

          <div style={styles.selectedRide}>
            <div style={styles.selectedRideText}>
              Selected Ride: <strong>{selectedRide.ride_Name}</strong>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={styles.formGroup}>
              <label style={styles.label} htmlFor="maintenanceReason">
                Reason for Maintenance (10 characters minimum)*
              </label>
              <textarea
                id="maintenanceReason"
                value={maintenanceReason}
                onChange={(e) => setMaintenanceReason(e.target.value)}
                placeholder="Please describe the issue or reason for maintenance..."
                style={styles.textarea}
                required
              />
            </div>

            <button
              type="submit"
              disabled={submitting || !maintenanceReason.trim()}
              style={{
                ...styles.button,
                ...(submitting || !maintenanceReason.trim()
                  ? styles.buttonDisabled
                  : {}),
              }}
              onMouseEnter={(e) => {
                if (!submitting && maintenanceReason.trim()) {
                  e.target.style.backgroundColor = "#2563eb";
                }
              }}
              onMouseLeave={(e) => {
                if (!submitting && maintenanceReason.trim()) {
                  e.target.style.backgroundColor = "#3b82f6";
                }
              }}
            >
              {submitting ? "Submitting..." : "Request Maintenance"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default RequestMaintenance;
