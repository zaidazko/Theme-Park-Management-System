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
    dateOfBirth: '',
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
      console.error('Error loading profile:', err);
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      await authAPI.updateProfile(user.customerId, formData);
      setMessage('Profile updated successfully!');
      setIsEditing(false);
      loadProfile();
    } catch (err) {
      setMessage('Error updating profile. Please try again.');
      console.error('Update error:', err);
    }
  };

  if (loading) {
    return <div style={styles.container}>Loading...</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.profileBox}>
        <div style={styles.header}>
          <h2>My Profile</h2>
          <button onClick={onLogout} style={styles.logoutButton}>
            Logout
          </button>
        </div>

        <div style={styles.welcomeText}>
          <p>Welcome, <strong>{user.username}</strong>!</p>
          <p style={styles.userType}>User Type: {user.userType}</p>
        </div>

        {message && <div style={styles.message}>{message}</div>}

        {!isEditing ? (
          <div style={styles.profileInfo}>
            <div style={styles.infoRow}>
              <strong>Name:</strong> {profile?.firstName} {profile?.lastName}
            </div>
            <div style={styles.infoRow}>
              <strong>Email:</strong> {profile?.email}
            </div>
            <div style={styles.infoRow}>
              <strong>Phone:</strong> {profile?.phone || 'Not provided'}
            </div>
            <div style={styles.infoRow}>
              <strong>Date of Birth:</strong>{' '}
              {profile?.dateOfBirth
                ? new Date(profile.dateOfBirth).toLocaleDateString()
                : 'Not provided'}
            </div>
            <div style={styles.infoRow}>
              <strong>Member Since:</strong>{' '}
              {profile?.createdAt
                ? new Date(profile.createdAt).toLocaleDateString()
                : 'N/A'}
            </div>

            <button
              onClick={() => setIsEditing(true)}
              style={styles.editButton}
            >
              Edit Profile
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.inputGroup}>
              <label>First Name:</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                style={styles.input}
              />
            </div>

            <div style={styles.inputGroup}>
              <label>Last Name:</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                style={styles.input}
              />
            </div>

            <div style={styles.inputGroup}>
              <label>Email:</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                style={styles.input}
              />
            </div>

            <div style={styles.inputGroup}>
              <label>Phone:</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                style={styles.input}
              />
            </div>

            <div style={styles.inputGroup}>
              <label>Date of Birth:</label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                style={styles.input}
              />
            </div>

            <div style={styles.buttonGroup}>
              <button type="submit" style={styles.saveButton}>
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                style={styles.cancelButton}
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

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    padding: '20px',
  },
  profileBox: {
    backgroundColor: 'white',
    padding: '40px',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    width: '100%',
    maxWidth: '600px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  logoutButton: {
    padding: '8px 16px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  welcomeText: {
    backgroundColor: '#e7f3ff',
    padding: '15px',
    borderRadius: '4px',
    marginBottom: '20px',
  },
  userType: {
    fontSize: '14px',
    color: '#666',
    marginTop: '5px',
  },
  profileInfo: {
    marginTop: '20px',
  },
  infoRow: {
    padding: '12px',
    borderBottom: '1px solid #eee',
  },
  editButton: {
    marginTop: '20px',
    width: '100%',
    padding: '12px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    cursor: 'pointer',
  },
  form: {
    marginTop: '20px',
  },
  inputGroup: {
    marginBottom: '15px',
  },
  input: {
    width: '100%',
    padding: '10px',
    fontSize: '16px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    boxSizing: 'border-box',
    marginTop: '5px',
  },
  buttonGroup: {
    display: 'flex',
    gap: '10px',
    marginTop: '20px',
  },
  saveButton: {
    flex: 1,
    padding: '12px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    cursor: 'pointer',
  },
  cancelButton: {
    flex: 1,
    padding: '12px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    cursor: 'pointer',
  },
  message: {
    padding: '10px',
    backgroundColor: '#d4edda',
    color: '#155724',
    borderRadius: '4px',
    marginBottom: '15px',
  },
};

export default Profile;