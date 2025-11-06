import { useState, useEffect } from "react";
import { addItem } from "../components/Cart";
import "./ThemePark.css";

const CommodityPurchase = () => {
  const [commodities, setCommodities] = useState([]);
  const [filteredCommodities, setFilteredCommodities] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [quantities, setQuantities] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const categories = [
    { name: "All", icon: "🛍️" },
    { name: "Apparel", icon: "👕" },
    { name: "Accessories", icon: "🧢" },
    { name: "Toys", icon: "🧸" },
    { name: "Home", icon: "🏠" },
    { name: "Special", icon: "⭐" }
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
      console.log(err);
    }
  };

  const filterCommodities = () => {
    if (selectedCategory === "All") {
      setFilteredCommodities(commodities);
    } else {
      const filtered = commodities.filter(item => {
        const name = item.commodityName.toLowerCase();
        switch(selectedCategory) {
          case "Apparel":
            return name.includes("tee") || name.includes("shirt") || name.includes("hoodie") ||
                   name.includes("jacket") || name.includes("sweat") || name.includes("pant");
          case "Accessories":
            return name.includes("cap") || name.includes("hat") || name.includes("keychain") ||
                   name.includes("pin") || name.includes("bag") || name.includes("wallet") ||
                   name.includes("lanyard");
          case "Toys":
            return name.includes("plush") || name.includes("toy") || name.includes("model") ||
                   name.includes("bucket") || name.includes("figure") || name.includes("kit") ||
                   name.includes("display");
          case "Home":
            return name.includes("mug") || name.includes("cup") || name.includes("tumbler") ||
                   name.includes("blanket") || name.includes("sign") || name.includes("bottle") ||
                   name.includes("pillow") || name.includes("notebook") || name.includes("poster");
          case "Special":
            return name.includes("limited") || name.includes("anniversary") || name.includes("edition") ||
                   name.includes("exclusive") || name.includes("crystal") || name.includes("vip") ||
                   name.includes("survived") || name.includes("fright") || name.includes("holiday");
          default:
            return true;
        }
      });
      setFilteredCommodities(filtered);
    }
  };

  const handleAddToCart = (item) => {
    // Allow guest users to add to cart (no login required)
    const quantity = quantities[item.commodityTypeId] || 1;

    // Add to cart (validation happens at checkout via database trigger)
    addItem({
      type: "commodity",
      commodityTypeId: item.commodityTypeId,
      id: item.commodityTypeId,
      commodityName: item.commodityName,
      name: item.commodityName,
      basePrice: item.basePrice,
      price: item.basePrice,
      quantity: quantity,
      stockQuantity: item.stockQuantity
    });

    setMessage(`✅ Added ${quantity}x ${item.commodityName} to cart!`);
    setError("");

    // Reset quantity for this item
    setQuantities({ ...quantities, [item.commodityTypeId]: 1 });

    // Clear message after 3 seconds
    setTimeout(() => setMessage(""), 3000);
  };

  const handleQuantityChange = (itemId, value) => {
    const qty = Math.max(1, parseInt(value) || 1);
    setQuantities({ ...quantities, [itemId]: qty });
  };

  // Generate image filename from product name
  const getProductImage = (commodityName) => {
    // Convert product name to filename format
    const filename = commodityName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    return `/merchandise/${filename}.jpg`;
  };

  // Fallback to generic category image
  const getCategoryImage = (commodityName) => {
    const name = commodityName.toLowerCase();

    if (name.includes("tee") || name.includes("shirt") || name.includes("hoodie") || name.includes("jacket") || name.includes("sweat")) {
      return "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=300&fit=crop";
    } else if (name.includes("cap") || name.includes("hat")) {
      return "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400&h=300&fit=crop";
    } else if (name.includes("plush") || name.includes("toy")) {
      return "https://images.unsplash.com/photo-1530325553241-4f6e7690cf36?w=400&h=300&fit=crop";
    } else if (name.includes("mug") || name.includes("cup") || name.includes("tumbler")) {
      return "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=400&h=300&fit=crop";
    } else if (name.includes("keychain") || name.includes("pin")) {
      return "https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=400&h=300&fit=crop";
    } else if (name.includes("bag") || name.includes("backpack")) {
      return "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=300&fit=crop";
    } else if (name.includes("blanket") || name.includes("pillow")) {
      return "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=400&h=300&fit=crop";
    } else if (name.includes("bottle")) {
      return "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&h=300&fit=crop";
    } else if (name.includes("sign") || name.includes("poster")) {
      return "https://images.unsplash.com/photo-1513519245088-0e12902e35ca?w=400&h=300&fit=crop";
    } else {
      // Default merchandise image
      return "https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=400&h=300&fit=crop";
    }
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
                  src={getProductImage(item.commodityName)}
                  alt={item.commodityName}
                  onError={(e) => {
                    // If custom image fails, use category stock photo
                    e.target.onerror = null; // Prevent infinite loop
                    e.target.src = getCategoryImage(item.commodityName);
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
                style={{ marginBottom: "15px" }}
              >
                {item.commodityStore && `Available at: Store ${item.commodityStore}`}
              </p>
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
