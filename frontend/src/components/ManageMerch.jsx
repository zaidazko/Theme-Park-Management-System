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
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [useCustomCategory, setUseCustomCategory] = useState(false);

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
    setUseCustomCategory(false);
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
            <div className="theme-park-badge theme-park-badge-info">
              {commodities.length} item{commodities.length === 1 ? "" : "s"}
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
                {commodities.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: "center", padding: "20px" }}>
                      No merchandise configured yet.
                    </td>
                  </tr>
                ) : (
                  commodities.map((commodity) => (
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
              <span>🗂️</span> Discontinued Merchandise
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
                  <th>Stock</th>
                  <th>Category</th>
                  <th>Image</th>
                  <th>Description</th>
                  <th style={{ width: "120px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {discontinued.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: "center", padding: "20px" }}>
                      No discontinued merchandise.
                    </td>
                  </tr>
                ) : (
                  discontinued.map((item) => (
                    <tr key={item.commodityTypeId}>
                      <td>#{item.commodityTypeId}</td>
                      <td>{item.commodityName}</td>
                      <td>${Number(item.basePrice).toFixed(2)}</td>
                      <td>{item.stockQuantity}</td>
                      <td>
                        {item.displayCategory || item.category || "Uncategorized"}
                      </td>
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
                        <button
                          className="theme-park-btn theme-park-btn-success theme-park-btn-sm"
                          onClick={() => handleRestore(item)}
                          disabled={restoringId === item.commodityTypeId}
                        >
                          {restoringId === item.commodityTypeId
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

export default ManageMerch;
