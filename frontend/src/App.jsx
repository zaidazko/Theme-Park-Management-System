import React, { useState, useEffect } from "react";
import LandingPage from "./components/LandingPage";
import Login from "./components/Login";
import Register from "./components/Register";
import Profile from "./components/Profile";
import TicketSales from "./components/TicketSales";
import CommodityPurchase from "./components/CommodityPurchase";
import CommoditySales from "./components/CommoditySales";
import MyPurchases from "./components/MyPurchases";
import RestaurantMenu from "./components/RestaurantMenu";
import RestaurantSales from "./components/RestaurantSales";
import UnifiedPurchase from "./components/UnifiedPurchase";
import RequestMaintenance from "./components/RequestMaintenance";
import AssignMaintenance from "./components/AssignMaintenance";
import SubmitMaintenance from "./components/SubmitMaintenance";
import EmployeeDashboard from "./components/EmployeeDashboard";
import Rides from "./components/Rides";
import Ridership from "./components/Ridership";
import Reviews from "./components/Reviews";
import ManageMerch from "./components/ManageMerch";
import ManageFood from "./components/ManageFood";
import ManageTickets from "./components/ManageTickets";
import UnifiedSalesReport from "./components/UnifiedSalesReport";
import Cart from "./components/Cart";
import RideDetail from "./components/RideDetail";
import Merchandise from "./components/Merchandise";
import "./App.css";

import { authAPI, ridesAPI, commodityAPI } from "./api";

const computeLowStockCount = (items) => {
  if (!Array.isArray(items)) {
    return 0;
  }

  return items.reduce((count, item) => {
    const quantity = Number(item?.stockQuantity ?? 0);
    const floor = Number(item?.stockFloor ?? 0);
    const isLow =
      item?.isLowStock !== undefined
        ? Boolean(item.isLowStock)
        : floor > 0 && quantity < floor;

    return isLow ? count + 1 : count;
  }, 0);
};

function App() {
  const [currentView, setCurrentView] = useState("landing");
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRide, setSelectedRide] = useState(null);
  const [weatherCondition, setWeatherCondition] = useState("Regular");
  const [selectedWeather, setSelectedWeather] = useState("Regular");
  const [isUpdatingWeather, setIsUpdatingWeather] = useState(false);
  const [merchAlerts, setMerchAlerts] = useState(0);

  const API_BASE_URL = import.meta.env.VITE_API_URL;

  // Fetch latest weather
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/weather`);
        if (response.ok) {
          const data = await response.json();
          const condition = data.weatherCondition || "Regular";
          setWeatherCondition(condition);
          setSelectedWeather(condition);
        }
      } catch (error) {
        console.error("Error fetching weather:", error);
      }
    };

    fetchWeather();
    const interval = setInterval(fetchWeather, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const handleWeatherUpdate = async () => {
    setIsUpdatingWeather(true);
    try {
      const response = await fetch(`${API_BASE_URL}/weather`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          weatherCondition: selectedWeather,
          weatherDate: new Date().toISOString(),
          reportedBy: user?.employeeId, // Use optional chaining in case employeeId is not present
        }),
      });

      if (response.ok) {
        setWeatherCondition(selectedWeather);
        alert("Weather updated successfully!");
      } else {
        alert("Failed to update weather.");
      }
    } catch (error) {
      console.error("Error updating weather:", error);
      alert("Error updating weather.");
    } finally {
      setIsUpdatingWeather(false);
    }
  };

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        setCurrentView("profile");
      } catch (error) {
        console.error("Error parsing saved user data:", error);
        localStorage.removeItem("user");
      }
    }
    setIsLoading(false); // Set loading to false after checking
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    setCurrentView("profile");
  };

  const handleRegisterSuccess = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    setCurrentView("profile");
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("user");
    setCurrentView("landing");
  };

  // Check if user is employee
  const isEmployee = user?.userType === "Employee";

  const isAdmin =
    user?.roleId === 2 ||
    user?.RoleId === 2 ||
    user?.role?.roleId === 2 ||
    user?.roleName === "Admin" ||
    user?.RoleName === "Admin";

  useEffect(() => {
    if (isLoading || !user || !isEmployee) {
      setMerchAlerts(0);
      return;
    }

    let canceled = false;

    const fetchLowStockAlerts = async () => {
      try {
        const items = await commodityAPI.getCommodityTypes();
        if (!canceled) {
          setMerchAlerts(computeLowStockCount(items));
        }
      } catch (error) {
        console.error("Error fetching merchandise alerts:", error);
      }
    };

    fetchLowStockAlerts();
    const intervalId = setInterval(fetchLowStockAlerts, 60000);

    return () => {
      canceled = true;
      clearInterval(intervalId);
    };
  }, [user, isEmployee, isLoading]);

  // loading spinner while checking
  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="App">
      {/* Sidebar Navigation - Show only when logged in */}
      {user && (
        <div style={styles.sidebar}>
          {/* Logo/Brand */}
          <div style={styles.sidebarHeader}>
            <h2 style={styles.logo} onClick={() => setCurrentView("profile")}>
              🎢 ThrillWorld
            </h2>
            <div style={styles.userInfo}>
              <div style={styles.userName}>
                {user.firstName || user.first_name}{" "}
                {user.lastName || user.last_name}
              </div>
              <div style={styles.userRole}>
                {isEmployee
                  ? isAdmin
                    ? "👔 Admin"
                    : "👷 Employee"
                  : "🎫 Customer"}
              </div>
            </div>
          </div>

          {/* Navigation Sections */}
          <nav style={styles.nav}>
            {/* Current Weather Display (Visible to All) */}
            <div
              style={{
                ...styles.navSection,
                padding: "0 20px",
                marginBottom: "16px",
              }}
            >
              <div style={styles.sectionTitle}>Current Weather</div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "12px",
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  borderRadius: "8px",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                }}
              >
                <span style={{ fontSize: "24px", marginRight: "12px" }}>
                  {weatherCondition === "Raining"
                    ? "🌧️"
                    : weatherCondition === "Freezing"
                    ? "❄️"
                    : "☀️"}
                </span>
                <div>
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: "600",
                      color: "#fff",
                    }}
                  >
                    {weatherCondition}
                  </div>
                  <div style={{ fontSize: "11px", color: "#94a3b8" }}>
                    Park Conditions
                  </div>
                </div>
              </div>
            </div>

            {/* Admin Weather Control */}
            {isAdmin && (
              <div style={{ ...styles.navSection, padding: "0 20px" }}>
                <div style={styles.sectionTitle}>Park Weather</div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  <div style={{ position: "relative", width: "100%" }}>
                    <select
                      value={selectedWeather}
                      onChange={(e) => setSelectedWeather(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        backgroundColor: "#1e293b",
                        border: "1px solid #475569",
                        borderRadius: "8px",
                        color: "#f1f5f9",
                        fontSize: "14px",
                        outline: "none",
                        cursor: "pointer",
                        appearance: "none",
                        WebkitAppearance: "none",
                        backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23cbd5e1%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")`,
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "right 12px center",
                        backgroundSize: "10px",
                        transition: "border-color 0.2s, box-shadow 0.2s",
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = "#3b82f6";
                        e.target.style.boxShadow =
                          "0 0 0 3px rgba(59, 130, 246, 0.2)";
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = "#475569";
                        e.target.style.boxShadow = "none";
                      }}
                    >
                      <option value="Regular">☀️ Regular</option>
                      <option value="Raining">🌧️ Raining</option>
                      <option value="Freezing">❄️ Freezing</option>
                    </select>
                  </div>
                  <button
                    onClick={handleWeatherUpdate}
                    disabled={isUpdatingWeather}
                    style={{
                      width: "100%",
                      padding: "10px",
                      backgroundColor: isUpdatingWeather
                        ? "#475569"
                        : "#3b82f6",
                      color: "white",
                      border: "none",
                      borderRadius: "8px",
                      cursor: isUpdatingWeather ? "not-allowed" : "pointer",
                      fontSize: "13px",
                      fontWeight: "600",
                      transition: "all 0.2s",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      marginTop: "4px",
                    }}
                    onMouseEnter={(e) => {
                      if (!isUpdatingWeather)
                        e.currentTarget.style.backgroundColor = "#2563eb";
                    }}
                    onMouseLeave={(e) => {
                      if (!isUpdatingWeather)
                        e.currentTarget.style.backgroundColor = "#3b82f6";
                    }}
                  >
                    {isUpdatingWeather ? (
                      <>
                        <span
                          className="loading-spinner"
                          style={{
                            width: "12px",
                            height: "12px",
                            border: "2px solid rgba(255,255,255,0.3)",
                            borderTop: "2px solid white",
                            borderRadius: "50%",
                            animation: "spin 1s linear infinite",
                          }}
                        ></span>
                        Updating...
                      </>
                    ) : (
                      <>
                        <span>Update Weather</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Profile Section */}
            <div style={styles.navSection}>
              <div style={styles.sectionTitle}>Account</div>
              <button
                onClick={() => setCurrentView("profile")}
                style={{
                  ...styles.navItem,
                  ...(currentView === "profile" ? styles.navItemActive : {}),
                }}
                onMouseEnter={(e) => {
                  if (currentView !== "profile") {
                    e.currentTarget.style.backgroundColor =
                      "rgba(255, 255, 255, 0.05)";
                    e.currentTarget.style.color = "#e2e8f0";
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentView !== "profile") {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.color = "#cbd5e1";
                  }
                }}
              >
                <span style={styles.navIcon}>👤</span>
                Profile
              </button>
            </div>

            {/* Employee Sections */}
            {isEmployee && (
              <>
                {/* Management Section */}
                <div style={styles.navSection}>
                  <div style={styles.sectionTitle}>Management</div>
                  <button
                    onClick={() => setCurrentView("rides")}
                    style={{
                      ...styles.navItem,
                      ...(currentView === "rides" ? styles.navItemActive : {}),
                    }}
                  >
                    <span style={styles.navIcon}>🎢</span>
                    Manage Rides
                  </button>
                  <button
                    onClick={() => setCurrentView("manage-tickets")}
                    style={{
                      ...styles.navItem,
                      ...(currentView === "manage-tickets"
                        ? styles.navItemActive
                        : {}),
                    }}
                  >
                    <span style={styles.navIcon}>🎟️</span>
                    Manage Tickets
                  </button>
                  <button
                    onClick={() => setCurrentView("manage-food")}
                    style={{
                      ...styles.navItem,
                      ...(currentView === "manage-food"
                        ? styles.navItemActive
                        : {}),
                    }}
                  >
                    <span style={styles.navIcon}>🍔</span>
                    Manage Food
                  </button>
                  <button
                    onClick={() => setCurrentView("manage-merch")}
                    style={{
                      ...styles.navItem,
                      ...(currentView === "manage-merch"
                        ? styles.navItemActive
                        : {}),
                    }}
                  >
                    <span style={styles.navIcon}>🛍️</span>
                    <span style={{ flex: 1 }}>Manage Merchandise</span>
                    {merchAlerts > 0 && (
                      <span style={styles.alertBadge}>
                        {merchAlerts > 9 ? "9+" : merchAlerts}
                      </span>
                    )}
                  </button>
                  {isAdmin && (
                    <button
                      onClick={() => setCurrentView("employee-dashboard")}
                      style={{
                        ...styles.navItem,
                        ...(currentView === "employee-dashboard"
                          ? styles.navItemActive
                          : {}),
                      }}
                    >
                      <span style={styles.navIcon}>👥</span>
                      Employee Dashboard
                    </button>
                  )}
                </div>

                {/* Maintenance Section */}
                <div style={styles.navSection}>
                  <div style={styles.sectionTitle}>Maintenance</div>
                  <button
                    onClick={() => setCurrentView("maintenance-request")}
                    style={{
                      ...styles.navItem,
                      ...(currentView === "maintenance-request"
                        ? styles.navItemActive
                        : {}),
                    }}
                  >
                    <span style={styles.navIcon}>🔧</span>
                    Request Maintenance
                  </button>
                  {isAdmin ? (
                    <button
                      onClick={() => setCurrentView("maintenance-assignments")}
                      style={{
                        ...styles.navItem,
                        ...(currentView === "maintenance-assignments"
                          ? styles.navItemActive
                          : {}),
                      }}
                    >
                      <span style={styles.navIcon}>📋</span>
                      View Maintenance
                    </button>
                  ) : (
                    <button
                      onClick={() => setCurrentView("maintenance-submission")}
                      style={{
                        ...styles.navItem,
                        ...(currentView === "maintenance-submission"
                          ? styles.navItemActive
                          : {}),
                      }}
                    >
                      <span style={styles.navIcon}>✅</span>
                      Submit Maintenance
                    </button>
                  )}
                </div>

                {/* Reports Section */}
                <div style={styles.navSection}>
                  <div style={styles.sectionTitle}>Reports</div>
                  <button
                    onClick={() => setCurrentView("ridership")}
                    style={{
                      ...styles.navItem,
                      ...(currentView === "ridership"
                        ? styles.navItemActive
                        : {}),
                    }}
                  >
                    <span style={styles.navIcon}>⭐</span>
                    Ridership Report
                  </button>
                  <button
                    onClick={() => setCurrentView("unified-sales")}
                    style={{
                      ...styles.navItem,
                      ...(currentView === "unified-sales"
                        ? styles.navItemActive
                        : {}),
                    }}
                  >
                    <span style={styles.navIcon}>📊</span>
                    Sales Report
                  </button>
                </div>
              </>
            )}

            {/* Customer Sections */}
            {!isEmployee && (
              <>
                <div style={styles.navSection}>
                  <div style={styles.sectionTitle}>Shop</div>
                  <button
                    onClick={() => setCurrentView("unified-purchase")}
                    style={{
                      ...styles.navItem,
                      ...(currentView === "unified-purchase"
                        ? styles.navItemActive
                        : {}),
                    }}
                  >
                    <span style={styles.navIcon}>🛒</span>
                    Marketplace
                  </button>
                  <button
                    onClick={() => setCurrentView("food-menu")}
                    style={{
                      ...styles.navItem,
                      ...(currentView === "food-menu"
                        ? styles.navItemActive
                        : {}),
                    }}
                  >
                    <span style={styles.navIcon}>🍔</span>
                    Food
                  </button>
                  <button
                    onClick={() => setCurrentView("merch")}
                    style={{
                      ...styles.navItem,
                      ...(currentView === "merch" ? styles.navItemActive : {}),
                    }}
                  >
                    <span style={styles.navIcon}>🛍️</span>
                    Merchandise
                  </button>
                </div>

                <div style={styles.navSection}>
                  <div style={styles.sectionTitle}>Attractions</div>
                  <button
                    onClick={() => setCurrentView("rides")}
                    style={{
                      ...styles.navItem,
                      ...(currentView === "rides" ? styles.navItemActive : {}),
                    }}
                  >
                    <span style={styles.navIcon}>🎢</span>
                    Rides & Tickets
                  </button>
                </div>

                <div style={styles.navSection}>
                  <div style={styles.sectionTitle}>My Account</div>
                  <button
                    onClick={() => setCurrentView("my-purchases")}
                    style={{
                      ...styles.navItem,
                      ...(currentView === "my-purchases"
                        ? styles.navItemActive
                        : {}),
                    }}
                  >
                    <span style={styles.navIcon}>📦</span>
                    My Purchases
                  </button>
                  <button
                    onClick={() => setCurrentView("my-reviews")}
                    style={{
                      ...styles.navItem,
                      ...(currentView === "my-reviews"
                        ? styles.navItemActive
                        : {}),
                    }}
                  >
                    <span style={styles.navIcon}>⭐</span>
                    My Reviews
                  </button>
                </div>
              </>
            )}

            {/* Logout */}
            <div style={styles.navSection}>
              <button
                onClick={handleLogout}
                style={styles.logoutButton}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor =
                    "rgba(220, 38, 38, 0.2)";
                  e.currentTarget.style.color = "#fca5a5";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor =
                    "rgba(220, 38, 38, 0.1)";
                  e.currentTarget.style.color = "#f87171";
                }}
              >
                <span style={styles.navIcon}>🚪</span>
                Logout
              </button>
            </div>
          </nav>
        </div>
      )}

      {/* Main Content Area */}
      <div style={user ? styles.mainContent : {}}>
        {/* Pages */}
        {currentView === "landing" && (
          <LandingPage
            onGetStarted={() => setCurrentView("register")}
            onLogin={() => setCurrentView("login")}
            onShopClick={() => setCurrentView("guest-shop")}
            onAttractionsClick={() => setCurrentView("guest-rides")}
            onDiningClick={() => setCurrentView("guest-dining")}
            onRideDetailClick={(rideName) => {
              setSelectedRide(rideName);
              setCurrentView("ride-detail");
            }}
          />
        )}

        {/* Ride Detail Page - No login required */}
        {currentView === "ride-detail" && selectedRide && (
          <>
            <nav style={styles.guestNav}>
              <h2
                style={styles.title}
                onClick={() => setCurrentView("landing")}
              >
                ThrillWorld
              </h2>
              <div style={styles.navButtons}>
                <button
                  onClick={() => setCurrentView("landing")}
                  style={styles.navButton}
                >
                  Back to Home
                </button>
                <button
                  onClick={() => setCurrentView("guest-rides")}
                  style={styles.navButton}
                >
                  All Rides
                </button>
                <button
                  onClick={() => setCurrentView("login")}
                  style={styles.navButton}
                >
                  Sign In
                </button>
              </div>
            </nav>
            <RideDetail
              rideName={selectedRide}
              onBack={() => setCurrentView("landing")}
            />
          </>
        )}

        {/* Guest Shop - No login required */}
        {currentView === "guest-shop" && (
          <>
            <nav style={styles.guestNav}>
              <h2
                style={styles.title}
                onClick={() => setCurrentView("landing")}
              >
                ThrillWorld
              </h2>
              <div style={styles.navButtons}>
                <button
                  onClick={() => setCurrentView("landing")}
                  style={styles.navButton}
                >
                  Back to Home
                </button>
                <button
                  onClick={() => setCurrentView("guest-cart")}
                  style={styles.cartButton}
                >
                  🛒 Cart
                </button>
                <button
                  onClick={() => setCurrentView("login")}
                  style={styles.navButton}
                >
                  Sign In
                </button>
              </div>
            </nav>
            <CommodityPurchase />
          </>
        )}

        {/* Guest Cart - No login required */}
        {currentView === "guest-cart" && (
          <>
            <nav style={styles.guestNav}>
              <h2
                style={styles.title}
                onClick={() => setCurrentView("landing")}
              >
                ThrillWorld
              </h2>
              <div style={styles.navButtons}>
                <button
                  onClick={() => setCurrentView("guest-shop")}
                  style={styles.navButton}
                >
                  Continue Shopping
                </button>
                <button
                  onClick={() => setCurrentView("login")}
                  style={styles.navButton}
                >
                  Sign In
                </button>
              </div>
            </nav>
            <Cart />
          </>
        )}

        {/* Guest Rides - No login required */}
        {currentView === "guest-rides" && (
          <>
            <nav style={styles.guestNav}>
              <h2
                style={styles.title}
                onClick={() => setCurrentView("landing")}
              >
                ThrillWorld
              </h2>
              <div style={styles.navButtons}>
                <button
                  onClick={() => setCurrentView("landing")}
                  style={styles.navButton}
                >
                  Back to Home
                </button>
                <button
                  onClick={() => setCurrentView("guest-shop")}
                  style={styles.navButton}
                >
                  Shop
                </button>
                <button
                  onClick={() => setCurrentView("login")}
                  style={styles.navButton}
                >
                  Sign In
                </button>
              </div>
            </nav>
            <Rides />
          </>
        )}

        {/* Guest Dining - No login required */}
        {currentView === "guest-dining" && (
          <>
            <nav style={styles.guestNav}>
              <h2
                style={styles.title}
                onClick={() => setCurrentView("landing")}
              >
                ThrillWorld
              </h2>
              <div style={styles.navButtons}>
                <button
                  onClick={() => setCurrentView("landing")}
                  style={styles.navButton}
                >
                  Back to Home
                </button>
                <button
                  onClick={() => setCurrentView("guest-shop")}
                  style={styles.navButton}
                >
                  Shop
                </button>
                <button
                  onClick={() => setCurrentView("login")}
                  style={styles.navButton}
                >
                  Sign In to Order
                </button>
              </div>
            </nav>
            <RestaurantMenu />
          </>
        )}

        {currentView === "login" && (
          <Login
            onLoginSuccess={handleLoginSuccess}
            onSwitchToRegister={() => setCurrentView("register")}
            onBackToLanding={() => setCurrentView("landing")}
          />
        )}

        {currentView === "register" && (
          <Register
            onRegisterSuccess={handleRegisterSuccess}
            onSwitchToLogin={() => setCurrentView("login")}
            onBackToLanding={() => setCurrentView("landing")}
          />
        )}

        {currentView === "profile" && user && (
          <Profile user={user} onLogout={handleLogout} />
        )}

        {currentView === "rides" && <Rides />}

        {/* Customer Pages */}
        {currentView === "unified-purchase" && user && !isEmployee && (
          <UnifiedPurchase />
        )}

        {currentView === "food-menu" && user && !isEmployee && (
          <RestaurantMenu />
        )}

        {currentView === "merch" && user && !isEmployee && <Merchandise />}

        {currentView === "my-purchases" && user && !isEmployee && (
          <MyPurchases />
        )}

        {currentView === "my-reviews" && user && !isEmployee && <Reviews />}

        {/* Employee Pages */}
        {currentView === "ticket-sales" && user && isEmployee && (
          <TicketSales />
        )}

        {currentView === "commodity-sales" && user && isEmployee && (
          <CommoditySales />
        )}

        {currentView === "manage-tickets" && user && isEmployee && (
          <ManageTickets />
        )}

        {currentView === "manage-food" && user && isEmployee && <ManageFood />}

        {currentView === "manage-merch" && user && isEmployee && (
          <ManageMerch onAlertsChange={setMerchAlerts} />
        )}

        {currentView === "maintenance-request" && user && isEmployee && (
          <RequestMaintenance user={user} />
        )}

        {currentView === "maintenance-assignments" &&
          user &&
          (user?.roleId === 2 ||
            user?.RoleId === 2 ||
            user?.role?.roleId === 2 ||
            user?.roleName === "Admin" ||
            user?.RoleName === "Admin") && <AssignMaintenance user={user} />}

        {currentView === "maintenance-submission" && user && isEmployee && (
          <SubmitMaintenance user={user} />
        )}

        {currentView === "employee-dashboard" &&
          user &&
          (user?.roleId === 2 ||
            user?.RoleId === 2 ||
            user?.role?.roleId === 2 ||
            user?.roleName === "Admin" ||
            user?.RoleName === "Admin") && <EmployeeDashboard />}

        {currentView === "ridership" && user && isEmployee && <Ridership />}

        {/* Restaurant Pages */}
        {currentView === "restaurant-sales" && user && isEmployee && (
          <RestaurantSales />
        )}

        {currentView === "unified-sales" && user && isEmployee && (
          <UnifiedSalesReport />
        )}
      </div>
    </div>
  );
}

