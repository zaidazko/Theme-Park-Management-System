import { useState, useEffect } from 'react';
import './ThemePark.css';

function Reviews({ onSwitchToMakeReview }) {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const isEmployee = currentUser.userType === 'Employee' || currentUser.userType === 'Manager';

    useEffect(() => {
        if (isEmployee) {
            fetchAllReviews();
        } else {
            fetchMyReviews();
        }
    }, []);

    // For Employees/Managers - Show all reviews
    const fetchAllReviews = async () => {
        try{
            const response = await fetch('http://localhost:5239/api/reviews/ride');
            if (!response.ok) throw new Error('Failed to fetch reviews');
            const data = await response.json();
            setReviews(data);
        }
        catch (err) {
            setError('Failed to load reviews');
        }
        finally {
            setLoading(false);
        }
    };

    // For Customers - Show their reviews
    const fetchMyReviews = async () => {
        if (!currentUser.customerId) {
            setError('Please login to view your tickets');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`http://localhost:5239/api/reviews/customer/${currentUser.customerId}`);
            if (!response.ok) throw new Error ("Failed to fetch reviews");
            const data = await response.json();
            setReviews(data);
        } catch (err) {
            setError('Failed to load reviews');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const calculateAverage = () => {
        if (reviews.length === 0) return 0;
        return (reviews.reduce((total, r) => total + r.score, 0) / reviews.length).toFixed(2);
    };

    return (
        <div style={{ maxWidth: '1200px', margin: '40px auto', padding: '30px', backgroundColor: '#fff', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
            <div
            style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    margin: "20px 0px 50px 0px"
            }}>
                <h2 style={{ textAlign: 'left' }}>
                    {isEmployee ? '📊 All Reviews' : '🎫 My Reviews'}
                </h2>
                {!isEmployee && <button
                style = {{
                    backgroundColor: "#3b82f6",
                    color: "white",
                    border: "none",
                    padding: "10px 20px",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "16px",
                    fontWeight: "500",
                    float: 'right'
                }}
                onClick={onSwitchToMakeReview}>
                    Make a Review
                </button>}
            </div>
            {error && <div style={{ padding: '12px', backgroundColor: '#f8d7da', color: '#721c24', borderRadius: '6px', marginBottom: '20px', textAlign: 'center' }}>{error}</div>}

            {loading ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>
            ) : reviews.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                    {isEmployee ? 'No reviews yet' : "You haven't made any reviews yet"}
                </div>
            ) : (
                <>
                    {isEmployee && <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px', marginBottom: '20px', textAlign: 'center' }}>
                        <h3 style={{ margin: '0 0 10px 0', color: '#666' }}>
                        Average Score Overall
                        </h3>
                        <p style={{ margin: 0, fontSize: '32px', color: '#28a745', fontWeight: 'bold' }}>{calculateAverage()} / 5</p>
                    </div>}
                    {isEmployee && <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                        <tr style={{ backgroundColor: '#007bff', color: '#fff' }}>
                            <th style={{ padding: '12px', textAlign: 'left' }}>Review ID</th>
                            <th style={{ padding: '12px', textAlign: 'left' }}>Customer ID</th>
                            <th style={{ padding: '12px', textAlign: 'left' }}>Customer</th>
                            <th style={{ padding: '12px', textAlign: 'left' }}>Ride ID</th>
                            <th style={{ padding: '12px', textAlign: 'left' }}>Ride</th>
                            <th style={{ padding: '12px', textAlign: 'left' }}>Rating</th>
                            <th style={{ padding: '12px', textAlign: 'left' }}>Feedback</th>
                            <th style={{ padding: '12px', textAlign: 'left' }}>Review Date</th>
                        </tr>
                        </thead>
                        <tbody>
                        {reviews.map((review) => (
                            <tr key={review.reviewID} style={{ borderBottom: '1px solid #ddd' }}>
                            <td style={{ padding: '12px' }}>{review.reviewID}</td>
                            <td style={{ padding: '12px' }}>{review.customerID}</td>
                            <td style={{ padding: '12px' }}>{review.customerName}</td>
                            <td style={{ padding: '12px' }}>{review.rideID}</td>
                            <td style={{ padding: '12px' }}>{review.rideName}</td>
                            <td style={{ padding: '12px' }}>{review.score}</td>
                            <td style={{ padding: '12px' }}>{review.feedback}</td>
                            <td style={{ padding: '12px' }}>{new Date(review.reviewDate).toLocaleDateString()}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>}

                    {!isEmployee && <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                        <tr style={{ backgroundColor: '#007bff', color: '#fff' }}>
                            <th style={{ padding: '12px', textAlign: 'left' }}>Ride</th>
                            <th style={{ padding: '12px', textAlign: 'left' }}>Rating</th>
                            <th style={{ padding: '12px', textAlign: 'left' }}>Feedback</th>
                            <th style={{ padding: '12px', textAlign: 'left' }}>Review Date</th>
                        </tr>
                        </thead>
                        <tbody>
                        {reviews.map((review) => (
                            <tr key={review.reviewID} style={{ borderBottom: '1px solid #ddd' }}>
                            <td style={{ padding: '12px' }}>{review.rideName}</td>
                            <td style={{ padding: '12px' }}>{review.score}</td>
                            <td style={{ padding: '12px' }}>{review.feedback}</td>
                            <td style={{ padding: '12px' }}>{new Date(review.reviewDate).toLocaleDateString()}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>}
                </>
            )
            }
        </div>
    )
}

export default Reviews;