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
import Reviews from "./components/Reviews";
import MakeReview from "./components/MakeReview";
import ManageMerch from "./components/ManageMerch";
import ManageFood from "./components/ManageFood";
import ManageTickets from "./components/ManageTickets";
import UnifiedSalesReport from "./components/UnifiedSalesReport";
import Cart from "./components/Cart";
import RideDetail from "./components/RideDetail";
import Merchandise from "./components/Merchandise";
import "./App.css";

function App() {
  const [currentView, setCurrentView] = useState("landing");
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRide, setSelectedRide] = useState(null);

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

  // loading spinner while checking
  if (isLoading) {
    return <div>Loading...</div>;
  }

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
                    Ride Manager
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
                    Manage Merchandise
                  </button>
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
                    onClick={() => setCurrentView("reviews")}
                    style={{
                      ...styles.navItem,
                      ...(currentView === "reviews"
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

        {currentView === "my-reviews" && user && !isEmployee && (
          <Reviews onSwitchToMakeReview={() => setCurrentView("make-review")} />
        )}

        {currentView === "make-review" && user && !isEmployee && (
          <MakeReview onSwitchToReviews={() => setCurrentView("my-reviews")} />
        )}

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
          <ManageMerch />
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

        {currentView === "reviews" && user && isEmployee && <Reviews />}

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
};

export default App;