const styles = {
  sidebar: {
    position: "fixed",
    left: 0,
    top: 0,
    bottom: 0,
    width: "280px",
    backgroundColor: "#1e293b",
    color: "#fff",
    display: "flex",
    flexDirection: "column",
    boxShadow: "2px 0 10px rgba(0,0,0,0.1)",
    zIndex: 1000,
    overflowY: "auto",
  },
  sidebarHeader: {
    padding: "24px 20px",
    borderBottom: "1px solid rgba(255,255,255,0.1)",
    backgroundColor: "#0f172a",
  },
  logo: {
    margin: "0 0 16px 0",
    fontSize: "24px",
    fontWeight: "800",
    cursor: "pointer",
    color: "#fff",
    letterSpacing: "-0.5px",
  },
  userInfo: {
    paddingTop: "12px",
    borderTop: "1px solid rgba(255,255,255,0.1)",
  },
  userName: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#fff",
    marginBottom: "4px",
  },
  userRole: {
    fontSize: "12px",
    color: "#94a3b8",
    fontWeight: "500",
  },
  nav: {
    flex: 1,
    padding: "16px 0",
    overflowY: "auto",
  },
  navSection: {
    marginBottom: "24px",
  },
  sectionTitle: {
    fontSize: "11px",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    color: "#94a3b8",
    padding: "0 20px 8px 20px",
    marginBottom: "4px",
  },
  navItem: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    padding: "12px 20px",
    backgroundColor: "transparent",
    color: "#cbd5e1",
    border: "none",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    textAlign: "left",
    transition: "all 0.2s",
    borderLeft: "3px solid transparent",
  },
  navItemActive: {
    backgroundColor: "rgba(59, 130, 246, 0.15)",
    color: "#60a5fa",
    borderLeftColor: "#3b82f6",
    fontWeight: "600",
  },
  navIcon: {
    marginRight: "12px",
    fontSize: "18px",
    width: "24px",
    textAlign: "center",
  },
  logoutButton: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    padding: "12px 20px",
    backgroundColor: "rgba(220, 38, 38, 0.1)",
    color: "#f87171",
    border: "none",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
    textAlign: "left",
    transition: "all 0.2s",
    margin: "8px 0",
    borderRadius: "0",
  },
  mainContent: {
    marginLeft: "280px",
    minHeight: "100vh",
    backgroundColor: "#f8fafc",
  },
  guestNav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "15px 30px",
    backgroundColor: "#fff",
    borderBottom: "2px solid #e5e7eb",
    boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
  },
  title: {
    margin: 0,
    fontSize: "32px",
    cursor: "pointer",
    color: "#1e40af",
    fontWeight: "900",
    letterSpacing: "-1px",
  },
  navButtons: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  },
  navButton: {
    padding: "8px 16px",
    backgroundColor: "#fff",
    color: "#007bff",
    border: "2px solid #007bff",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
  },
  cartButton: {
    padding: "8px 16px",
    backgroundColor: "#28a745",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
  },
  alertBadge: {
    marginLeft: "12px",
    padding: "2px 8px",
    backgroundColor: "#ef4444",
    color: "#fff",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: "700",
    lineHeight: 1.4,
  },
};

export default App;
