import React, { useState } from "react";
import { authAPI } from "../api";
import "./AdvancedAuthPage.css";

function Login({ onLoginSuccess, onSwitchToRegister, onBackToLanding }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await authAPI.login({ username, password });
      onLoginSuccess(response);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Login failed. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="advanced-auth-container">
      {/* Split Screen Layout */}
      <div className="auth-promo-side">
        <div className="promo-overlay">
          <div className="promo-content">
            <h1 className="promo-title">
              WELCOME BACK TO
              <br />
              THRILLWORLD
            </h1>
            <p className="promo-subtitle">Your adventure awaits!</p>
          </div>
        </div>
      </div>

      <div className="auth-form-side">
        {onBackToLanding && (
          <button onClick={onBackToLanding} className="back-to-home-btn">
            ← Back to Home
          </button>
        )}

        <div className="auth-form-container">
          <div className="auth-form-header">
            <h2 className="auth-form-title">Sign In</h2>
            <p className="auth-form-subtitle">
              Continue your adventure with ThrillWorld
            </p>
          </div>

          <form onSubmit={handleSubmit} className="modern-form">
            <div className="modern-form-group">
              <label className="modern-label">Username</label>
              <div className="input-wrapper">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="modern-input"
                  placeholder="Enter your username"
                />
              </div>
            </div>

            <div className="modern-form-group">
              <label className="modern-label">Password</label>
              <div className="input-wrapper">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="modern-input"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            {error && (
              <div className="modern-error-message">
                <span className="error-icon">⚠️</span>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="modern-submit-btn"
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Signing In...
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <span className="btn-arrow">→</span>
                </>
              )}
            </button>
          </form>

          <div className="auth-switch">
            Don't have an account?{" "}
            <button onClick={onSwitchToRegister} className="switch-link">
              Create Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
