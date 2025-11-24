import { useEffect, useMemo, useState } from "react";
import { commodityAPI } from "../api";
import "./ThemePark.css";

const defaultFormState = {
  commodityName: "",
  basePrice: "",
  stockQuantity: "",
  description: "",
  displayCategory: "",
  customCategory: "",
  imageUrl: "",
};

const DEFAULT_IMAGE_URL =
  "https://www.shutterstock.com/shutterstock/photos/2450891049/display_1500/stock-vector-no-image-no-picture-available-on-white-background-2450891049.jpg";

const ManageMerch = () => {
  const [commodities, setCommodities] = useState([]);
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
  const [useCustomCategory, setUseCustomCategory] = useState(false);
  const [confirmDeleteTarget, setConfirmDeleteTarget] = useState(null);
  const [activeTab, setActiveTab] = useState("active");

  useEffect(() => {
    loadMerchandiseData();
  }, []);

  const loadMerchandiseData = async () => {
    try {
      setLoading(true);
      setError("");
      const [active, discontinuedItems] = await Promise.all([
        commodityAPI.getCommodityTypes(),
        commodityAPI.getDiscontinuedCommodityTypes(),
      ]);
      setCommodities(active);
      setDiscontinued(discontinuedItems);
      setConfirmDeleteTarget(null);
    } catch (err) {
      console.error("Error loading commodity types", err);
      setError("Unable to load merchandise. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const categoryOptions = useMemo(() => {
    const defaults = [
      "Apparel",
      "Accessories",
      "Toys",
      "Souvenirs",
      "Home",
      "Collectibles",
    ];

    const collected = new Set(defaults);

    [...commodities, ...discontinued].forEach((item) => {
      const label =
        item.displayCategory || item.category || item.commodityCategory;
      if (label) {
        collected.add(label);
      }
    });

    return Array.from(collected).sort((a, b) => a.localeCompare(b));
  }, [commodities, discontinued]);

  const resetForm = () => {
    setFormState(defaultFormState);
    setEditingId(null);
    setDeletingId(null);
    setRestoringId(null);
    setRemovingId(null);
    setUseCustomCategory(false);
    setConfirmDeleteTarget(null);
  };

  const handleEdit = (commodity) => {
    setEditingId(commodity.commodityTypeId);
    const existingCategory =
      commodity.displayCategory || commodity.category || "";
    const categoryInOptions = existingCategory
      ? categoryOptions.includes(existingCategory)
      : false;
    setUseCustomCategory(existingCategory ? !categoryInOptions : false);
    setFormState({
      commodityName: commodity.commodityName,
      basePrice: commodity.basePrice?.toString() ?? "",
      stockQuantity: commodity.stockQuantity?.toString() ?? "",
      description: commodity.description ?? "",
      displayCategory: categoryInOptions ? existingCategory : "",
      customCategory: categoryInOptions ? "" : existingCategory,
      imageUrl: commodity.imageUrl ?? "",
    });
    setSuccess("");
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    const commodityName = formState.commodityName.trim();
    const basePrice = parseFloat(formState.basePrice);
    const stockQuantity = parseInt(formState.stockQuantity, 10);
    const description = formState.description.trim();
    const selectedCategory = useCustomCategory
      ? formState.customCategory.trim()
      : formState.displayCategory.trim();
    const providedImageUrl = formState.imageUrl.trim();

    if (!commodityName) {
      setError("Please provide a merchandise name.");
      setSubmitting(false);
      return;
    }

    if (Number.isNaN(basePrice) || basePrice <= 0) {
      setError("Base price must be greater than 0.");
      setSubmitting(false);
      return;
    }

    if (Number.isNaN(stockQuantity) || stockQuantity < 0) {
      setError("Stock quantity must be zero or higher.");
      setSubmitting(false);
      return;
    }

    if (!selectedCategory) {
      setError("Select a category for this merchandise item.");
      setSubmitting(false);
      return;
    }

    if (providedImageUrl && !/^https?:\/\//i.test(providedImageUrl)) {
      setError("Image URL must start with http:// or https:// when provided.");
      setSubmitting(false);
      return;
    }

    const payload = {
      commodityName,
      basePrice,
      stockQuantity,
      description,
      category: "merchandise",
      displayCategory: selectedCategory,
      imageUrl: providedImageUrl || DEFAULT_IMAGE_URL,
    };

    try {
      if (editingId) {
        await commodityAPI.updateCommodityType(editingId, payload);
        setSuccess("Merchandise updated successfully.");
      } else {
        await commodityAPI.createCommodityType(payload);
        setSuccess("New merchandise created successfully.");
      }

      resetForm();
      await loadMerchandiseData();
    } catch (err) {
      console.error("Error saving merchandise", err);
      setError("Unable to save merchandise. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commodity) => {
    if (deletingId === commodity.commodityTypeId) {
      return;
    }

    const confirmed = window.confirm(
      `Mark ${commodity.commodityName} as discontinued?`
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(commodity.commodityTypeId);
    setError("");
    setSuccess("");

    try {
      await commodityAPI.deleteCommodityType(commodity.commodityTypeId);

      if (editingId === commodity.commodityTypeId) {
        resetForm();
      }

      setSuccess(`${commodity.commodityName} moved to discontinued merchandise.`);
      await loadMerchandiseData();
    } catch (err) {
      console.error("Error deleting merchandise", err);
      const responseMessage = err?.response?.data?.message;
      setError(responseMessage || "Unable to delete merchandise.");
    } finally {
      setDeletingId(null);
    }
  };

  const handlePermanentDelete = async (commodity) => {
    if (removingId === commodity.commodityTypeId) {
      return;
    }

    setRemovingId(commodity.commodityTypeId);
    setError("");
    setSuccess("");

    try {
      await commodityAPI.permanentlyDeleteCommodityType(commodity.commodityTypeId);

      if (editingId === commodity.commodityTypeId) {
        resetForm();
      }

      setSuccess(`${commodity.commodityName} deleted from the merchandise catalog.`);
      await loadMerchandiseData();
    } catch (err) {
      console.error("Error deleting merchandise", err);
      const responseMessage = err?.response?.data?.message;
      setError(responseMessage || "Unable to delete merchandise.");
    } finally {
      setRemovingId(null);
      setConfirmDeleteTarget(null);
    }
  };

  const handleRestore = async (item) => {
    if (restoringId === item.commodityTypeId) {
      return;
    }

    setRestoringId(item.commodityTypeId);
    setError("");
    setSuccess("");

    try {
      await commodityAPI.restoreCommodityType(item.commodityTypeId);
      setSuccess(`${item.commodityName} restored to active merchandise.`);
      await loadMerchandiseData();
    } catch (err) {
      console.error("Error restoring merchandise", err);
      const responseMessage = err?.response?.data?.message;
      setError(responseMessage || "Unable to restore merchandise.");
    } finally {
      setRestoringId(null);
    }
  };

  if (loading) {
    return (
      <div className="theme-park-page">
        <div className="theme-park-loading">
          <div className="theme-park-spinner"></div>
          <div className="theme-park-loading-text">Loading merchandise...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="theme-park-page">
      <div className="theme-park-container">
        <div className="theme-park-header">
          <h1 className="theme-park-title">🛒 Manage Merchandise</h1>
          <p className="theme-park-subtitle">
            Create new items and keep the merchandise catalog up to date.
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
              {editingId ? "Update Merchandise" : "Add New Merchandise"}
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
                <label className="theme-park-label">Name</label>
                <input
                  className="theme-park-input"
                  type="text"
                  value={formState.commodityName}
                  maxLength={50}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      commodityName: event.target.value,
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
                <label className="theme-park-label">Stock Quantity</label>
                <input
                  className="theme-park-input"
                  type="number"
                  min="0"
                  step="1"
                  value={formState.stockQuantity}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      stockQuantity: event.target.value,
                    }))
                  }
                  required
                />
              </div>
            </div>

            <div className="theme-park-form-row">
              <div className="theme-park-form-group">
                <label className="theme-park-label">Display Category</label>
                <select
                  className="theme-park-select"
                  value={useCustomCategory ? "__custom" : formState.displayCategory}
                  onChange={(event) => {
                    const value = event.target.value;
                    if (value === "__custom") {
                      setUseCustomCategory(true);
                      setFormState((prev) => ({
                        ...prev,
                        displayCategory: "",
                      }));
                    } else {
                      setUseCustomCategory(false);
                      setFormState((prev) => ({
                        ...prev,
                        displayCategory: value,
                        customCategory: "",
                      }));
                    }
                    setError("");
                    setSuccess("");
                  }}
                >
                  <option value="">Select a category</option>
                  {categoryOptions.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                  <option value="__custom">Custom category...</option>
                </select>
                {useCustomCategory && (
                  <input
                    className="theme-park-input"
                    type="text"
                    placeholder="Enter category name"
                    value={formState.customCategory}
                    onChange={(event) =>
                      setFormState((prev) => ({
                        ...prev,
                        customCategory: event.target.value,
                      }))
                    }
                    style={{ marginTop: "8px" }}
                    maxLength={50}
                  />
                )}
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
                  placeholder="https://example.com/image.jpg"
                  maxLength={500}
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
                placeholder="Short description for team members"
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
                : "Create Merchandise"}
            </button>
          </form>
        </div>

        <div className="theme-park-card">
          <div className="theme-park-card-header">
            <h3 className="theme-park-card-title">
              <span>📦</span> Merchandise Catalog
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
                Active ({commodities.length})
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
                  <th>Stock</th>
                  <th>Category</th>
                  <th>Image</th>
                  <th>Description</th>
                  <th style={{ width: "120px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {(activeTab === "active" ? commodities : discontinued).length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: "center", padding: "20px" }}>
                      {activeTab === "active"
                        ? "No merchandise configured yet."
                        : "No discontinued merchandise."}
                    </td>
                  </tr>
                ) : (
                  (activeTab === "active" ? commodities : discontinued).map((commodity) => (
                    <tr key={commodity.commodityTypeId}>
                      <td>#{commodity.commodityTypeId}</td>
                      <td>{commodity.commodityName}</td>
                      <td>${Number(commodity.basePrice).toFixed(2)}</td>
                      <td>{commodity.stockQuantity}</td>
                      <td>
                        {commodity.displayCategory ||
                          commodity.category ||
                          "Uncategorized"}
                      </td>
                      <td>
                        {commodity.imageUrl ? (
                          <a
                            href={commodity.imageUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: "var(--primary-color)" }}
                          >
                            {commodity.imageUrl === DEFAULT_IMAGE_URL
                              ? "Default"
                              : "View"}
                          </a>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td>{commodity.description || "—"}</td>
                      <td>
                        <div style={{ display: "flex", gap: "8px" }}>
                          {activeTab === "active" ? (
                            <>
                              <button
                                className="theme-park-btn theme-park-btn-outline theme-park-btn-sm"
                                onClick={() => handleEdit(commodity)}
                              >
                                Edit
                              </button>
                              <button
                                className="theme-park-btn theme-park-btn-danger theme-park-btn-sm"
                                onClick={() => handleDelete(commodity)}
                                disabled={deletingId === commodity.commodityTypeId}
                              >
                                {deletingId === commodity.commodityTypeId
                                  ? "Discontinuing..."
                                  : "Discontinue"}
                              </button>
                              <button
                                className="theme-park-btn theme-park-btn-outline theme-park-btn-sm"
                                style={{ borderColor: "#ef4444", color: "#ef4444" }}
                                onClick={() => {
                                  setConfirmDeleteTarget(commodity);
                                  setSuccess("");
                                  setError("");
                                }}
                                disabled={removingId === commodity.commodityTypeId}
                              >
                                Delete
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                className="theme-park-btn theme-park-btn-success theme-park-btn-sm"
                                onClick={() => handleRestore(commodity)}
                                disabled={restoringId === commodity.commodityTypeId}
                              >
                                {restoringId === commodity.commodityTypeId
                                  ? "Restoring..."
                                  : "Restore"}
                              </button>
                              <button
                                className="theme-park-btn theme-park-btn-outline theme-park-btn-sm"
                                style={{ borderColor: "#ef4444", color: "#ef4444" }}
                                onClick={() => {
                                  setConfirmDeleteTarget(commodity);
                                  setSuccess("");
                                  setError("");
                                }}
                                disabled={removingId === commodity.commodityTypeId}
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
                Are you sure you want to delete <strong>{confirmDeleteTarget.commodityName}</strong>?
                This removes the item from merchandise listings, but any past sales stay in reports.
              </p>
              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  className="theme-park-btn theme-park-btn-outline"
                  onClick={() => setConfirmDeleteTarget(null)}
                  disabled={removingId === confirmDeleteTarget.commodityTypeId}
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button
                  className="theme-park-btn theme-park-btn-danger theme-park-btn-lg"
                  onClick={() => handlePermanentDelete(confirmDeleteTarget)}
                  disabled={removingId === confirmDeleteTarget.commodityTypeId}
                  style={{ flex: 1 }}
                >
                  {removingId === confirmDeleteTarget.commodityTypeId
                    ? "Deleting..."
                    : "Delete Item"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageMerch;
