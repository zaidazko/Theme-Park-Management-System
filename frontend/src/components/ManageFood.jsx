import { useEffect, useState } from "react";
import { menuAPI } from "../api";
import "./ThemePark.css";

const defaultFormState = {
  foodName: "",
  basePrice: "",
  description: "",
  imageUrl: "",
};

const DEFAULT_IMAGE_URL =
  "https://www.shutterstock.com/shutterstock/photos/2450891049/display_1500/stock-vector-no-image-no-picture-available-on-white-background-2450891049.jpg";

const ManageFood = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [discontinued, setDiscontinued] = useState([]);
  const [formState, setFormState] = useState(defaultFormState);
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

  useEffect(() => {
    loadMenuData();
  }, []);

  const loadMenuData = async () => {
    try {
      setLoading(true);
      setError("");
      const [active, discontinuedItems] = await Promise.all([
        menuAPI.getMenuTypes(),
        menuAPI.getDiscontinuedMenuTypes(),
      ]);
      setMenuItems(active);
      setDiscontinued(discontinuedItems);
  setConfirmDeleteTarget(null);
    } catch (err) {
      console.error("Error loading menu types", err);
      setError("Unable to load menu items. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormState(defaultFormState);
    setEditingId(null);
    setDeletingId(null);
    setRestoringId(null);
    setRemovingId(null);
  setConfirmDeleteTarget(null);
  };

  const handleEdit = (item) => {
    setEditingId(item.menuTypeId);
    setFormState({
      foodName: item.foodName,
      basePrice: item.basePrice?.toString() ?? "",
      description: item.description ?? "",
      imageUrl: item.imageUrl ?? "",
    });
    setSuccess("");
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    const foodName = formState.foodName.trim();
    const basePrice = parseFloat(formState.basePrice);
    const description = formState.description.trim();
    const providedImageUrl = formState.imageUrl.trim();

    if (!foodName) {
      setError("Please provide a food name.");
      setSubmitting(false);
      return;
    }

    if (Number.isNaN(basePrice) || basePrice <= 0) {
      setError("Base price must be greater than 0.");
      setSubmitting(false);
      return;
    }

    if (providedImageUrl && !/^https?:\/\//i.test(providedImageUrl)) {
      setError("Image URL must start with http:// or https:// when provided.");
      setSubmitting(false);
      return;
    }

    const payload = {
      foodName,
      basePrice,
      description,
      imageUrl: providedImageUrl || DEFAULT_IMAGE_URL,
    };

    try {
      if (editingId) {
        await menuAPI.updateMenuType(editingId, payload);
        setSuccess("Menu item updated successfully.");
      } else {
        await menuAPI.createMenuType(payload);
        setSuccess("New menu item created successfully.");
      }

      resetForm();
      await loadMenuData();
    } catch (err) {
      console.error("Error saving menu item", err);
      setError("Unable to save menu item. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const [selectedItem, setSelectedItem] = useState(null)
  const [showConfirmDiscontinue, setShowConfirmDiscontinue] = useState(false)

  const handleDiscontinueConfirm = (item) => {
    setSelectedItem(item);
    setShowConfirmDiscontinue(true);
  };

  const handleDelete = async (item) => {
    if (deletingId === item.menuTypeId) {
      return;
    }

    setShowConfirmDiscontinue(false);

    setDeletingId(item.menuTypeId);
    setError("");
    setSuccess("");

    try {
      await menuAPI.deleteMenuType(item.menuTypeId);

      if (editingId === item.menuTypeId) {
        resetForm();
      }

      setSuccess(`${item.foodName} moved to discontinued menu items.`);
      await loadMenuData();
    } catch (err) {
      console.error("Error discontinuing menu item", err);
      const responseMessage = err?.response?.data?.message;
      setError(responseMessage || "Unable to discontinue menu item.");
    } finally {
      setDeletingId(null);
    }
  };

  const handlePermanentDelete = async (item) => {
    if (removingId === item.menuTypeId) {
      return;
    }

    setRemovingId(item.menuTypeId);
    setError("");
    setSuccess("");

    try {
      await menuAPI.permanentlyDeleteMenuType(item.menuTypeId);

      if (editingId === item.menuTypeId) {
        resetForm();
      }

      setSuccess(`${item.foodName} deleted from the menu.`);
      await loadMenuData();
    } catch (err) {
      console.error("Error deleting menu item", err);
      const responseMessage = err?.response?.data?.message;
      setError(responseMessage || "Unable to delete menu item.");
    } finally {
      setRemovingId(null);
  setConfirmDeleteTarget(null);
    }
  };

  const handleRestore = async (item) => {
    if (restoringId === item.menuTypeId) {
      return;
    }

    setRestoringId(item.menuTypeId);
    setError("");
    setSuccess("");

    try {
      await menuAPI.restoreMenuType(item.menuTypeId);
      setSuccess(`${item.foodName} restored to active menu items.`);
      await loadMenuData();
    } catch (err) {
      console.error("Error restoring menu item", err);
      const responseMessage = err?.response?.data?.message;
      setError(responseMessage || "Unable to restore menu item.");
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
          <div className="theme-park-loading-text">Loading menu items...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="theme-park-page">
      <div className="theme-park-container">
        <div className="theme-park-header">
          <h1 className="theme-park-title">🍔 Manage Food Menu</h1>
          <p className="theme-park-subtitle">
            Add new food options and keep the menu fresh for guests.
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
              {editingId ? "Update Menu Item" : "Add New Menu Item"}
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

          <form className="theme-park-form" onSubmit={handleSubmit}>
            <div className="theme-park-form-row">
              <div className="theme-park-form-group">
                <label className="theme-park-label">Food Name</label>
                <input
                  className="theme-park-input"
                  type="text"
                  value={formState.foodName}
                  maxLength={50}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      foodName: event.target.value,
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
              />
            </div>

            <div className="theme-park-form-group">
              <label className="theme-park-label">Image URL</label>
              <input
                className="theme-park-input"
                type="url"
                value={formState.imageUrl}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    imageUrl: event.target.value,
                  }))
                }
                placeholder="https://example.com/food.jpg"
                maxLength={500}
              />
            </div>

            <button
              type="submit"
              className="theme-park-btn theme-park-btn-primary theme-park-btn-lg"
              disabled={submitting}
            >
              {submitting
                ? "Saving..."
                : editingId
                ? "Save Changes"
                : "Create Menu Item"}
            </button>
          </form>
        </div>

        <div className="theme-park-card">
          <div className="theme-park-card-header">
            <h3 className="theme-park-card-title">
              <span>📋</span> Menu Items
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
                Active ({menuItems.length})
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
                  <th>Image</th>
                  <th>Description</th>
                  <th style={{ width: "120px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {(activeTab === "active" ? menuItems : discontinued).length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: "center", padding: "20px" }}>
                      {activeTab === "active"
                        ? "No menu items configured yet."
                        : "No discontinued menu items."}
                    </td>
                  </tr>
                ) : (
                  (activeTab === "active" ? menuItems : discontinued).map((item) => (
                    <tr key={item.menuTypeId}>
                      <td>#{item.menuTypeId}</td>
                      <td>{item.foodName}</td>
                      <td>${formatPrice(item.basePrice)}</td>
                      <td>
                        {item.imageUrl ? (
                          <a
                            href={item.imageUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: "var(--primary-color)" }}
                          >
                            {item.imageUrl === DEFAULT_IMAGE_URL
                              ? "Default"
                              : "View"}
                          </a>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td>{item.description || "—"}</td>
                      <td>
                        <div style={{ display: "flex", gap: "8px" }}>
                          {activeTab === "active" ? (
                            <>
                              <button
                                className="theme-park-btn theme-park-btn-outline theme-park-btn-sm"
                                onClick={() => handleEdit(item)}
                              >
                                Edit
                              </button>
                              <button
                                className="theme-park-btn theme-park-btn-danger theme-park-btn-sm"
                                onClick={() => handleDiscontinueConfirm(item)}
                                disabled={deletingId === item.menuTypeId}
                              >
                                {deletingId === item.menuTypeId
                                  ? "Updating..."
                                  : "Discontinue"}
                              </button>
                              <button
                                className="theme-park-btn theme-park-btn-outline theme-park-btn-sm"
                                style={{ borderColor: "#ef4444", color: "#ef4444" }}
                                onClick={() => {
                                  setConfirmDeleteTarget(item);
                                  setSuccess("");
                                  setError("");
                                }}
                                disabled={removingId === item.menuTypeId}
                              >
                                Delete
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                className="theme-park-btn theme-park-btn-success theme-park-btn-sm"
                                onClick={() => handleRestore(item)}
                                disabled={restoringId === item.menuTypeId}
                              >
                                {restoringId === item.menuTypeId
                                  ? "Restoring..."
                                  : "Restore"}
                              </button>
                              <button
                                className="theme-park-btn theme-park-btn-outline theme-park-btn-sm"
                                style={{ borderColor: "#ef4444", color: "#ef4444" }}
                                onClick={() => {
                                  setConfirmDeleteTarget(item);
                                  setSuccess("");
                                  setError("");
                                }}
                                disabled={removingId === item.menuTypeId}
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
                Are you sure you want to delete
                {" "}
                <strong>{confirmDeleteTarget.foodName}</strong>
                ? Guests and staff will no longer see this menu item, but past sales will stay in reports.
              </p>
              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  className="theme-park-btn theme-park-btn-outline"
                  onClick={() => setConfirmDeleteTarget(null)}
                  disabled={removingId === confirmDeleteTarget.menuTypeId}
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button
                  className="theme-park-btn theme-park-btn-danger theme-park-btn-lg"
                  onClick={() => handlePermanentDelete(confirmDeleteTarget)}
                  disabled={removingId === confirmDeleteTarget.menuTypeId}
                  style={{ flex: 1 }}
                >
                  {removingId === confirmDeleteTarget.menuTypeId
                    ? "Deleting..."
                    : "Delete Item"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showConfirmDiscontinue && (
        <div
          style={{
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
          }}
        >
          <div
            style={{
              position: "relative",
              top: "35%",
              margin: "0 auto",
              padding: "20px",
              border: "1px solid #e5e7eb",
              width: "450px",
              boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
              borderRadius: "6px",
              backgroundColor: "white", 
            }}
          >
            <h3>Mark {selectedItem.foodName} as discontinued?</h3>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "12px",
                marginTop: "24px",
              }}
            >
              <button
                onClick={() => setShowConfirmDiscontinue(false)}
                className='theme-park-btn theme-park-btn-sm theme-park-btn-outline'
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(selectedItem)}
                className='theme-park-btn theme-park-btn-sm theme-park-btn-danger'
              >
                Confirm
              </button>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default ManageFood;
