import React, { useState } from "react";
import { authAPI } from "../api";
import "./AdvancedAuthPage.css";

function Register({ onRegisterSuccess, onSwitchToLogin, onBackToLanding }) {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
    dateOfBirth: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await authAPI.register(formData);
      onRegisterSuccess(response);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="advanced-auth-container">
      {/* Split Screen Layout */}
      <div className="auth-promo-side register-promo">
        <div className="promo-overlay">
          <div className="promo-content">
            <h1 className="promo-title">JOIN THRILLWORLD<br />TODAY!</h1>
            <p className="promo-subtitle">Unlock exclusive member benefits</p>

            <div className="benefits-list">
              <div className="benefit-item">
                <span className="benefit-check">✓</span>
                <div>
                  <h4>Online Ticket Booking</h4>
                  <p>Skip the lines, book from home</p>
                </div>
              </div>
              <div className="benefit-item">
                <span className="benefit-check">✓</span>
                <div>
                  <h4>Exclusive Member Discounts</h4>
                  <p>Save up to 40% on passes</p>
                </div>
              </div>
              <div className="benefit-item">
                <span className="benefit-check">✓</span>
                <div>
                  <h4>Early Access to Events</h4>
                  <p>Be the first to know</p>
                </div>
              </div>
              <div className="benefit-item">
                <span className="benefit-check">✓</span>
                <div>
                  <h4>Special Birthday Offers</h4>
                  <p>Free admission on your special day</p>
                </div>
              </div>
            </div>

            <div className="promo-stat-cards">
              <div className="stat-card">
                <div className="stat-number">2M+</div>
                <div className="stat-label">Happy Members</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">4.9★</div>
                <div className="stat-label">App Rating</div>
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

        <div className="auth-form-container register-form">
          <div className="auth-form-header">
            <div className="brand-mini-logo">🎢</div>
            <h2 className="auth-form-title">Create Account</h2>
            <p className="auth-form-subtitle">Start your adventure with ThrillWorld</p>
          </div>

          <form onSubmit={handleSubmit} className="modern-form">
            <div className="form-row-2">
              <div className="modern-form-group">
                <label className="modern-label">First Name</label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    className="modern-input"
                    placeholder="John"
                  />
                </div>
              </div>

              <div className="modern-form-group">
                <label className="modern-label">Last Name</label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    className="modern-input"
                    placeholder="Doe"
                  />
                </div>
              </div>
            </div>

            <div className="modern-form-group">
              <label className="modern-label">Username</label>
              <div className="input-wrapper">
                <span className="input-icon">👤</span>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  className="modern-input"
                  placeholder="Choose a username"
                />
              </div>
            </div>

            <div className="modern-form-group">
              <label className="modern-label">Email Address</label>
              <div className="input-wrapper">
                <span className="input-icon">✉️</span>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="modern-input"
                  placeholder="your.email@example.com"
                />
              </div>
            </div>

            <div className="modern-form-group">
              <label className="modern-label">Password</label>
              <div className="input-wrapper">
                <span className="input-icon">🔒</span>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength="6"
                  className="modern-input"
                  placeholder="At least 6 characters"
                />
              </div>
            </div>

            <div className="form-row-2">
              <div className="modern-form-group">
                <label className="modern-label">Phone Number</label>
                <div className="input-wrapper">
                  <span className="input-icon">📱</span>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="modern-input"
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>

              <div className="modern-form-group">
                <label className="modern-label">Date of Birth</label>
                <div className="input-wrapper">
                  <span className="input-icon">🎂</span>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    className="modern-input"
                  />
                </div>
              </div>
            </div>

            <label className="terms-checkbox">
              <input type="checkbox" required />
              <span>
                I agree to the <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>
              </span>
            </label>

            {error && (
              <div className="modern-error-message">
                <span className="error-icon">⚠️</span>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="modern-submit-btn register-btn">
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Creating Account...
                </>
              ) : (
                <>
                  <span>Create Account</span>
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
            Already have an account?{" "}
            <button onClick={onSwitchToLogin} className="switch-link">
              Sign In
            </button>
          </div>

          <div className="auth-security-badge">
            <span className="security-icon">🔐</span>
            <span>Your data is protected with 256-bit encryption</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
