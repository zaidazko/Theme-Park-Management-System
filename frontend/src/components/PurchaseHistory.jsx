import React, { useEffect, useState } from 'react';
import './ThemePark.css';

const PurchaseHistory = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const isEmployee = currentUser.userType === 'Employee' || currentUser.userType === 'Manager';

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    setError('');
    try {
      const customerId = currentUser.customerId;

      const ticketUrl = isEmployee ? `${import.meta.env.VITE_API_URL}/ticket/sales` : `${import.meta.env.VITE_API_URL}/ticket/customer/${customerId}`;
      const commodityUrl = isEmployee ? `${import.meta.env.VITE_API_URL}/commodity/sales` : `${import.meta.env.VITE_API_URL}/commodity/customer/${customerId}`;
      const restaurantUrl = isEmployee ? `${import.meta.env.VITE_API_URL}/restaurant/orders` : `${import.meta.env.VITE_API_URL}/restaurant/customer/${customerId}/orders`;

      const [tRes, cRes, rRes] = await Promise.all([fetch(ticketUrl), fetch(commodityUrl), fetch(restaurantUrl)]);
      if (!tRes.ok || !cRes.ok || !rRes.ok) {
        // try to parse individual errors but fallback
        setError('Failed to load purchase history');
        setLoading(false);
        return;
      }

      const [tData, cData, rData] = await Promise.all([tRes.json(), cRes.json(), rRes.json()]);

      // Normalize items
      const tickets = (tData || []).map(s => ({
        id: s.ticketId,
        type: 'ticket',
        name: s.ticketType,
        price: s.price,
        paymentMethod: s.paymentMethod,
        date: s.purchaseDate,
        customerName: s.customerName,
        raw: s,
      }));

      const commodities = (cData || []).map(s => ({
        id: s.saleId,
        type: 'commodity',
        name: s.commodityName,
        price: s.price,
        paymentMethod: s.paymentMethod,
        date: s.purchaseDate,
        customerName: s.customerName,
        raw: s,
      }));

      const restaurants = (rData || []).map(s => ({
        id: s.orderId,
        type: 'restaurant',
        name: s.restaurantName || `Order #${s.orderId}`,
        price: s.totalPrice || s.price,
        paymentMethod: s.paymentMethod,
        date: s.orderDate || s.purchaseDate,
        customerName: s.customerName,
        raw: s,
      }));

      const merged = [...tickets, ...commodities, ...restaurants]
        .filter(Boolean)
        .sort((a,b) => new Date(b.date) - new Date(a.date));

      setItems(merged);
    } catch (err) {
      console.error(err);
      setError('Failed to load purchase history');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="theme-park-page"><div className="theme-park-loading"><div className="theme-park-spinner"></div><div className="theme-park-loading-text">Loading purchase history...</div></div></div>;

  return (
    <div className="theme-park-page">
      <div className="theme-park-container">
        <div className="theme-park-header">
          <h1 className="theme-park-title">{isEmployee ? '📊 All Sales' : '🧾 Purchase History'}</h1>
          <p className="theme-park-subtitle">Combined ticket, merchandise and dining history</p>
        </div>

        {error && <div className="theme-park-alert theme-park-alert-error">{error}</div>}

        {items.length === 0 ? (
          <div className="theme-park-empty">
            <div className="theme-park-empty-icon">🧾</div>
            <div className="theme-park-empty-title">No Records Found</div>
            <div className="theme-park-empty-text">No purchase history available.</div>
          </div>
        ) : (
          <div className="theme-park-card">
            <div className="theme-park-card-header">
              <h3 className="theme-park-card-title">Combined History</h3>
              <div className="theme-park-badge theme-park-badge-primary">{items.length}</div>
            </div>
            <div className="theme-park-table-container">
              <table className="theme-park-table">
                <thead>
                  <tr>
                    {isEmployee && <th>ID</th>}
                    {isEmployee && <th>Customer</th>}
                    <th>Type</th>
                    <th>Item</th>
                    <th>Price</th>
                    <th>Payment</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map(it => (
                    <tr key={`${it.type}-${it.id}-${it.date}`}>
                      {isEmployee && <td>#{it.id}</td>}
                      {isEmployee && <td>{it.customerName}</td>}
                      <td>{it.type === 'ticket' ? '🎫 Ticket' : it.type === 'commodity' ? '🛍️ Item' : '🍽️ Order'}</td>
                      <td>{it.name}</td>
                      <td style={{ fontWeight: 700, color: 'var(--success-color)' }}>${(it.price || 0).toFixed(2)}</td>
                      <td>{it.paymentMethod || ''}</td>
                      <td>{it.date ? new Date(it.date).toLocaleDateString() : ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PurchaseHistory;
