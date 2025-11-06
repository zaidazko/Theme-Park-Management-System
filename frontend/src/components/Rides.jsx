import { useState, useEffect } from "react";
import { ridesAPI } from "../api";
import "./ThemePark.css";

const Rides = () => {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateRideModal, setShowCreateRideModal] = useState(false);

  const [createRideForm, setCreateRideForm] = useState({
    ride_Name: "",
    capacity: "",
    image: "https://media.istockphoto.com/id/186293315/photo/looping-roller-coaster.jpg?s=612x612&w=0&k=20&c=r0Uq8QvhEjoFOodlgaD_5gMOYOF4rbFxKIp6UOFrcJA=",
  });

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const isEmployee =
    currentUser.userType === "Employee" || currentUser.userType === "Manager";

  useEffect(() => {
    fetchRides();
  }, []);

  const fetchRides = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/rides`);
      if (!response.ok) throw new Error("Failed to fetch rides");
      const data = await response.json();
      setRides(data);
    } catch (err) {
      setError("Failed to load rides");
    } finally {
      setLoading(false);
    }
  };

  const getRideStatusBadge = (status) => {
    if (status === "Open" || status === "Operational") {
      return (
        <span className="theme-park-badge theme-park-badge-success">
          ✅ Open
        </span>
      );
    } else if (status === "Closed" || status === "Under Maintenance") {
      return (
        <span className="theme-park-badge theme-park-badge-danger">
          🔧 Closed
        </span>
      );
    } else {
      return (
        <span className="theme-park-badge theme-park-badge-warning">
          ⚠️ {status}
        </span>
      );
    }
  };

  const handleCreateRide = async () => {
    try{
      const rideData = {
        ride_Name: createRideForm.ride_Name,
        capacity: parseInt(createRideForm.capacity),
        image: createRideForm.image,
        status: "Operational",
      };
      await ridesAPI.createRide(rideData);
    } catch (err) {
      console.error("Failed to create ride", err);
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    container: {
      maxWidth: "80rem",
      margin: "0 auto",
      padding: "24px",
    },
    header: {
      marginBottom: "32px",
    },
    title: {
      fontSize: "30px",
      fontWeight: "bold",
      color: "#111827",
      marginBottom: "8px",
    },
    subtitle: {
      color: "#6b7280",
    },
    tabsContainer: {
      borderBottom: "1px solid #e5e7eb",
      marginBottom: "24px",
    },
    tabsNav: {
      marginBottom: "-1px",
      display: "flex",
      gap: "32px",
    },
    tabButton: {
      padding: "8px 4px",
      borderBottom: "2px solid",
      fontWeight: "500",
      fontSize: "14px",
      backgroundColor: "transparent",
      border: "none",
      cursor: "pointer",
    },
    card: {
      backgroundColor: "white",
      boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
      borderRadius: "8px",
    },
    cardContent: {
      padding: "20px 24px",
    },
    cardHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "16px",
    },
    cardTitle: {
      fontSize: "18px",
      fontWeight: "500",
      color: "#111827",
    },
    button: {
      backgroundColor: "#2563eb",
      color: "white",
      padding: "8px 16px",
      borderRadius: "6px",
      border: "none",
      cursor: "pointer",
    },
    buttonGreen: {
      backgroundColor: "#059669",
      color: "white",
      padding: "4px 12px",
      borderRadius: "6px",
      border: "none",
      cursor: "pointer",
    },
    table: {
      minWidth: "100%",
      borderCollapse: "separate",
      borderSpacing: "0",
    },
    tableHeader: {
      backgroundColor: "#f9fafb",
    },
    tableHeaderCell: {
      padding: "12px 24px",
      textAlign: "left",
      fontSize: "12px",
      fontWeight: "500",
      color: "#6b7280",
      textTransform: "uppercase",
      letterSpacing: "0.05em",
    },
    tableRow: {
      backgroundColor: "white",
    },
    tableCell: {
      padding: "16px 24px",
      whiteSpace: "nowrap",
      fontSize: "14px",
      color: "#6b7280",
    },
    tableCellName: {
      padding: "16px 24px",
      whiteSpace: "nowrap",
      fontSize: "14px",
      fontWeight: "500",
      color: "#111827",
    },
    linkButton: {
      backgroundColor: "transparent",
      border: "none",
      cursor: "pointer",
      marginRight: "12px",
    },
    linkButtonBlue: {
      color: "#2563eb",
    },
    linkButtonRed: {
      color: "#dc2626",
    },
    grid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
      gap: "16px",
    },
    gridItem: {
      border: "1px solid #e5e7eb",
      borderRadius: "8px",
      padding: "16px",
      cursor: "pointer",
    },
    modal: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(75, 85, 99, 0.5)",
      overflowY: "auto",
      height: "100%",
      width: "100%",
      zIndex: 50,
    },
    modalContent: {
      position: "relative",
      top: "80px",
      margin: "0 auto",
      padding: "20px",
      border: "1px solid #e5e7eb",
      width: "384px",
      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
      borderRadius: "6px",
      backgroundColor: "white",
    },
    formGroup: {
      marginBottom: "16px",
    },
    label: {
      display: "block",
      fontSize: "14px",
      fontWeight: "500",
      color: "#374151",
      marginBottom: "4px",
    },
    input: {
      display: "block",
      width: "100%",
      border: "1px solid #d1d5db",
      borderRadius: "6px",
      padding: "8px 12px",
      fontSize: "14px",
    },
    select: {
      display: "block",
      width: "100%",
      border: "1px solid #d1d5db",
      borderRadius: "6px",
      padding: "8px 12px",
      fontSize: "14px",
    },
    modalFooter: {
      display: "flex",
      justifyContent: "flex-end",
      gap: "12px",
      marginTop: "24px",
    },
    buttonSecondary: {
      padding: "8px 16px",
      border: "1px solid #d1d5db",
      borderRadius: "6px",
      color: "#374151",
      backgroundColor: "transparent",
      cursor: "pointer",
    },
    loading: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "256px",
    },
    loadingText: {
      fontSize: "20px",
    },
  };

  if (loading) {
    return (
      <div className="theme-park-page">
        <div className="theme-park-loading">
          <div className="theme-park-spinner"></div>
          <div className="theme-park-loading-text">Loading rides...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="theme-park-page">
      <div className="theme-park-container-wide">
        <div className="theme-park-header">
          <h1 className="theme-park-title">🎢 Our Rides</h1>
          <p className="theme-park-subtitle">
            Experience the ultimate thrills and excitement
          </p>
        </div>

        {error && (
          <div className="theme-park-alert theme-park-alert-error">
            <span style={{ fontSize: "24px" }}>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {rides.length === 0 ? (
          <div className="theme-park-empty">
            <div className="theme-park-empty-icon">🎢</div>
            <div className="theme-park-empty-title">No Rides Available</div>
            <div className="theme-park-empty-text">
              Check back later for exciting attractions!
            </div>
          </div>
        ) : (
          <div>
            {isEmployee && (<div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              margin: "20px 0px 50px 0px",
            }}
            >
              <button
                className="theme-park-btn theme-park-btn-primary theme-park-btn-sm"
                onClick={() => setShowCreateRideModal(true)}
              >
                New Ride
              </button>
            </div>)}
            <div className="theme-park-grid">
              {rides.map((ride) => (
                <div
                  key={ride.ride_ID}
                  className="theme-park-card"
                  style={{ padding: "0", overflow: "hidden" }}
                >
                  <div
                    style={{
                      position: "relative",
                      height: "250px",
                      overflow: "hidden",
                      background:
                        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    }}
                  >
                    <img
                      src={
                        ride.image ||
                        "https://media.istockphoto.com/id/186293315/photo/looping-roller-coaster.jpg?s=612x612&w=0&k=20&c=r0Uq8QvhEjoFOodlgaD_5gMOYOF4rbFxKIp6UOFrcJA="
                      }
                      alt={ride.ride_Name}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        transition: "transform 0.3s ease",
                      }}
                      onMouseOver={(e) =>
                        (e.target.style.transform = "scale(1.1)")
                      }
                      onMouseOut={(e) => (e.target.style.transform = "scale(1)")}
                    />
                    <div
                      style={{
                        position: "absolute",
                        top: "15px",
                        right: "15px",
                      }}
                    >
                      {getRideStatusBadge(ride.status)}
                    </div>
                  </div>
                  <div style={{ padding: "25px", textAlign: "center" }}>
                    <h3
                      style={{
                        fontSize: "22px",
                        fontWeight: "700",
                        color: "var(--text-dark)",
                        marginBottom: "10px",
                      }}
                    >
                      🎢 {ride.ride_Name}
                    </h3>
                    <div
                      style={{ fontSize: "14px", color: "var(--text-medium)" }}
                    >
                      Capacity: {ride.capacity} riders
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Create Ride Modal */}
        {showCreateRideModal && (
          <div style={styles.modal}>
            <div style={styles.modalContent}>
              <h3
                style={{
                  fontSize: "18px",
                  fontWeight: "500",
                  color: "#111827",
                  marginBottom: "16px",
                }}
              >
                Create New Ride
              </h3>
              <div style={styles.formGroup}>
                <label style={styles.label}>Ride Name</label>
                <input
                  type="text"
                  value={createRideForm.ride_Name}
                  onChange={(e) =>
                    setCreateRideForm({
                      ...createRideForm,
                      ride_Name: e.target.value,
                    })
                  }
                  style={styles.input}
                  required
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Capacity</label>
                <input
                  type="number"
                  value={createRideForm.capacity}
                  onChange={(e) =>
                    setCreateRideForm({
                      ...createRideForm,
                      capacity: e.target.value,
                    })
                  }
                  style={styles.input}
                  required
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Image</label>
                <input
                  type="text"
                  value={createRideForm.image}
                  onChange={(e) =>
                    setCreateRideForm({
                      ...createRideForm,
                      image: e.target.value,
                    })
                  }
                  style={styles.input}
                />
              </div>
              <div style={styles.modalFooter}>
                <button
                  onClick={() => setShowCreateRideModal(false)}
                  style={styles.buttonSecondary}
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateRide}
                  style={styles.button}
                >
                  Create Ride
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Rides;
