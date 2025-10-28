import { useState, useEffect } from "react";
import "./ThemePark.css";

const RestaurantMenu = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("credit");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/restaurant/all`
      );
      const data = await response.json();
      setRestaurants(data);
    } catch (err) {
      setError("Failed to load restaurants");
    }
  };

  const selectRestaurant = async (restaurantId) => {
    setSelectedRestaurant(restaurantId);
    setCart([]);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/restaurant/${restaurantId}/menu`
      );
      const data = await response.json();
      setMenuItems(data);
    } catch (err) {
      setError("Failed to load menu");
    }
  };

  const addToCart = (item) => {
    const existingItem = cart.find((c) => c.menuId === item.menuId);
    if (existingItem) {
      setCart(
        cart.map((c) =>
          c.menuId === item.menuId ? { ...c, quantity: c.quantity + 1 } : c
        )
      );
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  const removeFromCart = (menuId) => {
    setCart(cart.filter((item) => item.menuId !== menuId));
  };

  const updateQuantity = (menuId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(menuId);
    } else {
      setCart(
        cart.map((item) =>
          item.menuId === menuId ? { ...item, quantity: newQuantity } : item
        )
      );
    }
  };

  const calculateTotal = () => {
    return cart
      .reduce((total, item) => total + item.price * item.quantity, 0)
      .toFixed(2);
  };

  const handlePlaceOrder = async () => {
    const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

    if (!currentUser.customerId) {
      setError("Please login to place an order");
      return;
    }

    if (cart.length === 0) {
      setError("Your cart is empty");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const orderData = {
        customerId: currentUser.customerId,
        restaurantId: selectedRestaurant,
        totalPrice: parseFloat(calculateTotal()),
        paymentMethod: paymentMethod,
        items: cart.map((item) => ({
          menuId: item.menuId,
          quantity: item.quantity,
          itemPrice: item.price,
        })),
      };

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/restaurant/order`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(orderData),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMessage(`✅ ${data.message}! Order ID: ${data.orderId}`);
        setCart([]);
      } else {
        setError(data.message || "Order failed");
      }
    } catch (err) {
      setError("Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  const groupByCategory = (items) => {
    return items.reduce((acc, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    }, {});
  };

  return (
    <div style={{ maxWidth: "1200px", margin: "40px auto", padding: "30px" }}>
      <h2 style={{ textAlign: "center", marginBottom: "30px" }}>
        🍽️ Restaurant Menu
      </h2>

      {message && (
        <div
          style={{
            padding: "12px",
            backgroundColor: "#d4edda",
            color: "#155724",
            borderRadius: "6px",
            marginBottom: "20px",
            textAlign: "center",
          }}
        >
          {message}
        </div>
      )}
      {error && (
        <div
          style={{
            padding: "12px",
            backgroundColor: "#f8d7da",
            color: "#721c24",
            borderRadius: "6px",
            marginBottom: "20px",
            textAlign: "center",
          }}
        >
          {error}
        </div>
      )}

      {/* Restaurant Selection */}
      {!selectedRestaurant && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "20px",
          }}
        >
          {restaurants.map((restaurant) => (
            <div
              key={restaurant.restaurantId}
              onClick={() => selectRestaurant(restaurant.restaurantId)}
              style={{
                padding: "20px",
                backgroundColor: "#fff",
                borderRadius: "10px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                cursor: "pointer",
                transition: "transform 0.2s",
              }}
            >
              <h3 style={{ margin: "0 0 10px 0", color: "#007bff" }}>
                {restaurant.restaurantName}
              </h3>
              <p style={{ margin: "5px 0", color: "#666" }}>
                📍 {restaurant.location}
              </p>
              <p style={{ margin: "5px 0", color: "#666" }}>
                🍴 {restaurant.cuisineType}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Menu Display */}
      {selectedRestaurant && (
        <div style={{ display: "flex", gap: "20px" }}>
          <div style={{ flex: 2 }}>
            <button
              onClick={() => setSelectedRestaurant(null)}
              style={{
                marginBottom: "20px",
                padding: "8px 16px",
                backgroundColor: "#6c757d",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              ← Back to Restaurants
            </button>

            {Object.entries(groupByCategory(menuItems)).map(
              ([category, items]) => (
                <div key={category} style={{ marginBottom: "30px" }}>
                  <h3
                    style={{
                      color: "#007bff",
                      borderBottom: "2px solid #007bff",
                      paddingBottom: "10px",
                    }}
                  >
                    {category}
                  </h3>
                  {items.map((item) => (
                    <div
                      key={item.menuId}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "15px",
                        backgroundColor: "#fff",
                        borderRadius: "8px",
                        marginBottom: "10px",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <h4 style={{ margin: "0 0 5px 0" }}>{item.itemName}</h4>
                        <p
                          style={{
                            margin: "0",
                            color: "#666",
                            fontSize: "14px",
                          }}
                        >
                          {item.itemDescription}
                        </p>
                        <p
                          style={{
                            margin: "5px 0 0 0",
                            fontWeight: "bold",
                            color: "#28a745",
                          }}
                        >
                          ${item.price}
                        </p>
                      </div>
                      <button
                        onClick={() => addToCart(item)}
                        style={{
                          padding: "8px 16px",
                          backgroundColor: "#28a745",
                          color: "#fff",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                        }}
                      >
                        Add to Cart
                      </button>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>

          {/* Cart */}
          <div
            style={{
              flex: 1,
              position: "sticky",
              top: "20px",
              height: "fit-content",
            }}
          >
            <div
              style={{
                padding: "20px",
                backgroundColor: "#fff",
                borderRadius: "10px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              }}
            >
              <h3 style={{ marginTop: 0 }}>🛒 Your Cart</h3>
              {cart.length === 0 ? (
                <p style={{ color: "#999" }}>Cart is empty</p>
              ) : (
                <>
                  {cart.map((item) => (
                    <div
                      key={item.menuId}
                      style={{
                        borderBottom: "1px solid #eee",
                        paddingBottom: "10px",
                        marginBottom: "10px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: "5px",
                        }}
                      >
                        <strong>{item.itemName}</strong>
                        <button
                          onClick={() => removeFromCart(item.menuId)}
                          style={{
                            background: "none",
                            border: "none",
                            color: "#dc3545",
                            cursor: "pointer",
                          }}
                        >
                          ✕
                        </button>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            gap: "5px",
                            alignItems: "center",
                          }}
                        >
                          <button
                            onClick={() =>
                              updateQuantity(item.menuId, item.quantity - 1)
                            }
                            style={{ padding: "2px 8px", fontSize: "16px" }}
                          >
                            -
                          </button>
                          <span>{item.quantity}</span>
                          <button
                            onClick={() =>
                              updateQuantity(item.menuId, item.quantity + 1)
                            }
                            style={{ padding: "2px 8px", fontSize: "16px" }}
                          >
                            +
                          </button>
                        </div>
                        <span>${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    </div>
                  ))}

                  <div
                    style={{
                      marginTop: "20px",
                      paddingTop: "10px",
                      borderTop: "2px solid #000",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: "18px",
                        fontWeight: "bold",
                        marginBottom: "15px",
                      }}
                    >
                      <span>Total:</span>
                      <span>${calculateTotal()}</span>
                    </div>

                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "10px",
                        marginBottom: "10px",
                        borderRadius: "4px",
                        border: "1px solid #ddd",
                      }}
                    >
                      <option value="credit">Credit Card</option>
                      <option value="debit">Debit Card</option>
                      <option value="cash">Cash</option>
                      <option value="mobile">Mobile Payment</option>
                    </select>

                    <button
                      onClick={handlePlaceOrder}
                      disabled={loading}
                      style={{
                        width: "100%",
                        padding: "12px",
                        backgroundColor: "#007bff",
                        color: "#fff",
                        border: "none",
                        borderRadius: "4px",
                        fontSize: "16px",
                        fontWeight: "bold",
                        cursor: "pointer",
                      }}
                    >
                      {loading ? "Processing..." : "Place Order"}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RestaurantMenu;
