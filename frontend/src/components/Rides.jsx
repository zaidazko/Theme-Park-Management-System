import { useState, useEffect, useMemo, useCallback } from "react";
import { ridesAPI, ticketAPI, ReviewsAPI } from "../api";
import "./ThemePark.css";

const DEFAULT_IMAGE =
  "https://media.istockphoto.com/id/186293315/photo/looping-roller-coaster.jpg?s=612x612&w=0&k=20&c=r0Uq8QvhEjoFOodlgaD_5gMOYOF4rbFxKIp6UOFrcJA=";

const formatCurrency = (value) => {
  const amount = Number(value);
  if (Number.isNaN(amount)) {
    return "$0.00";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);
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

const toRideId = (ride) =>
  ride?.ride_ID ?? ride?.Ride_ID ?? ride?.rideId ?? ride?.RideId ?? null;

const toRideName = (ride) =>
  ride?.ride_Name ?? ride?.Ride_Name ?? ride?.name ?? "Ride";

const normalizeStatus = (status) => {
  if (!status) {
    return "Operational";
  }

  const safe = String(status).trim().toLowerCase();
  if (["open", "operational", "running"].includes(safe)) {
    return "Operational";
  }

  if (["closed", "maintenance", "under maintenance", "offline"].includes(safe)) {
    return "Under Maintenance";
  }

  return status;
};

const getRideDescription = (ride) =>
  ride?.description ??
  ride?.Description ??
  ride?.rideDescription ??
  ride?.Ride_Description ??
  "Strap in for high-energy thrills across the park.";

const Rides = () => {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateRideModal, setShowCreateRideModal] = useState(false);
  const [showEditRideModal, setShowEditRideModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false)
  const [selectedRide, setSelectedRide] = useState(null);
  const [rideFormData, setRideFormData] = useState({
    ride_Name: "",
    capacity: "",
    image: "",
    description: "",
    heightRequirement: ""
  });
  const [createRideForm, setCreateRideForm] = useState({
    ride_Name: "",
    capacity: "",
    image: DEFAULT_IMAGE,
    description: "",
    heightRequirement: ""
  });
  const [showRideDetailModal, setShowRideDetailModal] = useState(false);
  const [detailRide, setDetailRide] = useState(null);
  const [detailTickets, setDetailTickets] = useState([]);
  const [detailReviews, setDetailReviews] = useState([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");
  const [rideMessage, setRideMessage] = useState("");

  const currentUser = useMemo(
    () => JSON.parse(localStorage.getItem("user") || "{}"),
    []
  );
  const isEmployee =
    currentUser.userType === "Employee" || currentUser.userType === "Manager";

  const loadRides = useCallback(async () => {
    setLoading(true);
    try {
      const data = await ridesAPI.getAllRides();
      setRides(Array.isArray(data) ? data : []);
      setError("");
    } catch (err) {
      console.error("Failed to load rides", err);
      setError("Failed to load rides");
      setTimeout(() => setError(""), 3000);
      setRides([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRides();
  }, [loadRides]);

  const getRideStatusBadge = (status) => {
    const normalized = normalizeStatus(status);
    if (normalized === "Operational") {
      return (
        <span className="theme-park-badge theme-park-badge-success">✅ Open</span>
      );
    }

    if (normalized === "Under Maintenance") {
      return (
        <span className="theme-park-badge theme-park-badge-danger">🔧 Closed</span>
      );
    }
    return (
      <span className="theme-park-badge theme-park-badge-warning">⚠️ {normalized}</span>
    );
  };

  const handleCreateRide = async () => {
    setRideMessage("")
    setError("")
    try {
      const rideData = {
        ride_Name: createRideForm.ride_Name,
        capacity: Number.parseInt(createRideForm.capacity, 10) || 0,
        image: createRideForm.image || DEFAULT_IMAGE,
        status: "Operational",
        description: createRideForm.description,
        heightRequirement: createRideForm.heightRequirement
      };

      await ridesAPI.createRide(rideData);

      setCreateRideForm({
        ride_Name: "",
        capacity: "",
        image: DEFAULT_IMAGE,
        description: "",
        heightRequirement: ""
      });
      setShowCreateRideModal(false);
      await loadRides();
      setRideMessage("Ride created successfully!");
      setTimeout(() => setRideMessage(""), 3000);
    } catch (err) {
      console.error("Failed to create ride", err);
      setError("Unable to create ride. Please try again.");
      setTimeout(() => setError(""), 3000);
    }
  };

  const handleConfirmDeleteRide = (ride) => {
    setSelectedRide(ride);
    setShowDeleteConfirmModal(true);
  };

  const handleDeleteRide = async () => {
    setRideMessage("")
    setError("")
    if(!selectedRide){
      return;
    }

    try {
      await ridesAPI.deleteRide(selectedRide.ride_ID);
      setShowDeleteConfirmModal(false)
      setRideMessage("Ride deleted successfully!")
      setTimeout(() => setRideMessage(""), 3000);
    } catch (err) {
      console.error("Failed to delete ride", err);
      setError("Unable to delete this ride. Please try again.");
      setTimeout(() => setError(""), 3000);
      return;
    } finally {
      await loadRides();
    }
  };

  const handleEditRide = (ride) => {
    setSelectedRide(ride);
    setRideFormData({
      ride_Name: ride.ride_Name || "",
      capacity: ride.capacity || "",
      image: ride.image || "",
      description: ride.description || "",
      heightRequirement: ride.height_Requirement || ""
    });
    setShowEditRideModal(true);
  };

  const handleSaveRide = async () => {
    setRideMessage("")
    setError("")
    if (!selectedRide) {
      return;
    }

    try {
      const updateRideData = {
        Ride_ID: selectedRide.ride_ID,
        Ride_Name: rideFormData.ride_Name || selectedRide.ride_Name,
        Capacity: Number.parseInt(rideFormData.capacity, 10) || selectedRide.capacity,
        Image: rideFormData.image || selectedRide.image || DEFAULT_IMAGE,
        Status: selectedRide.status || "Operational",
        Description: rideFormData.description || selectedRide.description,
        Height_Requirement: rideFormData.heightRequirement || selectedRide.heightRequirement
      };

      await ridesAPI.updateRideData(selectedRide.ride_ID, updateRideData);
      setShowEditRideModal(false);
      setSelectedRide(null);
      await loadRides();
      setRideMessage("Changes saved successfully!")
      setTimeout(() => setRideFormData(""), 3000);
    } catch (err) {
      console.error("Error saving ride", err);
      setError("Unable to save changes. Please try again.");
      setTimeout(() => setError(""), 3000);
    }
  };

  const handleViewDetails = async (ride) => {
    console.log(ride)
    setDetailRide(ride);
    setShowRideDetailModal(true);
    setDetailLoading(true);
    setDetailError("");

    const rideIdValue = toRideId(ride);
    if (!rideIdValue && rideIdValue !== 0) {
      setDetailTickets([]);
      setDetailReviews([]);
      setDetailLoading(false);
      setDetailError("Unable to find ride details.");
      return;
    }

    const rideIdKey = String(rideIdValue);

    try {
      const [tickets, reviews] = await Promise.all([
        ticketAPI.getTicketTypes(),
        ReviewsAPI.getAllReviews(),
      ]);

      const matchingTickets = (tickets || [])
        .filter((ticket) => {
          const ticketRideId =
            ticket?.rideId ?? ticket?.Ride_ID ?? ticket?.ride_ID ?? ticket?.RideId ?? null;
          if (ticketRideId === null || ticketRideId === undefined) {
            return false;
          }

          return String(ticketRideId) === rideIdKey;
        })
        .map((ticket) => {
          const ticketId = Number(
            ticket?.ticketTypeId ??
              ticket?.TicketType_ID ??
              ticket?.id ??
              ticket?.ID ??
              0
          );

          return {
            id: ticketId,
            ticketTypeId: ticketId,
            name: ticket?.typeName ?? ticket?.Type_Name ?? "Admission",
            description:
              ticket?.description ??
              ticket?.Description ??
              "Enjoy full access to this attraction.",
            price: Number(ticket?.price ?? ticket?.Price ?? ticket?.Base_Price ?? 0),
          };
        })
        .filter((ticket) => Number.isFinite(ticket.price) && ticket.id);

      const matchingReviews = (reviews || [])
        .filter((review) => {
          const reviewRideId =
            review?.rideID ?? review?.Ride_ID ?? review?.rideId ?? review?.RideId ?? null;
          if (reviewRideId === null || reviewRideId === undefined) {
            return false;
          }

          return String(reviewRideId) === rideIdKey;
        })
        .map((review) => ({
          id: review?.reviewID ?? review?.Review_ID ?? review?.id,
          score: Number(review?.score ?? review?.Score ?? 0),
          feedback: review?.feedback ?? review?.Feedback ?? "",
          customerName: review?.customerName ?? "Guest",
          date: review?.reviewDate ?? review?.Date ?? null,
        }))
        .sort((a, b) => {
          const aTime = a.date ? new Date(a.date).getTime() : 0;
          const bTime = b.date ? new Date(b.date).getTime() : 0;
          return bTime - aTime;
        })
        .slice(0, 3);

      setDetailTickets(matchingTickets);
      setDetailReviews(matchingReviews);
    } catch (err) {
      console.error("Failed to load ride details", err);
      setDetailTickets([]);
      setDetailReviews([]);
      setDetailError("Ride details are unavailable. Please try again later.");
    } finally {
      setDetailLoading(false);
    }
  };

  const closeRideDetails = () => {
    setShowRideDetailModal(false);
    setDetailRide(null);
    setDetailTickets([]);
    setDetailReviews([]);
    setDetailError("");
  };

  const detailDescription = useMemo(() => {
    const ticketWithDescription = detailTickets.find(
      (ticket) => typeof ticket.description === "string" && ticket.description.trim().length > 0
    );

    if (ticketWithDescription) {
      return ticketWithDescription.description;
    }

    return detailRide ? getRideDescription(detailRide) : "";
  }, [detailRide, detailTickets]);

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
      marginLeft: "140px"
    },
    modalContent: {
      position: "relative",
      top: "80px",
      margin: "0 auto",
      padding: "20px",
      border: "1px solid #e5e7eb",
      width: "450px",
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
    detailOverlay: {
      position: "fixed",
      inset: 0,
      backgroundColor: "rgba(15, 23, 42, 0.6)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px",
      zIndex: 70,
    },
    detailCard: {
      backgroundColor: "#ffffff",
      borderRadius: "20px",
      width: "min(720px, 100%)",
      maxHeight: "90vh",
      overflowY: "auto",
      boxShadow: "0 32px 60px rgba(15, 23, 42, 0.35)",
      position: "relative",
    },
    detailImage: {
      width: "100%",
      height: "260px",
      objectFit: "cover",
    },
    detailBody: {
      padding: "28px",
      display: "flex",
      flexDirection: "column",
      gap: "20px",
    },
    detailSection: {
      backgroundColor: "#f8fafc",
      borderRadius: "14px",
      padding: "18px",
      display: "flex",
      flexDirection: "column",
      gap: "16px",
    },
    detailClose: {
      position: "absolute",
      top: "16px",
      right: "16px",
      width: "40px",
      height: "40px",
      borderRadius: "9999px",
      border: "none",
      backgroundColor: "rgba(15, 23, 42, 0.75)",
      color: "#ffffff",
      fontSize: "20px",
      cursor: "pointer",
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
        <div 
          className="theme-park-header"
          style={{
            textAlign: "center",
            position: "relative",
            marginBottom: "40px",
          }}
        >
          <h1 className="theme-park-title">🎢 Our Rides</h1>          
          
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              marginTop: "8px",
            }}
          >

            {isEmployee && (
                <button
                  className="theme-park-btn theme-park-btn-primary theme-park-btn-lg"
                  onClick={() => setShowCreateRideModal(true)}
                  style={{
                    position: "absolute",
                    left: 0,
                    marginBottom: "10px"
                  }}
                >
                  New Ride
                </button>
            )}
        
            <p className="theme-park-subtitle">
              Experience the ultimate thrills and excitement
            </p>
        
          </div>

        </div>

        {error && (
          <div className="theme-park-alert theme-park-alert-error">
            <span style={{ fontSize: "24px" }}>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {rideMessage && (
          <div className = "theme-park-alert theme-park-alert-success">
            <span style={{ fontSize: "24px" }}>🎉</span>
            <span>{rideMessage}</span>
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
                        DEFAULT_IMAGE
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
                    {!isEmployee && (
                      <div
                        style={{
                          marginTop: "20px",
                          display: "flex",
                          justifyContent: "center",
                        }}
                      >
                        <button
                          onClick={() => handleViewDetails(ride)}
                          className="theme-park-btn theme-park-btn-primary theme-park-btn-sm"
                        >
                          View Details
                        </button>
                      </div>
                    )}
                    {isEmployee && (
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-around",
                          alignItems: "center",
                          margin: "20px 0px 20px 0px",
                        }}
                      >
                        
                        <button
                          onClick={() => handleEditRide(ride)}
                          className='theme-park-btn theme-park-btn-sm theme-park-btn-outline'
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => handleConfirmDeleteRide(ride)}
                          className='theme-park-btn theme-park-btn-sm theme-park-btn-danger'
                        >
                          Delete
                        </button>

                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Create Ride Modal */}
        {showCreateRideModal && (
          <div style={styles.modal}>
            <div style={{...styles.modalContent}}>
              <h3 className="theme-park-card-title theme-park-modal-header">
                Create New Ride
              </h3>
              <div className="theme-park-form-row" style={{marginTop:"10px"}}>
                <label className="theme-park-label">Ride Name</label>
                <input
                  type="text"
                  value={createRideForm.ride_Name}
                  onChange={(e) =>
                    setCreateRideForm({
                      ...createRideForm,
                      ride_Name: e.target.value,
                    })
                  }
                  className="theme-park-input"
                  required
                />
              </div>
              <div className="theme-park-form-row" style={{marginTop:"10px"}}>
                <label className="theme-park-label">Capacity</label>
                <input
                  type="number"
                  value={createRideForm.capacity}
                  onChange={(e) =>
                    setCreateRideForm({
                      ...createRideForm,
                      capacity: e.target.value,
                    })
                  }
                  className="theme-park-input"
                  required
                />
              </div>
              <div className="theme-park-form-row" style={{marginTop:"10px"}}>
                <label className="theme-park-label">Image</label>
                <input
                  type="text"
                  value={createRideForm.image}
                  onChange={(e) =>
                    setCreateRideForm({
                      ...createRideForm,
                      image: e.target.value,
                    })
                  }
                  className="theme-park-input"
                />
              </div>
              
              <div className="theme-park-form-row" style={{marginTop:"10px"}}>
                <label className="theme-park-label">Description</label>
                <input
                  type="text"
                  value={createRideForm.description}
                  onChange={(e) =>
                    setCreateRideForm({
                      ...createRideForm,
                      description: e.target.value,
                    })
                  }
                  className="theme-park-input"
                />
              </div>

              <div className="theme-park-form-row" style={{marginTop:"10px"}}>
                <label className="theme-park-label">Height Requirement (Inches)</label>
                <input
                  type="number"
                  value={createRideForm.heightRequirement}
                  onChange={(e) =>
                    setCreateRideForm({
                      ...createRideForm,
                      heightRequirement: e.target.value,
                    })
                  }
                  className="theme-park-input"
                />
              </div>

              <div style={styles.modalFooter}>
                <button
                  onClick={() => setShowCreateRideModal(false)}
                  className="theme-park-btn theme-park-btn-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateRide}
                  className="theme-park-btn theme-park-btn-sm theme-park-btn-primary"
                >
                  Create Ride
                </button>
              </div>
            </div>
          </div>
        )}

        {/*Edit Ride Modal */}
        {showEditRideModal && (
          <div style={styles.modal}>
            <div style={styles.modalContent}>
              <h3 className="theme-park-card-title theme-park-modal-header">
              Edit Ride
              </h3>

              <div className="theme-park-form-row" style={{marginTop:"10px"}}>
                <label className="theme-park-label">Ride Name</label>
                <input
                  type="text"
                  value={rideFormData.ride_Name}
                  onChange={(e) =>
                    setRideFormData({
                      ...rideFormData,
                      ride_Name: e.target.value,
                    })
                  }
                  className="theme-park-input"
                />
              </div>

              <div className="theme-park-form-row" style={{marginTop:"10px"}}>
                <label className="theme-park-label">Capacity</label>
                
                <input
                  type="number"
                  value={rideFormData.capacity}
                  onChange={(e) =>
                    setRideFormData({
                      ...rideFormData,
                      capacity: e.target.value,
                    })
                  }
                  className="theme-park-input"
                />
              </div>

              <div className="theme-park-form-row" style={{marginTop:"10px"}}>
                <label className="theme-park-label">Image</label>

                <input
                  type="text"
                  value={rideFormData.image}
                  onChange = {(e) =>
                    setRideFormData({
                      ...rideFormData,
                      image: e.target.value,
                    })
                  }
                  className="theme-park-input"
                />

              </div>

              <div className="theme-park-form-row" style={{marginTop:"10px"}}>
                <label className="theme-park-label">Description</label>

                <input
                  type="text"
                  value={rideFormData.description}
                  onChange = {(e) =>
                    setRideFormData({
                      ...rideFormData,
                      description: e.target.value,
                    })
                  }
                  className="theme-park-input"
                />

              </div>

              <div className="theme-park-form-row" style={{marginTop:"10px"}}>
                <label className="theme-park-label">Height Requirement (Inches)</label>

                <input
                  type="number"
                  value={rideFormData.heightRequirement}
                  onChange = {(e) =>
                    setRideFormData({
                      ...rideFormData,
                      heightRequirement: e.target.value,
                    })
                  }
                  className="theme-park-input"
                />

              </div>

              <div style={styles.modalFooter}>
                <button
                  onClick={() => setShowEditRideModal(false)}
                  className="theme-park-btn theme-park-btn-sm"
                >
                  Cancel
                </button>
                
                <button
                  onClick={handleSaveRide}
                  className="theme-park-btn theme-park-btn-sm theme-park-btn-primary"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {showDeleteConfirmModal && (
          <div style={styles.modal}>
            <div style={{...styles.modalContent, width: "500px", height: "150px", top:"35%"}}>
              <h3 className="theme-park-card-title">
                Are you sure you want to delete this ride?
              </h3>

              <div className = "theme-park-form-row"></div>

              <div style={{...styles.modalFooter, justifyContent: "space-evenly"}}>
                <button
                  onClick={() => setShowDeleteConfirmModal(false)}
                  className='theme-park-btn theme-park-btn-sm theme-park-btn-outline'
                >
                  Cancel
                </button>

                <button
                  onClick={handleDeleteRide}
                  className='theme-park-btn theme-park-btn-sm theme-park-btn-danger'
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}

        {showRideDetailModal && detailRide && !isEmployee && (
          <div
            style={styles.detailOverlay}
            onClick={closeRideDetails}
            role="dialog"
            aria-modal="true"
            aria-label="Ride details"
          >
            <div
              style={styles.detailCard}
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                style={styles.detailClose}
                onClick={closeRideDetails}
                aria-label="Close ride details"
              >
                ×
              </button>

              <img
                src={detailRide?.image || detailRide?.Image || DEFAULT_IMAGE}
                alt={toRideName(detailRide)}
                style={styles.detailImage}
                onError={(event) => {
                  event.currentTarget.onerror = null;
                  event.currentTarget.src = DEFAULT_IMAGE;
                }}
              />

              <div style={styles.detailBody}>
                <div>
                  <h2
                    style={{
                      fontSize: "28px",
                      fontWeight: 800,
                      marginBottom: "6px",
                      color: "#0f172a",
                    }}
                  >
                    🎢 {toRideName(detailRide)}
                  </h2>
                  <div style={{ color: "#475569", display: "flex", gap: "12px", flexWrap: "wrap" }}>
                    <span>👥 Capacity: {detailRide?.capacity ?? detailRide?.Capacity ?? "—"}</span>
                    <span>📏 Height Requirement: {detailRide?.height_Requirement ? `${detailRide?.height_Requirement}"` : "Any Height"}</span>
                    <span>{getRideStatusBadge(detailRide?.status ?? detailRide?.Status)}</span>
                  </div>
                </div>

                <div style={{ color: "#1f2937", lineHeight: 1.6 }}>
                  {detailDescription}
                </div>

                {detailError && (
                  <div className="theme-park-alert theme-park-alert-error">
                    <span style={{ fontSize: "20px" }}>⚠️</span>
                    <span>{detailError}</span>
                  </div>
                )}

                {detailLoading ? (
                  <div style={{ textAlign: "center", padding: "36px 0" }}>
                    Loading ride details...
                  </div>
                ) : (
                  <>
                    <div style={styles.detailSection}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          gap: "12px",
                        }}
                      >
                        <div
                          style={{
                            fontSize: "12px",
                            textTransform: "uppercase",
                            color: "#64748b",
                            fontWeight: 700,
                            letterSpacing: "0.08em",
                          }}
                        >
                          Ticket Options
                        </div>
                        <span className="theme-park-badge theme-park-badge-info">Plan your visit</span>
                      </div>

                      {detailTickets.length === 0 ? (
                        <div style={{ color: "#475569", lineHeight: 1.5 }}>
                          Ticket pricing information will be available soon. Please check back later.
                        </div>
                      ) : (
                        detailTickets.map((ticket) => (
                          <div
                            key={ticket.id}
                            style={{
                              background: "linear-gradient(135deg, rgba(59, 130, 246, 0.08), rgba(14, 165, 233, 0.08))",
                              border: "1px solid rgba(59, 130, 246, 0.25)",
                              borderRadius: "16px",
                              padding: "18px",
                              display: "flex",
                              flexDirection: "column",
                              gap: "12px",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                gap: "16px",
                              }}
                            >
                              <div>
                                <div style={{ fontWeight: 700, fontSize: "16px", color: "#0f172a" }}>
                                  {ticket.name}
                                </div>
                                <div style={{ fontSize: "13px", color: "#475569", marginTop: "4px", lineHeight: 1.5 }}>
                                  {ticket.description}
                                </div>
                              </div>
                              <div style={{ textAlign: "right" }}>
                                <div style={{ fontSize: "20px", fontWeight: 800, color: "#1d4ed8" }}>
                                  {formatCurrency(ticket.price)}
                                </div>
                                <div style={{ fontSize: "11px", color: "#64748b" }}>per guest</div>
                              </div>
                            </div>

                          </div>
                        ))
                      )}
                    </div>

                    <div style={styles.detailSection}>
                      <div
                        style={{
                          fontSize: "12px",
                          textTransform: "uppercase",
                          color: "#64748b",
                          fontWeight: 700,
                          letterSpacing: "0.08em",
                        }}
                      >
                        Recent Reviews
                      </div>
                      {detailReviews.length === 0 ? (
                        <div style={{ color: "#475569", lineHeight: 1.5 }}>
                          No reviews yet. Be the first to share your experience!
                        </div>
                      ) : (
                        detailReviews.map((review) => (
                          <div
                            key={review.id}
                            style={{
                              border: "1px solid #e2e8f0",
                              borderRadius: "12px",
                              padding: "14px",
                              backgroundColor: "#ffffff",
                              display: "flex",
                              flexDirection: "column",
                              gap: "8px",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                fontWeight: 600,
                              }}
                            >
                              <span>⭐ {review.score}/5</span>
                              <span style={{ fontSize: "12px", color: "#64748b" }}>
                                {formatDate(review.date)}
                              </span>
                            </div>
                            <div style={{ fontSize: "14px", color: "#1f2937", lineHeight: 1.5 }}>
                              {review.feedback || "No written feedback provided."}
                            </div>
                            <div style={{ fontSize: "12px", color: "#94a3b8" }}>
                              {review.customerName}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Rides;
