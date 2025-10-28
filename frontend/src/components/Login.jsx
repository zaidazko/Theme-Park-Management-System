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
      setError(err.response?.data?.message || "Login failed. Please check your credentials.");
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
            <h1 className="promo-title">WELCOME BACK TO<br />THRILLWORLD</h1>
            <p className="promo-subtitle">Your adventure awaits!</p>

            <div className="promo-features">
              <div className="promo-feature">
                <span className="feature-icon">🎢</span>
                <div className="feature-text">
                  <h3>50+ Rides</h3>
                  <p>World-class attractions</p>
                </div>
              </div>
              <div className="promo-feature">
                <span className="feature-icon">🎟️</span>
                <div className="feature-text">
                  <h3>Online Booking</h3>
                  <p>Skip the line</p>
                </div>
              </div>
              <div className="promo-feature">
                <span className="feature-icon">⭐</span>
                <div className="feature-text">
                  <h3>Member Perks</h3>
                  <p>Exclusive discounts</p>
                </div>
              </div>
            </div>

            <div className="promo-badge-floating">
              <div className="promo-special">
                <span className="badge-label">LIMITED OFFER</span>
                <span className="badge-deal">40% OFF</span>
                <span className="badge-info">Season Passes</span>
              </div>
            </div>
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
            <div className="brand-mini-logo">🎢</div>
            <h2 className="auth-form-title">Sign In</h2>
            <p className="auth-form-subtitle">Continue your adventure with ThrillWorld</p>
          </div>

          <form onSubmit={handleSubmit} className="modern-form">
            <div className="modern-form-group">
              <label className="modern-label">Username</label>
              <div className="input-wrapper">
                <span className="input-icon">👤</span>
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
                <span className="input-icon">🔒</span>
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

            <div className="form-options">
              <label className="checkbox-label">
                <input type="checkbox" />
                <span>Remember me</span>
              </label>
              <a href="#" className="forgot-password">Forgot password?</a>
            </div>

            {error && (
              <div className="modern-error-message">
                <span className="error-icon">⚠️</span>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="modern-submit-btn">
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

          <div className="auth-divider">
            <span>OR</span>
          </div>

          <div className="social-auth-buttons">
            <button className="social-btn google-btn">
              <span className="social-icon">G</span>
              Continue with Google
            </button>
            <button className="social-btn facebook-btn">
              <span className="social-icon">f</span>
              Continue with Facebook
            </button>
          </div>

          <div className="auth-switch">
            Don't have an account?{" "}
            <button onClick={onSwitchToRegister} className="switch-link">
              Create Account
            </button>
          </div>

          <div className="auth-security-badge">
            <span className="security-icon">🔐</span>
            <span>Secure SSL Encrypted Connection</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
