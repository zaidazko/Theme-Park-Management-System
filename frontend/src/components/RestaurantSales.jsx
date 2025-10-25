import { useState, useEffect } from 'react';

const RestaurantSales = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const isEmployee = currentUser.userType === 'Employee' || currentUser.userType === 'Manager';

  useEffect(() => {
    if (isEmployee) {
      fetchAllOrders();
    } else {
      fetchMyOrders();
    }
  }, []);

  const fetchAllOrders = async () => {
    try {
      const response = await fetch('http://localhost:5239/api/restaurant/orders');
      if (!response.ok) throw new Error('Failed to fetch orders');
      const data = await response.json();
      setOrders(data);
    } catch (err) {
      setError('Failed to load restaurant orders');
    } finally {
      setLoading(false);
    }
  };

  const fetchMyOrders = async () => {
    if (!currentUser.customerId) {
      setError('Please login to view your orders');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`http://localhost:5239/api/restaurant/customer/${currentUser.customerId}/orders`);
      if (!response.ok) throw new Error('Failed to fetch orders');
      const data = await response.json();
      setOrders(data);
    } catch (err) {
      setError('Failed to load your orders');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    return orders.reduce((total, order) => total + order.totalPrice, 0).toFixed(2);
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '40px auto', padding: '30px', backgroundColor: '#fff', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>
        {isEmployee ? '📊 All Restaurant Orders' : '🍽️ My Orders'}
      </h2>

      {error && <div style={{ padding: '12px', backgroundColor: '#f8d7da', color: '#721c24', borderRadius: '6px', marginBottom: '20px', textAlign: 'center' }}>{error}</div>}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>
      ) : orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
          {isEmployee ? 'No restaurant orders yet' : "You haven't placed any orders yet"}
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
              <tr style={{ backgroundColor: '#ff6b6b', color: '#fff' }}>
                <th style={{ padding: '12px', textAlign: 'left' }}>Order ID</th>
                {isEmployee && <th style={{ padding: '12px', textAlign: 'left' }}>Customer</th>}
                <th style={{ padding: '12px', textAlign: 'left' }}>Restaurant</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Total</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Payment</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.orderId} style={{ borderBottom: '1px solid #ddd' }}>
                  <td style={{ padding: '12px' }}>{order.orderId}</td>
                  {isEmployee && <td style={{ padding: '12px' }}>{order.customerName}</td>}
                  <td style={{ padding: '12px' }}>{order.restaurantName}</td>
                  <td style={{ padding: '12px' }}>${order.totalPrice.toFixed(2)}</td>
                  <td style={{ padding: '12px' }}>{order.paymentMethod}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{ padding: '4px 8px', backgroundColor: order.orderStatus === 'Completed' ? '#d4edda' : '#fff3cd', color: order.orderStatus === 'Completed' ? '#155724' : '#856404', borderRadius: '4px', fontSize: '12px' }}>
                      {order.orderStatus}
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>{new Date(order.orderDate).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};

export default RestaurantSales;