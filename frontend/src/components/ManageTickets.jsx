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
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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
              <span>🎟️</span> Active Ticket Types
            </h3>
            <div className="theme-park-badge theme-park-badge-info">
              {ticketTypes.length} item{ticketTypes.length === 1 ? "" : "s"}
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
                {ticketTypes.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: "center", padding: "20px" }}>
                      No ticket types configured yet.
                    </td>
                  </tr>
                ) : (
                  ticketTypes.map((ticket) => (
                    <tr key={ticket.ticketTypeId}>
                      <td>#{ticket.ticketTypeId}</td>
                      <td>{ticket.typeName}</td>
                      <td>${formatPrice(ticket.price)}</td>
                      <td>{ticket.rideName || "—"}</td>
                      <td>{ticket.description || "—"}</td>
                      <td>
                        <div style={{ display: "flex", gap: "8px" }}>
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
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="theme-park-card" style={{ marginTop: "24px" }}>
          <div className="theme-park-card-header">
            <h3 className="theme-park-card-title">
              <span>🗂️</span> Discontinued Ticket Types
            </h3>
            <div className="theme-park-badge theme-park-badge-warning">
              {discontinued.length} item{discontinued.length === 1 ? "" : "s"}
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
                {discontinued.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: "center", padding: "20px" }}>
                      No discontinued ticket types.
                    </td>
                  </tr>
                ) : (
                  discontinued.map((ticket) => (
                    <tr key={ticket.ticketTypeId}>
                      <td>#{ticket.ticketTypeId}</td>
                      <td>{ticket.typeName}</td>
                      <td>${formatPrice(ticket.price)}</td>
                      <td>{ticket.rideName || "—"}</td>
                      <td>{ticket.description || "—"}</td>
                      <td>
                        <button
                          className="theme-park-btn theme-park-btn-success theme-park-btn-sm"
                          onClick={() => handleRestore(ticket)}
                          disabled={restoringId === ticket.ticketTypeId}
                        >
                          {restoringId === ticket.ticketTypeId
                            ? "Restoring..."
                            : "Restore"}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageTickets;
