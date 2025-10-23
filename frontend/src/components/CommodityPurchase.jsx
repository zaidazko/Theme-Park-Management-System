import { useState, useEffect } from 'react';

const CommodityPurchase = () => {
  const [commodities, setCommodities] = useState([]);
  const [selectedItem, setSelectedItem] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('credit');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCommodities();
  }, []);

  const fetchCommodities = async () => {
    try {
      const response = await fetch('http://localhost:5239/api/commodity/types');
      const data = await response.json();
      setCommodities(data);
    } catch (err) {
      setError('Failed to load items');
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
      const item = commodities.find(c => c.commodityTypeId === parseInt(selectedItem));
      
      const response = await fetch('http://localhost:5239/api/commodity/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: currentUser.customerId,
          commodityTypeId: parseInt(selectedItem),
          totalPrice: item.basePrice,
          paymentMethod: paymentMethod
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`✅ ${data.message}! Sale ID: ${data.saleId}`);
        setSelectedItem('');
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
      <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>🛍️ Buy Items</h2>

      {message && <div style={{ padding: '12px', backgroundColor: '#d4edda', color: '#155724', borderRadius: '6px', marginBottom: '20px', textAlign: 'center' }}>{message}</div>}
      {error && <div style={{ padding: '12px', backgroundColor: '#f8d7da', color: '#721c24', borderRadius: '6px', marginBottom: '20px', textAlign: 'center' }}>{error}</div>}

      <form onSubmit={handlePurchase}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Select Item:</label>
          <select value={selectedItem} onChange={(e) => setSelectedItem(e.target.value)} style={{ width: '100%', padding: '12px', fontSize: '16px', border: '2px solid #ddd', borderRadius: '6px' }} required>
            <option value="">-- Choose an item --</option>
            {commodities.map((item) => (
              <option key={item.commodityTypeId} value={item.commodityTypeId}>
                {item.commodityName} - ${item.basePrice}
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
            <option value="mobile">Mobile Payment</option>
          </select>
        </div>

        <button type="submit" disabled={loading || !selectedItem} style={{ width: '100%', padding: '14px', fontSize: '16px', fontWeight: '600', color: '#fff', backgroundColor: '#28a745', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
          {loading ? 'Processing...' : 'Purchase Item'}
        </button>
      </form>
    </div>
  );
};

export default CommodityPurchase;