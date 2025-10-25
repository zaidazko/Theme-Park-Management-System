import React, { useState, useEffect } from "react";
import { authAPI } from "../api";
import './Admin.css';

function Admin({ user, onLogout }) {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [stats, setStats] = useState({
    totalCustomers: 0,
    recentRegistrations: 0,
    activeUsers: 0
  });

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      setLoading(true);

      const customersData = await authAPI.getAllCustomers();
      setCustomers(customersData);
      
      
      const totalCustomers = customersData.length;
      const recentRegistrations = customersData.filter(customer => {
        const createdAt = new Date(customer.createdAt);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return createdAt > weekAgo;
      }).length;
      
      setStats({
        totalCustomers,
        recentRegistrations,
        activeUsers: totalCustomers //dummy stats
      });
      
      setLoading(false);
    } catch (err) {
      console.error("Error loading admin data:", err);
      setMessage("Error loading admin data. Please try again.");
      setLoading(false);
    }
  };

  const handleDeleteCustomer = async (customerId) => {
    if (!window.confirm("Are you sure you want to delete this customer?")) {
      return;
    }

    try {
      await authAPI.deleteCustomer(customerId);
      setMessage("Customer deleted successfully!");
      loadAdminData(); // Refresh the list
    } catch (err) {
      setMessage("Error deleting customer. Please try again.");
      console.error("Delete error:", err);
    }
  };

  if (loading) {
    return <div className="container">Loading admin data...</div>;
  }

  return (
    <div className="container">
      <div className="admin-box">
        <div className="header">
          <h2>Admin Dashboard</h2>
          <div className="header-actions">
            <span className="welcome-text">Welcome, {user.firstName}!</span>
            <button onClick={onLogout} className="logout-button">
              Logout
            </button>
          </div>
        </div>

        {message && (
          <div className="message">
            {message}
            <button onClick={() => setMessage("")} className="close-button">
              ×
            </button>
          </div>
        )}

        {/* Statistics Cards */}
        <div className="stats-container">
          <div className="stat-card">
            <h3>Total Customers</h3>
            <div className="stat-number">{stats.totalCustomers}</div>
          </div>
          <div className="stat-card">
            <h3>Recent Registrations</h3>
            <div className="stat-number">{stats.recentRegistrations}</div>
            <div className="stat-subtext">Last 7 days</div>
          </div>
          <div className="stat-card">
            <h3>Active Users</h3>
            <div className="stat-number">{stats.activeUsers}</div>
          </div>
        </div>

        {/* Customers Table */}
        <div className="section">
          <h3>Customer Management</h3>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Registration Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.customerId}>
                    <td>{customer.customerId}</td>
                    <td>{customer.firstName} {customer.lastName}</td>
                    <td>{customer.email}</td>
                    <td>{customer.phone || "N/A"}</td>
                    <td>
                      {customer.createdAt 
                        ? new Date(customer.createdAt).toLocaleDateString()
                        : "N/A"
                      }
                    </td>
                    <td>
                      <button
                        onClick={() => handleDeleteCustomer(customer.customerId)}
                        className="delete-button"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Admin Actions */}
        <div className="section">
          <h3>Admin Actions</h3>
          <div className="action-buttons">
            <button onClick={loadAdminData} className="action-button">
              Refresh Data
            </button>
            <button className="action-button">
              Export Customer Data
            </button>
            <button className="action-button">
              System Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Admin;
