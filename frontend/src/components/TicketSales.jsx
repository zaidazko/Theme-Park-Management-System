import { useState, useEffect } from 'react';
import './ThemePark.css';

const TicketSales = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const isEmployee = currentUser.userType === 'Employee' || currentUser.userType === 'Manager';

  useEffect(() => {
    if (isEmployee) {
      fetchAllSales();
    } else {
      fetchMyTickets();
    }
  }, []);

  // For Employees/Managers - Show ALL sales
  const fetchAllSales = async () => {
    try {
      const response = await fetch('http://localhost:5239/api/ticket/sales');
      if (!response.ok) throw new Error('Failed to fetch sales');
      const data = await response.json();
      setSales(data);
    } catch (err) {
      setError('Failed to load ticket sales');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // For Customers - Show only their tickets
  const fetchMyTickets = async () => {
    if (!currentUser.customerId) {
      setError('Please login to view your tickets');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`http://localhost:5239/api/ticket/customer/${currentUser.customerId}`);
      if (!response.ok) throw new Error('Failed to fetch tickets');
      const data = await response.json();
      setSales(data);
    } catch (err) {
      setError('Failed to load your tickets');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    return sales.reduce((total, sale) => total + sale.price, 0).toFixed(2);
  };

  if (loading) {
    return (
      <div className="theme-park-page">
        <div className="theme-park-loading">
          <div className="theme-park-spinner"></div>
          <div className="theme-park-loading-text">Loading tickets...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="theme-park-page">
      <div className="theme-park-container">
        <div className="theme-park-header">
          <h1 className="theme-park-title">{isEmployee ? '📊 Ticket Sales' : '🎫 My Tickets'}</h1>
          <p className="theme-park-subtitle">
            {isEmployee ? 'Track all ticket sales revenue' : 'View your purchase history'}
          </p>
        </div>

        {error && (
          <div className="theme-park-alert theme-park-alert-error">
            <span style={{ fontSize: '24px' }}>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {sales.length === 0 ? (
          <div className="theme-park-empty">
            <div className="theme-park-empty-icon">🎫</div>
            <div className="theme-park-empty-title">No Tickets Found</div>
            <div className="theme-park-empty-text">
              {isEmployee ? 'No ticket sales recorded yet' : "You haven't purchased any tickets yet"}
            </div>
          </div>
        ) : (
          <>
            <div className="theme-park-stat-card">
              <div className="theme-park-stat-icon">💰</div>
              <div className="theme-park-stat-label">
                {isEmployee ? 'Total Revenue' : 'Total Spent'}
              </div>
              <div className="theme-park-stat-value">${calculateTotal()}</div>
            </div>

            <div className="theme-park-card">
              <div className="theme-park-card-header">
                <h3 className="theme-park-card-title">
                  <span>📋</span> Purchase History
                </h3>
                <div className="theme-park-badge theme-park-badge-primary">
                  {sales.length} {sales.length === 1 ? 'Ticket' : 'Tickets'}
                </div>
              </div>

              <div className="theme-park-table-container">
                <table className="theme-park-table">
                  <thead>
                    <tr>
                      <th>Ticket ID</th>
                      {isEmployee && <th>Customer</th>}
                      <th>Type</th>
                      <th>Price</th>
                      <th>Payment</th>
                      <th>Purchase Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sales.map((sale) => (
                      <tr key={sale.ticketId}>
                        <td>#{sale.ticketId}</td>
                        {isEmployee && <td>{sale.customerName}</td>}
                        <td>🎢 {sale.ticketType}</td>
                        <td style={{ fontWeight: '700', color: 'var(--success-color)' }}>
                          ${sale.price}
                        </td>
                        <td>💳 {sale.paymentMethod}</td>
                        <td>{new Date(sale.purchaseDate).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TicketSales;