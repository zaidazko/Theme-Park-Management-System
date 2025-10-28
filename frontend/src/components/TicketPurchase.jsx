import { useState, useEffect } from 'react';
import './ThemePark.css';

const TicketPurchase = () => {
  const [ticketTypes, setTicketTypes] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('credit');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTicketTypes();
  }, []);

  const fetchTicketTypes = async () => {
    try {
      const response = await fetch('http://localhost:5239/api/ticket/types');
      const data = await response.json();
      setTicketTypes(data);
    } catch (err) {
      setError('Failed to load ticket types');
    }
  };

  const handlePurchase = async (e) => {
    e.preventDefault();

    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

    if (!currentUser.customerId) {
      setError('Please login first');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5239/api/ticket/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: currentUser.customerId,
          ticketTypeId: selectedTicket.ticketTypeId,
          totalPrice: selectedTicket.price,
          paymentMethod: paymentMethod
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`Ticket purchased successfully! Your ticket ID is #${data.ticketId}`);
        setSelectedTicket(null);
        setTimeout(() => setMessage(''), 5000);
      } else {
        setError(data.message || 'Purchase failed');
      }
    } catch (err) {
      setError('Failed to process purchase');
    } finally {
      setLoading(false);
    }
  };

  const getTicketIcon = (typeName) => {
    const name = typeName.toLowerCase();
    if (name.includes('season') || name.includes('pass')) return '🎫';
    if (name.includes('vip') || name.includes('premium')) return '⭐';
    if (name.includes('child') || name.includes('kid')) return '👶';
    if (name.includes('senior')) return '👵';
    if (name.includes('group')) return '👥';
    return '🎢';
  };

  return (
    <div className="theme-park-page">
      <div className="theme-park-container-wide">
        <div className="theme-park-header">
          <h1 className="theme-park-title">🎫 Purchase Tickets</h1>
          <p className="theme-park-subtitle">Choose your perfect day at ThrillWorld</p>
        </div>

        {message && (
          <div className="theme-park-alert theme-park-alert-success">
            <span style={{ fontSize: '24px' }}>🎉</span>
            <span>{message}</span>
          </div>
        )}

        {error && (
          <div className="theme-park-alert theme-park-alert-error">
            <span style={{ fontSize: '24px' }}>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {!selectedTicket ? (
          <div>
            <h3 className="theme-park-section-title">Available Tickets</h3>
            <div className="theme-park-grid">
              {ticketTypes.map((ticket, index) => (
                <div
                  key={ticket.ticketTypeId}
                  className={`theme-park-price-card ${index === 1 ? 'featured' : ''}`}
                  onClick={() => setSelectedTicket(ticket)}
                  style={{ cursor: 'pointer' }}
                >
                  {index === 1 && <div className="theme-park-price-badge">🔥 BEST VALUE</div>}

                  <div style={{ fontSize: '64px', marginBottom: '15px' }}>
                    {getTicketIcon(ticket.typeName)}
                  </div>

                  <h3 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '15px', color: index === 1 ? 'white' : 'var(--text-dark)' }}>
                    {ticket.typeName}
                  </h3>

                  <div className="theme-park-price" style={{ color: index === 1 ? 'white' : 'var(--text-dark)' }}>
                    ${ticket.price}
                  </div>

                  <button
                    className={index === 1 ? "theme-park-btn theme-park-btn-secondary w-full" : "theme-park-btn theme-park-btn-primary w-full"}
                    style={{ marginTop: '20px' }}
                  >
                    Select Ticket
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="theme-park-card">
            <div className="theme-park-card-header">
              <h3 className="theme-park-card-title">
                <span>💳</span> Complete Your Purchase
              </h3>
              <button
                onClick={() => setSelectedTicket(null)}
                className="theme-park-btn theme-park-btn-outline theme-park-btn-sm"
              >
                ← Change Ticket
              </button>
            </div>

            <div style={{ marginBottom: '30px', padding: '25px', background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)', borderRadius: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <div>
                  <div style={{ fontSize: '14px', color: 'var(--text-medium)', marginBottom: '5px' }}>Selected Ticket</div>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-dark)' }}>
                    {getTicketIcon(selectedTicket.typeName)} {selectedTicket.typeName}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '14px', color: 'var(--text-medium)', marginBottom: '5px' }}>Total Price</div>
                  <div style={{ fontSize: '36px', fontWeight: '800', background: 'var(--secondary-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    ${selectedTicket.price}
                  </div>
                </div>
              </div>
            </div>

            <form onSubmit={handlePurchase} className="theme-park-form">
              <div className="theme-park-form-group">
                <label className="theme-park-label">💰 Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="theme-park-select"
                >
                  <option value="credit">💳 Credit Card</option>
                  <option value="debit">💳 Debit Card</option>
                  <option value="cash">💵 Cash</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="theme-park-btn theme-park-btn-success theme-park-btn-lg w-full"
              >
                {loading ? '⏳ Processing...' : `🎉 Purchase for $${selectedTicket.price}`}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketPurchase;