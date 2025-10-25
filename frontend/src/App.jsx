import React, { useState, useEffect } from "react";
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
import AssignMaintanence from "./components/AssignMaintanence";
import SubmitMaintanence from "./components/SubmitMaintanence";
import EmployeeDashboard from "./components/EmployeeDashboard";
import Rides from "./components/Rides";
import "./App.css";

function App() {
  const [currentView, setCurrentView] = useState("login");
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

  // Then in your JSX, show loading spinner while checking
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
    setCurrentView("login");
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
            <button
              onClick={() => setCurrentView("rides")}
              style={styles.navButton}
            >
              Rides
            </button>
            {/* EMPLOYEE VIEW */}
            {isEmployee && (
              <>
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
                  Assign Maintanence
                </button>
                <button
                  onClick={() => setCurrentView("maintenance-submission")}
                  style={styles.navButton}
                >
                  Submit Maintanence
                </button>
                <button
                  onClick={() => setCurrentView("employee-dashboard")}
                  style={styles.navButton}
                >
                  Employee Dashboard
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
                  Buy Items
                </button>
                <button
                  onClick={() => setCurrentView("my-tickets")}
                  style={styles.navButton}
                >
                  My Purchased Tickets
                </button>
                <button
                  onClick={() => setCurrentView("my-purchases")}
                  style={styles.navButton}
                >
                  My Purchased Items
                </button>
                <button onClick={() => setCurrentView('restaurant-menu')} style={styles.navButton}>
                  Order Food
                </button>
                <button onClick={() => setCurrentView('my-restaurant-orders')} style={styles.navButton}>
                  My Restaurant Orders
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
      {currentView === "login" && (
        <Login
          onLoginSuccess={handleLoginSuccess}
          onSwitchToRegister={() => setCurrentView("register")}
        />
      )}

      {currentView === "register" && (
        <Register
          onRegisterSuccess={handleRegisterSuccess}
          onSwitchToLogin={() => setCurrentView("login")}
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

      {/* Employee Pages */}
      {currentView === "ticket-sales" && user && isEmployee && <TicketSales />}

      {currentView === "commodity-sales" && user && isEmployee && (
        <CommoditySales />
      )}

      {currentView === "maintenance-request" && user && isEmployee && (
        <RequestMaintenance user={user} />
      )}

      {currentView === "maintenance-assignments" && user && isEmployee && (
        <AssignMaintanence user={user} />
      )}

      {currentView === "maintenance-submission" && user && isEmployee && (
        <SubmitMaintanence user={user} />
      )}

      {currentView === "employee-dashboard" && user && isEmployee && (
        <EmployeeDashboard />
      )}

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
