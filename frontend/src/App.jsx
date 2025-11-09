import React, { useState, useEffect } from "react";
import LandingPage from "./components/LandingPage";
import Login from "./components/Login";
import Register from "./components/Register";
import Profile from "./components/Profile";
import TicketPurchase from "./components/TicketPurchase";
import TicketSales from "./components/TicketSales";
import CommodityPurchase from "./components/CommodityPurchase";
import CommoditySales from "./components/CommoditySales";
import RestaurantMenu from "./components/RestaurantMenu";
import RestaurantSales from "./components/RestaurantSales";
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
import "./App.css";

function App() {
  const [currentView, setCurrentView] = useState("landing");
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

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
          <h2 style={styles.title}>🎢 Amusement Park</h2>
          <div style={styles.navButtons}>
            <button
              onClick={() => setCurrentView("profile")}
              style={styles.navButton}
            >
              Profile
            </button>
            {/* EMPLOYEE VIEW */}
            {isEmployee && (
              <>
              {/*
                <button
                  onClick={() => setCurrentView("ticket-sales")}
                  style={styles.navButton}
                >
                  Ticket Sales
                </button>
                <button
                  onClick={() => setCurrentView("commodity-sales")}
                  style={styles.navButton}
                >
                  Commodity Sales
                </button>
                <button
                  onClick={() => setCurrentView("restaurant-sales")}
                  style={styles.navButton}
                >
                  Restaurant Sales
                </button>
                */}
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
                  View Reviews
                </button>
                <button
                  onClick={() => setCurrentView("maintenance-request")}
                  style={styles.navButton}
                >
                  Request Maintenance
                </button>
                <button
                  onClick={() => setCurrentView("maintenance-assignments")}
                  style={styles.navButton}
                >
                  View Maintenance
                </button>
                <button
                  onClick={() => setCurrentView("maintenance-submission")}
                  style={styles.navButton}
                >
                  Submit Maintenance
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
            )}

            {/* CUSTOMER VIEW */}
            {!isEmployee && (
              <>
                <button
                  onClick={() => setCurrentView("buy-tickets")}
                  style={styles.navButton}
                >
                  Buy Tickets
                </button>
                <button
                  onClick={() => setCurrentView("buy-items")}
                  style={styles.navButton}
                >
                  Shop Merchandise
                </button>
                <button
                  onClick={() => setCurrentView("rides")}
                  style={styles.navButton}
                >
                  Rides
                </button>                
                <button
                  onClick={() => setCurrentView("my-tickets")}
                  style={styles.navButton}
                >
                  My Tickets
                </button>
                <button
                  onClick={() => setCurrentView("my-purchases")}
                  style={styles.navButton}
                >
                  My Merchandise
                </button>
                <button
                  onClick={() => setCurrentView("my-reviews")}
                  style={styles.navButton}
                >
                  My Reviews
                </button>
                <button onClick={() => setCurrentView('restaurant-menu')} style={styles.navButton}>
                  Dining & Food
                </button>
                <button onClick={() => setCurrentView('my-restaurant-orders')} style={styles.navButton}>
                  My Orders
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
        />
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
      {currentView === "buy-tickets" && user && !isEmployee && (
        <TicketPurchase />
      )}

      {currentView === "buy-items" && user && !isEmployee && (
        <CommodityPurchase />
      )}

      {currentView === "my-tickets" && user && !isEmployee && <TicketSales />}

      {currentView === "my-purchases" && user && !isEmployee && (
        <CommoditySales />
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

      {currentView === "maintenance-assignments" && user && isEmployee && (
        <AssignMaintenance user={user} />
      )}

      {currentView === "maintenance-submission" && user && isEmployee && (
        <SubmitMaintenance user={user} />
      )}

      {currentView === "employee-dashboard" && user && isEmployee && (
        <EmployeeDashboard />
      )}

      {currentView === "reviews" && user && isEmployee && <Reviews />}

      {/* Restaurant Pages */}
      {currentView === 'restaurant-menu' && user && !isEmployee && (
        <RestaurantMenu />
      )}

      {currentView === 'my-restaurant-orders' && user && !isEmployee && (
        <RestaurantSales />
      )}

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
  title: {
    margin: 0,
    fontSize: "24px",
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
