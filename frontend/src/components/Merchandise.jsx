import { useCallback, useEffect, useMemo, useState } from "react";
import "./ThemePark.css";

const CART_KEY = "marketplace_cart_v1";

const requiresSizeSelection = (item) => {
  const name = (item?.commodityName || "").toLowerCase();
  return (
    name.includes("tee") ||
    name.includes("shirt") ||
    name.includes("hoodie") ||
    name.includes("jacket") ||
    name.includes("sweat") ||
    name.includes("pant")
  );
};

const getFallbackImage = (commodityName) => {
  const name = (commodityName || "").toLowerCase();

  if (name.includes("hoodie")) {
    return "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&h=400&fit=crop";
  }

  if (name.includes("tee") || name.includes("shirt")) {
    return "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=400&fit=crop";
  }

  if (name.includes("cap") || name.includes("hat")) {
    return "https://images.unsplash.com/photo-1575428652377-a2d80e2277fc?w=600&h=400&fit=crop";
  }

  if (name.includes("plush") || name.includes("toy")) {
    return "https://images.unsplash.com/photo-1530325553241-4f6e7690cf36?w=600&h=400&fit=crop";
  }

  if (name.includes("mug") || name.includes("cup")) {
    return "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=600&h=400&fit=crop";
  }

  return "https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=600&h=400&fit=crop";
};

const getCommodityImage = (item) => {
  if (item?.imageUrl && item.imageUrl.trim().length > 0) {
    return item.imageUrl;
  }

  return getFallbackImage(item?.commodityName || "");
};

