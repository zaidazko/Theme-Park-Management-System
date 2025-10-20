import React, { useState } from 'react';
import { authAPI } from '../api';

function Register({ onRegisterSuccess, onSwitchToLogin }) {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    dateOfBirth: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.register(formData);
      onRegisterSuccess(response);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const containerStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    padding: '20px'
  };

  const formBoxStyle = {
    backgroundColor: 'white',
    padding: '40px',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    width: '100%',
    maxWidth: '400px'
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

  const buttonStyle = {
    width: '100%',
    padding: '12px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    cursor: 'pointer'
  };

  return (
    <div style={containerStyle}>
      <div style={formBoxStyle}>
        <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Register</h2>
        <form onSubmit={handleSubmit}>
          <div style={inputGroupStyle}>
            <label style={labelStyle}>Username:</label>
            <input 
              type="text" 
              name="username" 
              value={formData.username} 
              onChange={handleChange} 
              required 
              style={inputStyle} 
            />
          </div>
          
          <div style={inputGroupStyle}>
            <label style={labelStyle}>Password:</label>
            <input 
              type="password" 
              name="password" 
              value={formData.password} 
              onChange={handleChange} 
              required 
              minLength="6" 
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
              required 
              style={inputStyle} 
            />
          </div>
          
          <div style={inputGroupStyle}>
            <label style={labelStyle}>First Name:</label>
            <input 
              type="text" 
              name="firstName" 
              value={formData.firstName} 
              onChange={handleChange} 
              required 
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
              required 
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
          
          {error && (
            <div style={{ 
              color: 'red', 
              marginBottom: '10px', 
              textAlign: 'center' 
            }}>
              {error}
            </div>
          )}
          
          <button 
            type="submit" 
            disabled={loading} 
            style={buttonStyle}
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
        
        <p style={{ marginTop: '20px', textAlign: 'center' }}>
          Already have an account?{' '}
          <span 
            onClick={onSwitchToLogin} 
            style={{ 
              color: '#007bff', 
              cursor: 'pointer', 
              textDecoration: 'underline' 
            }}
          >
            Login here
          </span>
        </p>
      </div>
    </div>
  );
}

export default Register;