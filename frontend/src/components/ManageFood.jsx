import { useEffect, useState } from "react";
import { menuAPI } from "../api";
import "./ThemePark.css";

const defaultFormState = {
  foodName: "",
  basePrice: "",
  description: "",
  imageUrl: "",
};

const ManageFood = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [discontinued, setDiscontinued] = useState([]);
  const [formState, setFormState] = useState(defaultFormState);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [restoringId, setRestoringId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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
    const imageUrl = formState.imageUrl.trim();

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

    if (imageUrl && !/^https?:\/\//i.test(imageUrl)) {
      setError("Image URL must start with http:// or https:// when provided.");
      setSubmitting(false);
      return;
    }

    const payload = {
      foodName,
      basePrice,
      description,
      imageUrl,
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

  const handleDelete = async (item) => {
    if (deletingId === item.menuTypeId) {
      return;
    }

    const confirmed = window.confirm(
      `Mark ${item.foodName} as discontinued?`
    );

    if (!confirmed) {
      return;
    }

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
                placeholder="Optional description for staff reference"
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
              <span>📋</span> Active Menu Items
            </h3>
            <div className="theme-park-badge theme-park-badge-info">
              {menuItems.length} item{menuItems.length === 1 ? "" : "s"}
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
                {menuItems.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: "center", padding: "20px" }}>
                      No menu items configured yet.
                    </td>
                  </tr>
                ) : (
                  menuItems.map((item) => (
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
                            View
                          </a>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td>{item.description || "—"}</td>
                      <td>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <button
                            className="theme-park-btn theme-park-btn-outline theme-park-btn-sm"
                            onClick={() => handleEdit(item)}
                          >
                            Edit
                          </button>
                          <button
                            className="theme-park-btn theme-park-btn-danger theme-park-btn-sm"
                            onClick={() => handleDelete(item)}
                            disabled={deletingId === item.menuTypeId}
                          >
                            {deletingId === item.menuTypeId
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
              <span>🗂️</span> Discontinued Menu Items
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
                  <th>Image</th>
                  <th>Description</th>
                  <th style={{ width: "120px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {discontinued.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: "center", padding: "20px" }}>
                      No discontinued menu items.
                    </td>
                  </tr>
                ) : (
                  discontinued.map((item) => (
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
                            View
                          </a>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td>{item.description || "—"}</td>
                      <td>
                        <button
                          className="theme-park-btn theme-park-btn-success theme-park-btn-sm"
                          onClick={() => handleRestore(item)}
                          disabled={restoringId === item.menuTypeId}
                        >
                          {restoringId === item.menuTypeId
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

export default ManageFood;