const Merchandise = () => {
  const [merchandise, setMerchandise] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [size, setSize] = useState("");
  const [cartMessage, setCartMessage] = useState("");
  const [cartError, setCartError] = useState("");

  useEffect(() => {
    const loadMerchandise = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/commodity/types`
        );

        if (!response.ok) {
          throw new Error("Failed to load merchandise catalog");
        }

        const data = await response.json();
        const items = Array.isArray(data)
          ? data.filter((entry) => !entry.isDiscontinued)
          : [];

        setMerchandise(items);
      } catch (err) {
        console.error(err);
        setError(err.message || "Unable to load merchandise catalog");
        setMerchandise([]);
      } finally {
        setLoading(false);
      }
    };

    loadMerchandise();
  }, []);

  const sortedItems = useMemo(() => {
    return [...merchandise].sort((a, b) =>
      (a.commodityName || "").localeCompare(b.commodityName || "")
    );
  }, [merchandise]);

  const categories = useMemo(() => {
    const unique = new Set();
    sortedItems.forEach((item) => {
      const label =
        item.displayCategory ||
        item.category ||
        item.commodityCategory ||
        "Other";
      unique.add(label);
    });
    return ["All", ...Array.from(unique).sort((a, b) => a.localeCompare(b))];
  }, [sortedItems]);

  const filteredItems = useMemo(() => {
    if (selectedCategory === "All") {
      return sortedItems;
    }

    return sortedItems.filter((item) => {
      const label =
        item.displayCategory ||
        item.category ||
        item.commodityCategory ||
        "Other";
      return label === selectedCategory;
    });
  }, [sortedItems, selectedCategory]);

  const openItemModal = (item) => {
    setSelectedItem(item);
    setShowModal(true);
    setQuantity(1);
    setSize("");
    setCartMessage("");
    setCartError("");
  };

  const closeItemModal = () => {
    setShowModal(false);
    setSelectedItem(null);
    setQuantity(1);
    setSize("");
    setCartMessage("");
    setCartError("");
  };

  const handleAddToCart = useCallback(() => {
    if (!selectedItem) {
      setCartError("Choose an item before adding to cart.");
      setCartMessage("");
      return;
    }

    const needsSize = requiresSizeSelection(selectedItem);
    const chosenSize = needsSize ? size.trim() : "";

    if (needsSize && !chosenSize) {
      setCartError("Select a size before adding this item to the cart.");
      setCartMessage("");
      return;
    }

    const quantityValue = Number(quantity);
    const sanitizedQuantity = Number.isNaN(quantityValue)
      ? 0
      : Math.floor(quantityValue);

    if (sanitizedQuantity <= 0) {
      setCartError("Enter a quantity of at least 1.");
      setCartMessage("");
      return;
    }

    if (typeof window === "undefined") {
      setCartError("Cart is unavailable in this environment.");
      setCartMessage("");
      return;
    }

    let currentCart = [];

    try {
      const raw = window.sessionStorage.getItem(CART_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          currentCart = parsed;
        }
      }
    } catch (err) {
      console.error("Unable to read marketplace cart", err);
      setCartError("Unable to access your cart. Please try again.");
      setCartMessage("");
      return;
    }

    const typeId = selectedItem.commodityTypeId || selectedItem.commodityTypeID;
    if (!typeId) {
      setCartError("Merchandise item information is incomplete.");
      setCartMessage("");
      return;
    }

    const normalizedName = selectedItem.commodityName || "Merchandise Item";
    const unitPriceRaw = Number(
      selectedItem.basePrice ?? selectedItem.price ?? 0
    );
    const unitPrice = Number.isNaN(unitPriceRaw) ? 0 : unitPriceRaw;
    const keySuffix = chosenSize ? `-${chosenSize}` : "";
    const key = `commodity-${typeId}${keySuffix}`;
    const displayName = chosenSize
      ? `${normalizedName} (Size ${chosenSize})`
      : normalizedName;

    let updated = false;

    const nextCart = currentCart.map((entry) => {
      if (entry && entry.key === key) {
        updated = true;
        const existingQuantity = Number(entry.quantity) || 0;
        return {
          ...entry,
          quantity: existingQuantity + sanitizedQuantity,
          name: displayName,
          size: chosenSize || entry.size,
        };
      }
      return entry;
    });

    if (!updated) {
      nextCart.push({
        key,
        category: "commodity",
        typeId,
        name: displayName,
        unitPrice,
        quantity: sanitizedQuantity,
        size: chosenSize || undefined,
      });
    }

    try {
      window.sessionStorage.setItem(CART_KEY, JSON.stringify(nextCart));
    } catch (err) {
      console.error("Unable to persist marketplace cart", err);
      setCartError("Unable to update your cart. Please try again.");
      setCartMessage("");
      return;
    }

    const label = sanitizedQuantity === 1 ? "item" : "items";
    const detailSuffix = chosenSize ? `, Size ${chosenSize}` : "";
    setCartMessage(
      `Added ${sanitizedQuantity} ${label} (${normalizedName}${detailSuffix}) to your Marketplace cart. Complete checkout from the Marketplace tab.`
    );
    setCartError("");
    setQuantity(1);
    if (needsSize) {
      setSize("");
    }
  }, [quantity, selectedItem, size]);

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
      <div className="theme-park-container-wide">
        <div className="theme-park-header">
          <h1 className="theme-park-title">Merchandise</h1>
          <p className="theme-park-subtitle">
            Discover exclusive ThrillWorld apparel, collectibles, and souvenirs.
          </p>
        </div>

        {error && (
          <div className="theme-park-alert theme-park-alert-error">
            <span style={{ fontSize: "20px" }}>!</span>
            <span>{error}</span>
          </div>
        )}

        <div
          style={{
            display: "flex",
            gap: "12px",
            flexWrap: "wrap",
            marginBottom: "28px",
          }}
        >
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => {
                setSelectedCategory(category);
                setCartMessage("");
                setCartError("");
              }}
              className="theme-park-btn theme-park-btn-outline"
              style={{
                borderColor:
                  selectedCategory === category ? "var(--primary-color)" : undefined,
                color:
                  selectedCategory === category ? "var(--primary-color)" : undefined,
              }}
            >
              {category}
            </button>
          ))}
        </div>

        {filteredItems.length === 0 && !error ? (
          <div
            style={{
              padding: "60px 20px",
              textAlign: "center",
              color: "#6b7280",
              border: "2px dashed #d1d5db",
              borderRadius: "12px",
              backgroundColor: "#f9fafb",
            }}
          >
            <div style={{ fontSize: "32px", marginBottom: "12px" }}>No merchandise available</div>
            <p style={{ margin: 0 }}>Please check back later for new items.</p>
          </div>
        ) : (
          <div className="theme-park-grid">
            {filteredItems.map((item) => (
              <div key={item.commodityTypeId} className="theme-park-feature-card">
                <div
                  style={{
                    marginBottom: "16px",
                    overflow: "hidden",
                    borderRadius: "12px",
                    height: "200px",
                    backgroundColor: "#f1f5f9",
                  }}
                >
                  <img
                    src={getCommodityImage(item)}
                    alt={item.commodityName}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block",
                    }}
                    onError={(event) => {
                      event.currentTarget.onerror = null;
                      event.currentTarget.src = getFallbackImage(item.commodityName);
                    }}
                  />
                </div>
                <h4 className="theme-park-feature-title">{item.commodityName}</h4>
                <p className="theme-park-feature-description">
                  {item.description || "No description available."}
                </p>
                <div style={{ color: "#475569", fontSize: "14px", marginBottom: "8px" }}>
                  {item.displayCategory || item.category || item.commodityCategory || "Other"}
                </div>
                {typeof item.stockQuantity === "number" && (
                  <div
                    style={{
                      marginBottom: "12px",
                      fontSize: "13px",
                      fontWeight: 600,
                      color: item.stockQuantity > 0 ? "var(--success-color)" : "#dc2626",
                    }}
                  >
                    {item.stockQuantity > 0
                      ? `${item.stockQuantity} in stock`
                      : "Out of stock"}
                  </div>
                )}
                <div
                  style={{
                    fontSize: "24px",
                    fontWeight: 700,
                    color: "var(--success-color)",
                  }}
                >
                  ${Number(item.basePrice ?? 0).toFixed(2)}
                </div>
                <button
                  className="theme-park-btn theme-park-btn-primary theme-park-btn-sm"
                  style={{ marginTop: "16px" }}
                  onClick={() => openItemModal(item)}
                >
                  View Details and Add
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && selectedItem && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(15, 23, 42, 0.6)",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            padding: "48px 16px",
            zIndex: 70,
            overflowY: "auto",
          }}
          onClick={closeItemModal}
          aria-modal="true"
          role="dialog"
          aria-label={`Merchandise details for ${selectedItem.commodityName}`}
        >
          <div
            className="theme-park-card"
            style={{
              width: "min(520px, 100%)",
              padding: 0,
              overflow: "hidden",
              position: "relative",
              boxShadow: "0 24px 50px rgba(15, 23, 42, 0.35)",
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={closeItemModal}
              style={{
                position: "absolute",
                top: "16px",
                right: "16px",
                border: "none",
                backgroundColor: "rgba(15, 23, 42, 0.6)",
                color: "#fff",
                width: "36px",
                height: "36px",
                borderRadius: "9999px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "18px",
                cursor: "pointer",
              }}
              aria-label="Close merchandise details"
            >
              X
            </button>

            <div
              style={{
                height: "240px",
                overflow: "hidden",
                background: "linear-gradient(135deg, #6366f1 0%, #2563eb 100%)",
              }}
            >
              <img
                src={getCommodityImage(selectedItem)}
                alt={selectedItem.commodityName}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                onError={(event) => {
                  event.currentTarget.onerror = null;
                  event.currentTarget.src = getFallbackImage(
                    selectedItem.commodityName
                  );
                }}
              />
            </div>

            <div
              style={{
                padding: "28px",
                display: "flex",
                flexDirection: "column",
                gap: "20px",
              }}
            >
              <div>
                <h3
                  style={{
                    fontSize: "26px",
                    fontWeight: 700,
                    color: "var(--text-dark)",
                    marginBottom: "6px",
                  }}
                >
                  {selectedItem.commodityName}
                </h3>
                <div style={{ fontSize: "15px", color: "#475569" }}>
                  {selectedItem.displayCategory ||
                    selectedItem.category ||
                    selectedItem.commodityCategory ||
                    "Other"}
                </div>
              </div>

              <div style={{ color: "#475569", lineHeight: 1.6 }}>
                {selectedItem.description || "No description available."}
              </div>

              {selectedItem.commodityStore && (
                <div style={{ color: "#475569", fontSize: "14px" }}>
                  Available at Store {selectedItem.commodityStore}
                </div>
              )}

              <div
                style={{
                  fontSize: "30px",
                  fontWeight: 800,
                  color: "var(--success-color)",
                }}
              >
                ${Number(selectedItem.basePrice ?? selectedItem.price ?? 0).toFixed(2)}
              </div>

              {requiresSizeSelection(selectedItem) && (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <label
                    style={{
                      fontSize: "14px",
                      fontWeight: 600,
                      color: "#475569",
                    }}
                  >
                    Size
                  </label>
                  <select
                    className="theme-park-select"
                    value={size}
                    onChange={(event) => {
                      setSize(event.target.value);
                      setCartError("");
                      setCartMessage("");
                    }}
                  >
                    <option value="">Select a size</option>
                    <option value="S">S</option>
                    <option value="M">M</option>
                    <option value="L">L</option>
                    <option value="XL">XL</option>
                  </select>
                </div>
              )}

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                <label
                  style={{
                    fontSize: "14px",
                    fontWeight: 600,
                    color: "#475569",
                  }}
                >
                  Quantity
                </label>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  <button
                    type="button"
                    className="theme-park-btn theme-park-btn-outline theme-park-btn-sm"
                    style={{ padding: "6px 12px" }}
                    onClick={() => {
                      setQuantity((prev) => {
                        const current = Number(prev) || 0;
                        return Math.max(1, current - 1);
                      });
                      setCartError("");
                      setCartMessage("");
                    }}
                    aria-label="Decrease quantity"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(event) => {
                      const value = event.target.value;
                      const numeric = Number(value);
                      const sanitized = Number.isNaN(numeric)
                        ? 1
                        : Math.max(1, Math.floor(numeric));
                      setQuantity(sanitized);
                      setCartError("");
                      setCartMessage("");
                    }}
                    className="theme-park-input"
                    style={{ width: "90px", textAlign: "center", fontWeight: 600 }}
                    aria-label="Merchandise quantity"
                  />
                  <button
                    type="button"
                    className="theme-park-btn theme-park-btn-outline theme-park-btn-sm"
                    style={{ padding: "6px 12px" }}
                    onClick={() => {
                      setQuantity((prev) => {
                        const current = Number(prev) || 0;
                        return Math.max(1, current + 1);
                      });
                      setCartError("");
                      setCartMessage("");
                    }}
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
              </div>

              {cartError && (
                <div className="theme-park-alert theme-park-alert-error">
                  <span style={{ fontSize: "20px" }}>!</span>
                  <span>{cartError}</span>
                </div>
              )}

              {cartMessage && (
                <div className="theme-park-alert theme-park-alert-success">
                  <span style={{ fontSize: "20px" }}>+</span>
                  <span>{cartMessage}</span>
                </div>
              )}

              <button
                type="button"
                className="theme-park-btn theme-park-btn-success theme-park-btn-lg"
                onClick={handleAddToCart}
              >
                {`Add ${quantity} ${quantity === 1 ? "Item" : "Items"} to Marketplace Cart`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Merchandise;
