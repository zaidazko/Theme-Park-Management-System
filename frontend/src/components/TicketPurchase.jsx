import { useState, useEffect } from 'react';

const TicketPurchase = () => {
  const [ticketTypes, setTicketTypes] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState('');
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
      const ticket = ticketTypes.find(t => t.ticketTypeId === parseInt(selectedTicket));
      
      const response = await fetch('http://localhost:5239/api/ticket/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: currentUser.customerId,
          ticketTypeId: parseInt(selectedTicket),
          totalPrice: ticket.price,
          paymentMethod: paymentMethod
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`✅ Ticket purchased! ID: ${data.ticketId}`);
        setSelectedTicket('');
      } else {
        setError(data.message || 'Purchase failed');
      }
    } catch (err) {
      setError('Failed to process purchase');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '30px', backgroundColor: '#fff', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>🎫 Purchase Tickets</h2>

      {message && <div style={{ padding: '12px', backgroundColor: '#d4edda', color: '#155724', borderRadius: '6px', marginBottom: '20px', textAlign: 'center' }}>{message}</div>}
      {error && <div style={{ padding: '12px', backgroundColor: '#f8d7da', color: '#721c24', borderRadius: '6px', marginBottom: '20px', textAlign: 'center' }}>{error}</div>}

      <form onSubmit={handlePurchase}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Select Ticket:</label>
          <select value={selectedTicket} onChange={(e) => setSelectedTicket(e.target.value)} style={{ width: '100%', padding: '12px', fontSize: '16px', border: '2px solid #ddd', borderRadius: '6px' }} required>
            <option value="">-- Choose a ticket --</option>
            {ticketTypes.map((ticket) => (
              <option key={ticket.ticketTypeId} value={ticket.ticketTypeId}>
                {ticket.typeName} - ${ticket.price}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Payment Method:</label>
          <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} style={{ width: '100%', padding: '12px', fontSize: '16px', border: '2px solid #ddd', borderRadius: '6px' }}>
            <option value="credit">Credit Card</option>
            <option value="debit">Debit Card</option>
            <option value="cash">Cash</option>
          </select>
        </div>

        <button type="submit" disabled={loading || !selectedTicket} style={{ width: '100%', padding: '14px', fontSize: '16px', fontWeight: '600', color: '#fff', backgroundColor: '#007bff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
          {loading ? 'Processing...' : 'Buy Ticket'}
        </button>
      </form>
    </div>
  );
};

export default TicketPurchase;