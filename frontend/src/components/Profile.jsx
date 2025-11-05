import React, { useState, useEffect } from "react";
import { authAPI } from "../api";
import "./ThemePark.css";

function Profile({ user, onLogout }) {
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const userId =
        user.userType === "Employee" ? user.employeeId : user.customerId;
      const data = await authAPI.getProfile(userId, user.userType);
      setProfile(data);
      setFormData({
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        email: data.email || "",
        phone: data.phone || "",
        dateOfBirth: data.dateOfBirth ? data.dateOfBirth.split("T")[0] : "",
      });
      setLoading(false);
    } catch (err) {
      setLoading(false);
      console.error("Error loading profile:", err);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userId =
        user.userType === "Employee" ? user.employeeId : user.customerId;
      await authAPI.updateProfile(userId, formData, user.userType);
      setMessage("Profile updated successfully!");
      setIsEditing(false);
      loadProfile();
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage("Error updating profile");
      console.error("Error updating profile:", err);
    }
  };

  if (loading) {
    return (
      <div className="theme-park-page">
        <div className="theme-park-loading">
          <div className="theme-park-spinner"></div>
          <div className="theme-park-loading-text">Loading your profile...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="theme-park-page">
      <div className="theme-park-container">
        <div className="theme-park-header">
          <h1 className="theme-park-title">My Profile</h1>
          <p className="theme-park-subtitle">Manage your personal information and settings</p>
        </div>

        {/* Welcome Card */}
        <div className="theme-park-card theme-park-card-gradient" style={{ marginBottom: '30px' }}>
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>
              {user.userType === "Employee" ? "👨‍💼" : "🎉"}
            </div>
            <h2 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '10px', color: 'var(--text-dark)' }}>
              Welcome back, {profile?.firstName}!
            </h2>
            <div className="theme-park-badge theme-park-badge-primary" style={{ fontSize: '14px' }}>
              {user.userType === "Employee" ? "🎯 Employee Account" : "⭐ Customer Account"}
            </div>
          </div>
        </div>

        {message && (
          <div className={message.includes("success") ? "theme-park-alert theme-park-alert-success" : "theme-park-alert theme-park-alert-error"}>
            <span style={{ fontSize: '20px' }}>
              {message.includes("success") ? "✅" : "❌"}
            </span>
            <span>{message}</span>
          </div>
        )}

        <div className="theme-park-card">
          <div className="theme-park-card-header">
            <h3 className="theme-park-card-title">
              <span>👤</span> Personal Information
            </h3>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="theme-park-btn theme-park-btn-primary theme-park-btn-sm"
              >
                ✏️ Edit Profile
              </button>
            )}
          </div>

          {!isEditing ? (
            <div style={{ display: 'grid', gap: '20px' }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '25px'
              }}>
                <div style={{
                  padding: '20px',
                  background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
                  borderRadius: '12px',
                  borderLeft: '4px solid var(--primary-color)'
                }}>
                  <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-medium)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Full Name
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-dark)' }}>
                    {profile?.firstName} {profile?.lastName}
                  </div>
                </div>

                <div style={{
                  padding: '20px',
                  background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
                  borderRadius: '12px',
                  borderLeft: '4px solid var(--accent-color)'
                }}>
                  <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-medium)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Email Address
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-dark)' }}>
                    {profile?.email}
                  </div>
                </div>

                <div style={{
                  padding: '20px',
                  background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
                  borderRadius: '12px',
                  borderLeft: '4px solid var(--success-color)'
                }}>
                  <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-medium)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Phone Number
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-dark)' }}>
                    {profile?.phone || "Not provided"}
                  </div>
                </div>

                <div style={{
                  padding: '20px',
                  background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
                  borderRadius: '12px',
                  borderLeft: '4px solid var(--warning-color)'
                }}>
                  <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-medium)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Date of Birth
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-dark)' }}>
                    {profile?.dateOfBirth
                      ? new Date(profile.dateOfBirth).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "Not provided"}
                  </div>
                </div>

                {user.userType === "Customer" && (
                  <div style={{
                    padding: '20px',
                    background: 'linear-gradient(135deg, rgba(255, 0, 110, 0.05) 0%, rgba(255, 69, 0, 0.05) 100%)',
                    borderRadius: '12px',
                    borderLeft: '4px solid var(--accent-color)'
                  }}>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-medium)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Customer ID
                    </div>
                    <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-dark)' }}>
                      #{user.customerId}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="theme-park-form">
              <div className="theme-park-form-row">
                <div className="theme-park-form-group">
                  <label className="theme-park-label">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="theme-park-input"
                    required
                  />
                </div>

                <div className="theme-park-form-group">
                  <label className="theme-park-label">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="theme-park-input"
                    required
                  />
                </div>
              </div>

              <div className="theme-park-form-group">
                <label className="theme-park-label">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="theme-park-input"
                  required
                />
              </div>

              <div className="theme-park-form-group">
                <label className="theme-park-label">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="theme-park-input"
                  placeholder="(555) 123-4567"
                />
              </div>

              <div className="theme-park-form-group">
                <label className="theme-park-label">Date of Birth</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  className="theme-park-input"
                />
              </div>

              <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
                <button
                  type="submit"
                  className="theme-park-btn theme-park-btn-success w-full"
                >
                  💾 Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="theme-park-btn theme-park-btn-outline w-full"
                >
                  ✖️ Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;
