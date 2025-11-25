import { useState, useEffect } from "react";
import { addItem } from "../components/Cart";
import "./ThemePark.css";

const CommodityPurchase = () => {
  const [commodities, setCommodities] = useState([]);
  const [filteredCommodities, setFilteredCommodities] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [quantities, setQuantities] = useState({});
  const [sizes, setSizes] = useState({}); // Track size selection for each apparel item
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [warningMessage, setWarningMessage] = useState("")

  const categories = [
    { name: "All", icon: "🛍️" },
    { name: "Apparel", icon: "👕" },
    { name: "Accessories", icon: "🧢" },
    { name: "Toys", icon: "🧸" },
    { name: "Souvenirs", icon: "🎁" },
    { name: "Home", icon: "🏠" }
  ];

  useEffect(() => {
    fetchCommodities();
  }, []);

  useEffect(() => {
    filterCommodities();
  }, [commodities, selectedCategory]);

  const fetchCommodities = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/commodity/types`
      );
      const data = await response.json();
      setCommodities(data);
      setFilteredCommodities(data);
    } catch (err) {
      setError("Failed to load items");
      setTimeout(() => setError(""), 3000);
      console.log(err);
    }
  };

  const filterCommodities = () => {
    if (selectedCategory === "All") {
      setFilteredCommodities(commodities);
    } else {
      // Use Display_Category from database
      const filtered = commodities.filter(item => {
        return item.displayCategory === selectedCategory;
      });
      setFilteredCommodities(filtered);
    }
  };

  // Check if item is apparel (needs size selection)
  const isApparelItem = (commodityName) => {
    const name = commodityName.toLowerCase();
    return name.includes("tee") || name.includes("shirt") ||
           name.includes("hoodie") || name.includes("jacket") ||
           name.includes("sweat") || name.includes("pant");
  };

  const handleAddToCart = (item) => {
    // Allow guest users to add to cart (no login required)
    const quantity = quantities[item.commodityTypeId] || 1;
    const isApparel = isApparelItem(item.commodityName);

    // Check if size is required but not selected
    if (isApparel && !sizes[item.commodityTypeId]) {
      setWarningMessage("Please select a size for this apparel item");
      setTimeout(() => setWarningMessage(""), 3000);
      return;
    }

    // Add to cart (validation happens at checkout via database trigger)
    const cartItem = {
      type: "commodity",
      commodityTypeId: item.commodityTypeId,
      id: item.commodityTypeId,
      commodityName: item.commodityName,
      name: item.commodityName,
      basePrice: item.basePrice,
      price: item.basePrice,
      quantity: quantity,
      stockQuantity: item.stockQuantity
    };

    // Add size if apparel item
    if (isApparel) {
      cartItem.size = sizes[item.commodityTypeId];
    }

    addItem(cartItem);

    setMessage(`✅ Added ${quantity}x ${item.commodityName}${isApparel ? ` (Size: ${sizes[item.commodityTypeId]})` : ''} to cart!`);
    setError("");

    // Reset quantity and size for this item
    setQuantities({ ...quantities, [item.commodityTypeId]: 1 });
    setSizes({ ...sizes, [item.commodityTypeId]: "" });

    // Clear message after 3 seconds
    setTimeout(() => setMessage(""), 3000);
  };

  const handleQuantityChange = (itemId, value) => {
    const qty = Math.max(1, parseInt(value) || 1);
    setQuantities({ ...quantities, [itemId]: qty });
  };

  const getFallbackImage = (commodityName) => {
    const name = commodityName.toLowerCase();

    // APPAREL - Each item gets unique image
    if (name.includes("classic") && name.includes("logo tee")) {
      return "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=400&h=400&fit=crop"; // White tee
    } else if (name.includes("steel dragon") && name.includes("hoodie")) {
      return "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=400&fit=crop"; // Black hoodie
    } else if (name.includes("glow") && name.includes("hoodie")) {
      return "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=400&h=400&fit=crop"; // Dark hoodie
    } else if (name.includes("windbreaker")) {
      return "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=400&fit=crop"; // Blue jacket
    } else if (name.includes("anniversary") && name.includes("hoodie")) {
      return "https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=400&h=400&fit=crop"; // Premium hoodie

    // ACCESSORIES - Unique images
    } else if (name.includes("snapback")) {
      return "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400&h=400&fit=crop"; // Black cap
    } else if (name.includes("3d") && name.includes("keychain")) {
      return "https://images.unsplash.com/photo-1582655299221-2f9a0f8f7d4f?w=400&h=400&fit=crop"; // Metal keychain
    } else if (name.includes("pin set")) {
      return "https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=400&h=400&fit=crop"; // Pin badges
    } else if (name.includes("mini backpack")) {
      return "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop"; // Backpack
    } else if (name.includes("light-up") && name.includes("keychain")) {
      return "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop"; // LED keychain

    // TOYS - Unique plush images
    } else if (name.includes("bear") && name.includes("plush")) {
      return "https://images.unsplash.com/photo-1530325553241-4f6e7690cf36?w=400&h=400&fit=crop"; // Teddy bear
    } else if (name.includes("dragon") && name.includes("plush")) {
      return "https://images.unsplash.com/photo-1563291074-2bf8677ac0e5?w=400&h=400&fit=crop"; // Large plush
    } else if (name.includes("die-cast")) {
      return "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop"; // Model train
    } else if (name.includes("popcorn bucket")) {
      return "https://images.unsplash.com/photo-1585647347384-2593bc35786b?w=400&h=400&fit=crop"; // Bucket
    } else if (name.includes("track display")) {
      return "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400&h=400&fit=crop"; // Display model

    // HOME - Unique drinkware and decor
    } else if (name.includes("ceramic") && name.includes("mug")) {
      return "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=400&h=400&fit=crop"; // White mug
    } else if (name.includes("insulated tumbler")) {
      return "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&h=400&fit=crop"; // Steel tumbler
    } else if (name.includes("neon sign")) {
      return "https://images.unsplash.com/photo-1513519245088-0e12902e35ca?w=400&h=400&fit=crop"; // Neon lights
    } else if (name.includes("blanket")) {
      return "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=400&h=400&fit=crop"; // Cozy blanket
    } else if (name.includes("refillable cup")) {
      return "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&h=400&fit=crop"; // Plastic cup

    // TEST ITEMS
    } else if (name.includes("survived")) {
      return "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=400&h=400&fit=crop"; // Black shirt
    } else if (name.includes("crystal")) {
      return "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop"; // Crystal

    // Generic fallbacks for other items
    } else if (name.includes("tee") || name.includes("shirt")) {
      return "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop";
    } else if (name.includes("hoodie")) {
      return "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=400&fit=crop";
    } else if (name.includes("cap") || name.includes("hat")) {
      return "https://images.unsplash.com/photo-1575428652377-a2d80e2277fc?w=400&h=400&fit=crop";
    } else {
      return "https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=400&h=400&fit=crop";
    }
  };

  const getCommodityImage = (item) => {
    if (item.imageUrl && item.imageUrl.trim().length > 0) {
      return item.imageUrl;
    }

    return getFallbackImage(item.commodityName);
  };

  return (
    <div className="theme-park-page">
      <div className="theme-park-container-wide">
        <div className="theme-park-header">
          <h1 className="theme-park-title">🛍️ Shop Merchandise</h1>
          <p className="theme-park-subtitle">
            Take home memories from ThrillWorld
          </p>
        </div>

        {message && (
          <div className="theme-park-alert theme-park-alert-success">
            <span style={{ fontSize: "24px" }}>🎉</span>
            <span>{message}</span>
          </div>
        )}

        {error && (
          <div className="theme-park-alert theme-park-alert-error">
            <span style={{ fontSize: "24px" }}>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {warningMessage && (
          <div className="theme-park-alert theme-park-alert-warning">
            <span style={{ fontSize: "24px" }}>⚠️</span>
            <span>{warningMessage}</span>
          </div>
        )}

        {/* Category Filter Buttons */}
        <div style={{ marginBottom: "30px", display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center" }}>
          {categories.map((category) => (
            <button
              key={category.name}
              onClick={() => setSelectedCategory(category.name)}
              style={{
                padding: "12px 24px",
                fontSize: "16px",
                fontWeight: "600",
                border: selectedCategory === category.name ? "2px solid #11998e" : "2px solid #e5e7eb",
                borderRadius: "25px",
                backgroundColor: selectedCategory === category.name ? "#11998e" : "#fff",
                color: selectedCategory === category.name ? "#fff" : "#333",
                cursor: "pointer",
                transition: "all 0.3s ease",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}
              onMouseOver={(e) => {
                if (selectedCategory !== category.name) {
                  e.target.style.borderColor = "#11998e";
                  e.target.style.backgroundColor = "#f0f9f8";
                }
              }}
              onMouseOut={(e) => {
                if (selectedCategory !== category.name) {
                  e.target.style.borderColor = "#e5e7eb";
                  e.target.style.backgroundColor = "#fff";
                }
              }}
            >
              <span style={{ fontSize: "20px" }}>{category.icon}</span>
              {category.name}
            </button>
          ))}
        </div>

        <h3 className="theme-park-section-title">
          {selectedCategory === "All" ? "All Products" : selectedCategory}
          <span style={{ marginLeft: "10px", fontSize: "16px", fontWeight: "400", color: "#6b7280" }}>
            ({filteredCommodities.length} items)
          </span>
        </h3>
        <div className="theme-park-grid">
          {filteredCommodities.map((item) => (
            <div key={item.commodityTypeId} className="theme-park-feature-card">
              {/* Product Image */}
              <div style={{ marginBottom: "15px", overflow: "hidden", borderRadius: "12px", height: "200px", backgroundColor: "#f0f0f0" }}>
                <img
                  src={getCommodityImage(item)}
                  alt={item.commodityName}
                  onError={(e) => {
                    // If custom image fails, use category stock photo
                    e.target.onerror = null; // Prevent infinite loop
                    e.target.src = getFallbackImage(item.commodityName);
                  }}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    transition: "transform 0.3s ease"
                  }}
                  onMouseOver={(e) => e.target.style.transform = "scale(1.05)"}
                  onMouseOut={(e) => e.target.style.transform = "scale(1)"}
                />
              </div>
              <h4 className="theme-park-feature-title">{item.commodityName}</h4>
              <p
                className="theme-park-feature-description"
                style={{ marginBottom: "10px" }}
              >
                {item.description || "No description available."}
              </p>
              {item.commodityStore && (
                <p
                  className="theme-park-feature-description"
                  style={{ marginBottom: "15px", color: "#4b5563", fontSize: "0.85rem" }}
                >
                  Available at: Store {item.commodityStore}
                </p>
              )}
              <div
                style={{
                  fontSize: "28px",
                  fontWeight: "800",
                  background: "var(--success-gradient)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  marginBottom: "10px",
                }}
              >
                ${item.basePrice.toFixed(2)}
              </div>
              {/* Stock Badge */}
              <div style={{ marginBottom: "15px" }}>
                {item.stockQuantity > 0 ? (
                  <span
                    style={{
                      padding: "4px 12px",
                      borderRadius: "20px",
                      fontSize: "12px",
                      fontWeight: "600",
                      background: item.stockQuantity <= 5 ? "rgba(255, 193, 7, 0.2)" : "rgba(56, 239, 125, 0.2)",
                      color: item.stockQuantity <= 5 ? "#f57c00" : "#11998e",
                    }}
                  >
                    {item.stockQuantity} in stock
                  </span>
                ) : (
                  <span
                    style={{
                      padding: "4px 12px",
                      borderRadius: "20px",
                      fontSize: "12px",
                      fontWeight: "600",
                      background: "rgba(244, 67, 54, 0.2)",
                      color: "#d32f2f",
                    }}
                  >
                    Out of Stock
                  </span>
                )}
              </div>

              {/* Size Selector for Apparel */}
              {item.stockQuantity > 0 && isApparelItem(item.commodityName) && (
                <div style={{ marginBottom: "12px" }}>
                  <label style={{ fontSize: "13px", color: "var(--text-medium)", display: "block", marginBottom: "5px" }}>
                    Size: <span style={{ color: "#f56565" }}>*</span>
                  </label>
                  <select
                    value={sizes[item.commodityTypeId] || ""}
                    onChange={(e) => setSizes({ ...sizes, [item.commodityTypeId]: e.target.value })}
                    className="theme-park-select"
                    style={{ padding: "8px", width: "100%" }}
                  >
                    <option value="">Select Size</option>
                    <option value="S">S - Small</option>
                    <option value="M">M - Medium</option>
                    <option value="L">L - Large</option>
                    <option value="XL">XL - Extra Large</option>
                  </select>
                </div>
              )}

              {/* Quantity Selector */}
              {item.stockQuantity > 0 && (
                <div style={{ marginBottom: "12px" }}>
                  <label style={{ fontSize: "13px", color: "var(--text-medium)", display: "block", marginBottom: "5px" }}>
                    Quantity:
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={item.stockQuantity}
                    value={quantities[item.commodityTypeId] || 1}
                    onChange={(e) => handleQuantityChange(item.commodityTypeId, e.target.value)}
                    className="theme-park-input"
                    style={{ textAlign: "center", padding: "8px" }}
                  />
                </div>
              )}

              <button
                onClick={() => handleAddToCart(item)}
                disabled={item.stockQuantity <= 0}
                className="theme-park-btn theme-park-btn-success w-full theme-park-btn-sm"
                style={item.stockQuantity <= 0 ? { opacity: 0.5, cursor: "not-allowed" } : {}}
              >
                {item.stockQuantity <= 0 ? "❌ Out of Stock" : "🛒 Add to Cart"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CommodityPurchase;
