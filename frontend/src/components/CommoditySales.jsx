import { useState, useEffect } from 'react';

const CommoditySales = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const isEmployee = currentUser.userType === 'Employee' || currentUser.userType === 'Manager';

  useEffect(() => {
    if (isEmployee) {
      fetchAllSales();
    } else {
      fetchMySales();
    }
  }, []);

  const fetchAllSales = async () => {
    try {
      const response = await fetch('http://localhost:5239/api/commodity/sales');
      if (!response.ok) throw new Error('Failed to fetch sales');
      const data = await response.json();
      setSales(data);
    } catch (err) {
      setError('Failed to load commodity sales');
      console.log(err)
    } finally {
      setLoading(false);
    }
  };

  const fetchMySales = async () => {
    if (!currentUser.customerId) {
      setError('Please login to view your purchases');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`http://localhost:5239/api/commodity/customer/${currentUser.customerId}`);
      if (!response.ok) throw new Error('Failed to fetch purchases');
      const data = await response.json();
      setSales(data);
    } catch (err) {
      setError('Failed to load your purchases');
      console.log(err)
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    return sales.reduce((total, sale) => total + sale.price, 0).toFixed(2);
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '40px auto', padding: '30px', backgroundColor: '#fff', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>
        {isEmployee ? '📊 All Commodity Sales' : '🛍️ My Purchases'}
      </h2>

      {error && <div style={{ padding: '12px', backgroundColor: '#f8d7da', color: '#721c24', borderRadius: '6px', marginBottom: '20px', textAlign: 'center' }}>{error}</div>}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>
      ) : sales.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
          {isEmployee ? 'No commodity sales yet' : "You haven't purchased any items yet"}
        </div>
      ) : (
        <>
          <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px', marginBottom: '20px', textAlign: 'center' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#666' }}>
              {isEmployee ? 'Total Revenue' : 'Total Spent'}
            </h3>
            <p style={{ margin: 0, fontSize: '32px', color: '#28a745', fontWeight: 'bold' }}>${calculateTotal()}</p>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#28a745', color: '#fff' }}>
                <th style={{ padding: '12px', textAlign: 'left' }}>Sale ID</th>
                {isEmployee && <th style={{ padding: '12px', textAlign: 'left' }}>Customer</th>}
                <th style={{ padding: '12px', textAlign: 'left' }}>Item</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Price</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Payment</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Purchase Date</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((sale) => (
                <tr key={sale.commoditySaleId} style={{ borderBottom: '1px solid #ddd' }}>
                  <td style={{ padding: '12px' }}>{sale.commoditySaleId}</td>
                  {isEmployee && <td style={{ padding: '12px' }}>{sale.customerName}</td>}
                  <td style={{ padding: '12px' }}>{sale.commodityName}</td>
                  <td style={{ padding: '12px' }}>${sale.price}</td>
                  <td style={{ padding: '12px' }}>{sale.paymentMethod}</td>
                  <td style={{ padding: '12px' }}>{new Date(sale.purchaseDate).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};

export default CommoditySales;