import { useEffect, useState } from "react";
import { ticketAPI, ridesAPI } from "../api";
import "./ThemePark.css";

const defaultFormState = {
  typeName: "",
  basePrice: "",
  rideId: "",
  description: "",
};

const ManageTickets = () => {
  const [ticketTypes, setTicketTypes] = useState([]);
  const [discontinued, setDiscontinued] = useState([]);
  const [rides, setRides] = useState([]);
  const [formState, setFormState] = useState({ ...defaultFormState });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [restoringId, setRestoringId] = useState(null);
  const [removingId, setRemovingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeTab, setActiveTab] = useState("active");
  const [confirmDeleteTarget, setConfirmDeleteTarget] = useState(null);

  const parsedSelectedRideId = Number.parseInt(formState.rideId, 10);
  const selectedRideId = Number.isNaN(parsedSelectedRideId)
    ? null
    : parsedSelectedRideId;
  const assignedRideIds = new Set(
    ticketTypes
      .map((ticket) => ticket.rideId)
      .filter((rideId) => rideId !== null && rideId !== undefined)
  );
  const availableRides = rides.filter((ride) => {
    if (
      editingId &&
      selectedRideId !== null &&
      ride.ride_ID === selectedRideId
    ) {
      return true;
    }
    return !assignedRideIds.has(ride.ride_ID);
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError("");
        const [rideList, activeTickets, discontinuedTickets] = await Promise.all([
          ridesAPI.getAllRides(),
          ticketAPI.getTicketTypes(),
          ticketAPI.getDiscontinuedTicketTypes(),
        ]);
        setRides(rideList);
        setTicketTypes(activeTickets);
        setDiscontinued(discontinuedTickets);
        setConfirmDeleteTarget(null);
      } catch (err) {
        console.error("Error loading ticket types", err);
        setError("Unable to load ticket types. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const loadTicketData = async () => {
    try {
      const [activeTickets, discontinuedTickets] = await Promise.all([
        ticketAPI.getTicketTypes(),
        ticketAPI.getDiscontinuedTicketTypes(),
      ]);
      setTicketTypes(activeTickets);
      setDiscontinued(discontinuedTickets);
      setConfirmDeleteTarget(null);
    } catch (err) {
      console.error("Error refreshing ticket types", err);
      setError("Unable to refresh ticket types. Please try again.");
    }
  };

  const resetForm = () => {
    setFormState({ ...defaultFormState });
    setEditingId(null);
    setDeletingId(null);
    setRestoringId(null);
    setRemovingId(null);
    setConfirmDeleteTarget(null);
  };

  const handleEdit = (ticket) => {
    setEditingId(ticket.ticketTypeId);
    setFormState({
      typeName: ticket.typeName,
      basePrice: ticket.price?.toString() ?? "",
      rideId: ticket.rideId?.toString() ?? "",
      description: ticket.description ?? "",
    });
    setSuccess("");
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    const typeName = formState.typeName.trim();
    const basePrice = parseFloat(formState.basePrice);
    const rideId = parseInt(formState.rideId, 10);
    const description = formState.description.trim();

    if (!typeName) {
      setError("Please provide a ticket name.");
      setSubmitting(false);
      return;
    }

    if (Number.isNaN(basePrice) || basePrice <= 0) {
      setError("Base price must be greater than 0.");
      setSubmitting(false);
      return;
    }

    if (Number.isNaN(rideId)) {
      setError("Please select an associated ride.");
      setSubmitting(false);
      return;
    }

    const payload = {
      typeName,
      basePrice,
      rideId,
      description,
    };

    try {
      if (editingId) {
        await ticketAPI.updateTicketType(editingId, payload);
        setSuccess("Ticket type updated successfully.");
      } else {
        await ticketAPI.createTicketType(payload);
        setSuccess("New ticket type created successfully.");
      }

      resetForm();
      await loadTicketData();
    } catch (err) {
      console.error("Error saving ticket type", err);
      const responseMessage = err?.response?.data?.message;
      setError(responseMessage || "Unable to save ticket type. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (ticket) => {
    if (deletingId === ticket.ticketTypeId) {
      return;
    }

    const confirmed = window.confirm(
      `Mark ${ticket.typeName} as discontinued?`
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(ticket.ticketTypeId);
    setError("");
    setSuccess("");

    try {
      await ticketAPI.deleteTicketType(ticket.ticketTypeId);

      if (editingId === ticket.ticketTypeId) {
        resetForm();
      }

      setSuccess(`${ticket.typeName} moved to discontinued tickets.`);
      await loadTicketData();
    } catch (err) {
      console.error("Error discontinuing ticket type", err);
      const responseMessage = err?.response?.data?.message;
      setError(responseMessage || "Unable to discontinue ticket type.");
    } finally {
      setDeletingId(null);
    }
  };

  const handlePermanentDelete = async (ticket) => {
    if (removingId === ticket.ticketTypeId) {
      return;
    }

    setRemovingId(ticket.ticketTypeId);
    setError("");
    setSuccess("");

    try {
      await ticketAPI.permanentlyDeleteTicketType(ticket.ticketTypeId);

      if (editingId === ticket.ticketTypeId) {
        resetForm();
      }

      setSuccess(`${ticket.typeName} deleted from ticket offerings.`);
      await loadTicketData();
    } catch (err) {
      console.error("Error deleting ticket type", err);
      const responseMessage = err?.response?.data?.message;
      setError(responseMessage || "Unable to delete ticket type.");
    } finally {
      setRemovingId(null);
      setConfirmDeleteTarget(null);
    }
  };

  const handleRestore = async (ticket) => {
    if (restoringId === ticket.ticketTypeId) {
      return;
    }

    setRestoringId(ticket.ticketTypeId);
    setError("");
    setSuccess("");

    try {
      await ticketAPI.restoreTicketType(ticket.ticketTypeId);
      setSuccess(`${ticket.typeName} restored to active tickets.`);
      await loadTicketData();
    } catch (err) {
      console.error("Error restoring ticket type", err);
      const responseMessage = err?.response?.data?.message;
      setError(responseMessage || "Unable to restore ticket type.");
    } finally {
      setRestoringId(null);
    }
  };

  const formatPrice = (value) => Number(value || 0).toFixed(2);

  if (loading) {
    return (
      <div className="theme-park-page">
        <div className="theme-park-loading">
          <div className="theme-park-spinner"></div>
          <div className="theme-park-loading-text">Loading ticket types...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="theme-park-page">
      <div className="theme-park-container">
        <div className="theme-park-header">
          <h1 className="theme-park-title">🎟️ Manage Ticket Types</h1>
          <p className="theme-park-subtitle">
            Create tickets and link them to rides to tailor guest experiences.
          </p>
        </div>

        {error && (
          <div className="theme-park-alert theme-park-alert-error">
            <span style={{ fontSize: "24px" }}>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="theme-park-alert theme-park-alert-success">
            <span style={{ fontSize: "24px" }}>🎉</span>
            <span>{success}</span>
          </div>
        )}

        <div className="theme-park-card" style={{ marginBottom: "32px" }}>
          <div className="theme-park-card-header">
            <h3 className="theme-park-card-title">
              <span>{editingId ? "✏️" : "➕"}</span>{" "}
              {editingId ? "Update Ticket Type" : "Add New Ticket Type"}
            </h3>
            {editingId && (
              <button
                className="theme-park-btn theme-park-btn-outline theme-park-btn-sm"
                onClick={resetForm}
              >
                Cancel Edit
              </button>
            )}
          </div>

          {rides.length === 0 && (
            <div className="theme-park-alert theme-park-alert-info">
              <span style={{ fontSize: "24px" }}>ℹ️</span>
              <span>Create a ride first to start adding ticket types.</span>
            </div>
          )}

          {rides.length > 0 && !editingId && availableRides.length === 0 && (
            <div className="theme-park-alert theme-park-alert-info">
              <span style={{ fontSize: "24px" }}>ℹ️</span>
              <span>
                All rides already have active ticket types. Discontinue one to
                free it up.
              </span>
            </div>
          )}

          <form className="theme-park-form" onSubmit={handleSubmit}>
            <div className="theme-park-form-row">
              <div className="theme-park-form-group">
                <label className="theme-park-label">Ticket Name</label>
                <input
                  className="theme-park-input"
                  type="text"
                  value={formState.typeName}
                  maxLength={50}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      typeName: event.target.value,
                    }))
                  }
                  required
                />
              </div>

              <div className="theme-park-form-group">
                <label className="theme-park-label">Base Price</label>
                <input
                  className="theme-park-input"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formState.basePrice}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      basePrice: event.target.value,
                    }))
                  }
                  required
                />
              </div>

              <div className="theme-park-form-group">
                <label className="theme-park-label">Associated Ride</label>
                <select
                  className="theme-park-select"
                  value={formState.rideId}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      rideId: event.target.value,
                    }))
                  }
                  required
                  disabled={
                    rides.length === 0 || (!editingId && availableRides.length === 0)
                  }
                >
                  <option value="">Select a ride</option>
                  {availableRides.map((ride) => (
                    <option key={ride.ride_ID} value={ride.ride_ID}>
                      {ride.ride_Name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="theme-park-form-group">
              <label className="theme-park-label">Description</label>
              <textarea
                className="theme-park-textarea"
                rows={3}
                maxLength={255}
                value={formState.description}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    description: event.target.value,
                  }))
                }
                placeholder="Optional context for staff"
              />
            </div>

            <button
              type="submit"
              className="theme-park-btn theme-park-btn-primary theme-park-btn-lg"
              disabled={
                submitting ||
                rides.length === 0 ||
                (!editingId && availableRides.length === 0)
              }
            >
              {submitting
                ? "Saving..."
                : editingId
                ? "Save Changes"
                : "Create Ticket Type"}
            </button>
          </form>
        </div>

        <div className="theme-park-card">
          <div className="theme-park-card-header">
            <h3 className="theme-park-card-title">
              <span>🎟️</span> Ticket Types
            </h3>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <button
                type="button"
                className={`theme-park-btn theme-park-btn-sm ${
                  activeTab === "active"
                    ? "theme-park-btn-primary"
                    : "theme-park-btn-outline"
                }`}
                onClick={() => {
                  setActiveTab("active");
                  setConfirmDeleteTarget(null);
                }}
              >
                Active ({ticketTypes.length})
              </button>
              <button
                type="button"
                className={`theme-park-btn theme-park-btn-sm ${
                  activeTab === "discontinued"
                    ? "theme-park-btn-primary"
                    : "theme-park-btn-outline"
                }`}
                onClick={() => {
                  setActiveTab("discontinued");
                  setConfirmDeleteTarget(null);
                }}
              >
                Discontinued ({discontinued.length})
              </button>
            </div>
          </div>

          <div className="theme-park-table-container">
            <table className="theme-park-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Base Price</th>
                  <th>Ride</th>
                  <th>Description</th>
                  <th style={{ width: "120px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {(activeTab === "active" ? ticketTypes : discontinued).length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: "center", padding: "20px" }}>
                      {activeTab === "active"
                        ? "No ticket types configured yet."
                        : "No discontinued ticket types."}
                    </td>
                  </tr>
                ) : (
                  (activeTab === "active" ? ticketTypes : discontinued).map((ticket) => (
                    <tr key={ticket.ticketTypeId}>
                      <td>#{ticket.ticketTypeId}</td>
                      <td>{ticket.typeName}</td>
                      <td>${formatPrice(ticket.price)}</td>
                      <td>{ticket.rideName || "—"}</td>
                      <td>{ticket.description || "—"}</td>
                      <td>
                        <div style={{ display: "flex", gap: "8px" }}>
                          {activeTab === "active" ? (
                            <>
                              <button
                                className="theme-park-btn theme-park-btn-outline theme-park-btn-sm"
                                onClick={() => handleEdit(ticket)}
                              >
                                Edit
                              </button>
                              <button
                                className="theme-park-btn theme-park-btn-danger theme-park-btn-sm"
                                onClick={() => handleDelete(ticket)}
                                disabled={deletingId === ticket.ticketTypeId}
                              >
                                {deletingId === ticket.ticketTypeId
                                  ? "Updating..."
                                  : "Discontinue"}
                              </button>
                              <button
                                className="theme-park-btn theme-park-btn-outline theme-park-btn-sm"
                                style={{ borderColor: "#ef4444", color: "#ef4444" }}
                                onClick={() => {
                                  setConfirmDeleteTarget(ticket);
                                  setSuccess("");
                                  setError("");
                                }}
                                disabled={removingId === ticket.ticketTypeId}
                              >
                                Delete
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                className="theme-park-btn theme-park-btn-success theme-park-btn-sm"
                                onClick={() => handleRestore(ticket)}
                                disabled={restoringId === ticket.ticketTypeId}
                              >
                                {restoringId === ticket.ticketTypeId
                                  ? "Restoring..."
                                  : "Restore"}
                              </button>
                              <button
                                className="theme-park-btn theme-park-btn-outline theme-park-btn-sm"
                                style={{ borderColor: "#ef4444", color: "#ef4444" }}
                                onClick={() => {
                                  setConfirmDeleteTarget(ticket);
                                  setSuccess("");
                                  setError("");
                                }}
                                disabled={removingId === ticket.ticketTypeId}
                              >
                                Delete
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {confirmDeleteTarget && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(15, 23, 42, 0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
            zIndex: 80,
          }}
          onClick={() => setConfirmDeleteTarget(null)}
          role="presentation"
        >
          <div
            className="theme-park-card"
            style={{
              width: "100%",
              maxWidth: "420px",
              position: "relative",
              boxShadow: "0 25px 60px rgba(15,23,42,0.35)",
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              onClick={() => setConfirmDeleteTarget(null)}
              style={{
                position: "absolute",
                top: "16px",
                right: "16px",
                border: "none",
                background: "transparent",
                fontSize: "20px",
                cursor: "pointer",
              }}
              aria-label="Close delete confirmation"
            >
              ×
            </button>
            <div className="theme-park-card-header">
              <h3 className="theme-park-card-title">Confirm Delete</h3>
            </div>
            <div style={{ padding: "24px", display: "grid", gap: "16px" }}>
              <p style={{ margin: 0, color: "#475569", lineHeight: 1.6 }}>
                Are you sure you want to delete <strong>{confirmDeleteTarget.typeName}</strong>?
                Guests will no longer see this ticket option, but historical sales remain intact.
              </p>
              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  className="theme-park-btn theme-park-btn-outline"
                  onClick={() => setConfirmDeleteTarget(null)}
                  disabled={removingId === confirmDeleteTarget.ticketTypeId}
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button
                  className="theme-park-btn theme-park-btn-danger theme-park-btn-lg"
                  onClick={() => handlePermanentDelete(confirmDeleteTarget)}
                  disabled={removingId === confirmDeleteTarget.ticketTypeId}
                  style={{ flex: 1 }}
                >
                  {removingId === confirmDeleteTarget.ticketTypeId
                    ? "Deleting..."
                    : "Delete Ticket"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageTickets;
