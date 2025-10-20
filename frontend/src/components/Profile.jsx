import React, { useState, useEffect } from 'react';
import { authAPI } from '../api';

function Profile({ user, onLogout }) {
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: ''
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await authAPI.getProfile(user.customerId);
      setProfile(data);
      setFormData({
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        email: data.email || '',
        phone: data.phone || '',
        dateOfBirth: data.dateOfBirth ? data.dateOfBirth.split('T')[0] : '',
      });
      setLoading(false);
    } catch (err) {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await authAPI.updateProfile(user.customerId, formData);
      setMessage('Profile updated successfully!');
      setIsEditing(false);
      loadProfile();
    } catch (err) {
      setMessage('Error updating profile');
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '50px', textAlign: 'center' }}>
        Loading...
      </div>
    );
  }

  const containerStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    padding: '20px'
  };

  const profileBoxStyle = {
    backgroundColor: 'white',
    padding: '40px',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    width: '100%',
    maxWidth: '600px'
  };

  const inputGroupStyle = {
    marginBottom: '15px'
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '5px',
    fontWeight: 'bold'
  };

  const inputStyle = {
    width: '100%',
    padding: '10px',
    fontSize: '16px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    boxSizing: 'border-box'
  };

  return (
    <div style={containerStyle}>
      <div style={profileBoxStyle}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '20px' 
        }}>
          <h2>My Profile</h2>
          <button 
            onClick={onLogout} 
            style={{ 
              padding: '8px 16px', 
              backgroundColor: '#dc3545', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px', 
              cursor: 'pointer' 
            }}
          >
            Logout
          </button>
        </div>

        <div style={{ 
          backgroundColor: '#e7f3ff', 
          padding: '15px', 
          borderRadius: '4px', 
          marginBottom: '20px' 
        }}>
          <p>
            Welcome, <strong>{user.username}</strong>!
          </p>
        </div>

        {message && (
          <div style={{ 
            padding: '10px', 
            backgroundColor: '#d4edda', 
            color: '#155724', 
            borderRadius: '4px', 
            marginBottom: '15px', 
            textAlign: 'center' 
          }}>
            {message}
          </div>
        )}

        {!isEditing ? (
          <div>
            <div style={{ padding: '12px', borderBottom: '1px solid #eee' }}>
              <strong>Name:</strong> {profile?.firstName} {profile?.lastName}
            </div>
            <div style={{ padding: '12px', borderBottom: '1px solid #eee' }}>
              <strong>Email:</strong> {profile?.email}
            </div>
            <div style={{ padding: '12px', borderBottom: '1px solid #eee' }}>
              <strong>Phone:</strong> {profile?.phone || 'Not provided'}
            </div>
            <div style={{ padding: '12px', borderBottom: '1px solid #eee' }}>
              <strong>Date of Birth:</strong>{' '}
              {profile?.dateOfBirth
                ? new Date(profile.dateOfBirth).toLocaleDateString()
                : 'Not provided'}
            </div>
            
            <button 
              onClick={() => setIsEditing(true)} 
              style={{ 
                marginTop: '20px', 
                width: '100%', 
                padding: '12px', 
                backgroundColor: '#007bff', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px', 
                cursor: 'pointer' 
              }}
            >
              Edit Profile
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={inputGroupStyle}>
              <label style={labelStyle}>First Name:</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                style={inputStyle}
              />
            </div>
            
            <div style={inputGroupStyle}>
              <label style={labelStyle}>Last Name:</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                style={inputStyle}
              />
            </div>
            
            <div style={inputGroupStyle}>
              <label style={labelStyle}>Email:</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                style={inputStyle}
              />
            </div>
            
            <div style={inputGroupStyle}>
              <label style={labelStyle}>Phone:</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                style={inputStyle}
              />
            </div>
            
            <div style={inputGroupStyle}>
              <label style={labelStyle}>Date of Birth:</label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                style={inputStyle}
              />
            </div>
            
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button 
                type="submit" 
                style={{ 
                  flex: 1, 
                  padding: '12px', 
                  backgroundColor: '#28a745', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '4px', 
                  cursor: 'pointer' 
                }}
              >
                Save
              </button>
              <button 
                type="button" 
                onClick={() => setIsEditing(false)} 
                style={{ 
                  flex: 1, 
                  padding: '12px', 
                  backgroundColor: '#6c757d', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '4px', 
                  cursor: 'pointer' 
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default Profile;