import { useState, useEffect } from 'react';
import { ReviewsAPI } from '../api';

function makeReview({onSwitchToReviews}) {
    const [reviewData, setReviewData] = useState({
        ride: "",
        score: "",
        feedback: "",
        
    })
    const [rides, setRides] = useState([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchRides();
    }, []);

    const fetchRides = async () => {
        try {
            const response = await fetch('http://localhost:5239/api/rides')
            const data = await response.json();
            setRides(data);
        } catch (err) {
            setError('Failed to load rides');
        }
    };

    const handleChange = (e) => {
        setReviewData({...reviewData, [e.target.name]: e.target.value});
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("")
        setLoading(true)

        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

        if (!currentUser.customerId) {
            setError('Please login first');
            return;
        }

        try {
            const data = {
                Ride_ID: parseInt(reviewData.ride),
                Customer_ID: parseInt(currentUser.customerId),
                Rating: parseInt(reviewData.score),
                Feedback: reviewData.feedback,
                Date: new Date().toISOString()
            }
            await ReviewsAPI.createReview(data);
        } catch (error) {
            console.error("Submission error:", error);
            if (error.response) {
                console.error("Backend said:", error.response.data);
            }
            setError("Review submission failed");
        } finally {
            setLoading(false);
        }
    };

    const containerStyle = {
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        maxWidth: '1200px',
        margin: '40px auto', 
        padding: '30px', 
        backgroundColor: '#fff', 
        borderRadius: '10px', 
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    };

    const inputGroupStyle = {
        marginBottom: "15px",
    };

    const labelStyle = {
        display: "block",
        marginBottom: "5px",
        fontWeight: "bold",
    };

    const inputStyle = {
        width: "100%",
        padding: "10px",
        fontSize: "16px",
        border: "1px solid #ddd",
        borderRadius: "4px",
        boxSizing: "border-box",
    };

    const buttonStyle = {
        width: "100%",
        padding: "12px",
        backgroundColor: "#28a745",
        color: "white",
        border: "none",
        borderRadius: "4px",
        fontSize: "16px",
        cursor: "pointer",
    };

    return (
        <div style = {containerStyle}>
            <div style = {{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                margin: "20px 0px 50px 0px"
            }}>
                <h2 style = {{textAlign: 'Center'}}>Make a Review</h2>
                <button
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
                    onClick={onSwitchToReviews}
                >
                    Back
                </button>
            </div>

            <div>
                <form onSubmit={handleSubmit}>
                    <div style={inputGroupStyle}>
                        <label style={labelStyle}>Ride:</label>
                        <select name="ride" value={reviewData.ride} onChange={handleChange} style={{ width: '100%', padding: '12px', fontSize: '16px', border: '2px solid #ddd', borderRadius: '6px' }} required>
                            <option value="">-- Choose a ride --</option>
                            {rides.map((ride) => (
                                <option key = {ride.ride_ID} value={ride.ride_ID}>
                                    {ride.ride_Name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div style={inputGroupStyle}>
                        <label style={labelStyle}>Rating:</label>
                        <div>
                            {[...Array(5)].map((_,star)=>{
                                return(
                                    <span key={star + 1} style = {{margin: '10px'}}>
                                        <input
                                            type="radio"
                                            name="score"
                                            value={star+1}
                                            onChange={handleChange}
                                        />
                                        <>{star + 1}</>
                                    </span>
                                )
                            })}
                        </div>
                    </div>

                    <div style={inputGroupStyle}>
                        <label style={labelStyle}>Feedback:</label>
                        <input
                            type="text"
                            name="feedback"
                            value={reviewData.feedback}
                            onChange={handleChange}
                            style={inputStyle}
                        />
                    </div>

                    {error && (
                        <div
                        style={{
                            color: "red",
                            marginBottom: "10px",
                            textAlign: "center",
                        }}
                        >
                        {error}
                        </div>
                    )}

                    <button type="submit" disabled={loading} style={buttonStyle}>
                        {loading ? "Submitting..." : "Submit"}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default makeReview;