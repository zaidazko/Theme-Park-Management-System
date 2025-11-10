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

  return (
    <div className="App">
      {/* Navigation Bar - Show only when logged in */}
      {user && (
        <nav style={styles.nav}>
          <h2 style={styles.title}>ThrillWorld</h2>
          <div style={styles.navButtons}>
            <button
              onClick={() => setCurrentView("profile")}
              style={styles.navButton}
            >
              Profile
            </button>
            {/* EMPLOYEE / ADMIN VIEW */}
            {isEmployee && (
              <>
                <button
                  onClick={() => setCurrentView("rides")}
                  style={styles.navButton}
                >
                  Ride Manager
                </button>
                <button
                  onClick={() => setCurrentView("manage-tickets")}
                  style={styles.navButton}
                >
                  Manage Tickets
                </button>
                <button
                  onClick={() => setCurrentView("manage-food")}
                  style={styles.navButton}
                >
                  Manage Food
                </button>
                <button
                  onClick={() => setCurrentView("manage-merch")}
                  style={styles.navButton}
                >
                  Manage Merchandise
                </button>
                <button
                  onClick={() => setCurrentView("reviews")}
                  style={styles.navButton}
                >
                  Ridership Report
                </button>
                <button
                  onClick={() => setCurrentView("maintenance-request")}
                  style={styles.navButton}
                >
                  Request Maintenance
                </button>

                {/* Admin-only: Employee Dashboard & View Maintenance */}
                { (user?.roleId === 2 || user?.RoleId === 2 || user?.role?.roleId === 2 || user?.roleName === 'Admin' || user?.RoleName === 'Admin') ? (
                  <>
                    <button
                      onClick={() => setCurrentView("maintenance-assignments")}
                      style={styles.navButton}
                    >
                      View Maintenance
                    </button>
                    <button
                      onClick={() => setCurrentView("employee-dashboard")}
                      style={styles.navButton}
                    >
                      Employee Dashboard
                    </button>
                    <button
                      onClick={() => setCurrentView("unified-sales")}
                      style={styles.navButton}
                    >
                      Sales Report
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setCurrentView("maintenance-submission")}
                      style={styles.navButton}
                    >
                      Submit Maintenance
                    </button>
                    <button
                      onClick={() => setCurrentView("unified-sales")}
                      style={styles.navButton}
                    >
                      Sales Report
                    </button>
                  </>
                )}
              </>
            )}

            {/* CUSTOMER VIEW */}
            {!isEmployee && (
              <>
                <button
                  onClick={() => setCurrentView("unified-purchase")}
                  style={styles.navButton}
                >
                  Marketplace
                </button>
                <button
                  onClick={() => setCurrentView("food-menu")}
                  style={styles.navButton}
                >
                  Food
                </button>
                <button
                  onClick={() => setCurrentView("merch")}
                  style={styles.navButton}
                >
                  Merch
                </button>
                <button
                  onClick={() => setCurrentView("rides")}
                  style={styles.navButton}
                >
                  Rides & Tickets
                </button>
                <button
                  onClick={() => setCurrentView("my-purchases")}
                  style={styles.navButton}
                >
                  My Purchases
                </button>
                <button
                  onClick={() => setCurrentView("my-reviews")}
                  style={styles.navButton}
                >
                  My Reviews
                </button>
              </>
            )}

            <button onClick={handleLogout} style={styles.logoutButton}>
              Logout
            </button>
          </div>
        </nav>
      )}

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
            <h2 style={styles.title} onClick={() => setCurrentView("landing")}>
              ThrillWorld
            </h2>
            <div style={styles.navButtons}>
              <button onClick={() => setCurrentView("landing")} style={styles.navButton}>
                Back to Home
              </button>
              <button onClick={() => setCurrentView("guest-rides")} style={styles.navButton}>
                All Rides
              </button>
              <button onClick={() => setCurrentView("login")} style={styles.navButton}>
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
            <h2 style={styles.title} onClick={() => setCurrentView("landing")}>
              ThrillWorld
            </h2>
            <div style={styles.navButtons}>
              <button onClick={() => setCurrentView("landing")} style={styles.navButton}>
                Back to Home
              </button>
              <button onClick={() => setCurrentView("guest-cart")} style={styles.cartButton}>
                🛒 Cart
              </button>
              <button onClick={() => setCurrentView("login")} style={styles.navButton}>
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
            <h2 style={styles.title} onClick={() => setCurrentView("landing")}>
              ThrillWorld
            </h2>
            <div style={styles.navButtons}>
              <button onClick={() => setCurrentView("guest-shop")} style={styles.navButton}>
                Continue Shopping
              </button>
              <button onClick={() => setCurrentView("login")} style={styles.navButton}>
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
            <h2 style={styles.title} onClick={() => setCurrentView("landing")}>
              ThrillWorld
            </h2>
            <div style={styles.navButtons}>
              <button onClick={() => setCurrentView("landing")} style={styles.navButton}>
                Back to Home
              </button>
              <button onClick={() => setCurrentView("guest-shop")} style={styles.navButton}>
                Shop
              </button>
              <button onClick={() => setCurrentView("login")} style={styles.navButton}>
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
            <h2 style={styles.title} onClick={() => setCurrentView("landing")}>
              ThrillWorld
            </h2>
            <div style={styles.navButtons}>
              <button onClick={() => setCurrentView("landing")} style={styles.navButton}>
                Back to Home
              </button>
              <button onClick={() => setCurrentView("guest-shop")} style={styles.navButton}>
                Shop
              </button>
              <button onClick={() => setCurrentView("login")} style={styles.navButton}>
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
        <Reviews
          onSwitchToMakeReview={() => setCurrentView("make-review")}
        />
      )}

      {currentView === "make-review" && user && !isEmployee && (
        <MakeReview 
          onSwitchToReviews={() => setCurrentView("my-reviews")}
        />
      )}

      {/* Employee Pages */}
      {currentView === "ticket-sales" && user && isEmployee && <TicketSales />}

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

      {currentView === "maintenance-assignments" && user && (user?.roleId === 2 || user?.RoleId === 2 || user?.role?.roleId === 2 || user?.roleName === 'Admin' || user?.RoleName === 'Admin') && (
        <AssignMaintenance user={user} />
      )}

      {currentView === "maintenance-submission" && user && isEmployee && (
        <SubmitMaintenance user={user} />
      )}

      {currentView === "employee-dashboard" && user && (user?.roleId === 2 || user?.RoleId === 2 || user?.role?.roleId === 2 || user?.roleName === 'Admin' || user?.RoleName === 'Admin') && (
        <EmployeeDashboard />
      )}

      {currentView === "reviews" && user && isEmployee && <Reviews />}

      {/* Restaurant Pages */}
      {currentView === 'restaurant-sales' && user && isEmployee && (
        <RestaurantSales />
      )}

      {currentView === 'unified-sales' && user && isEmployee && (
        <UnifiedSalesReport />
      )}
    </div>
  );
}

const styles = {
  nav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "15px 30px",
    backgroundColor: "#007bff",
    color: "#fff",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
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
  logoutButton: {
    padding: "8px 16px",
    backgroundColor: "#dc3545",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
  },
};

export default App;
