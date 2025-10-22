import React, { useState } from "react";
import Login from "./components/Login";
import Register from "./components/Register";
import Profile from "./components/Profile";
import "./App.css";
import Homepage from "./pages/Homepage";

function App() {
  const [currentView, setCurrentView] = useState("login");
  const [user, setUser] = useState(null);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setCurrentView("home");
  };

  const handleRegisterSuccess = (userData) => {
    setUser(userData);
    setCurrentView("home");
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentView("login");
  };

  const viewAccount = (userData) => {
    setUser(userData);
    setCurrentView("profile");
  };

  const backToHome = () => {
    setCurrentView("home");
  };

  return (
    <div className="App">
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
        <Profile
          user={user}
          onLogout={handleLogout}
          onBackToHome={backToHome}
        />
      )}

      {currentView === "home" && (
        <Homepage onViewAccount={() => viewAccount(user)} />
      )}
    </div>
  );
}

export default App;
