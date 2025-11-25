import { useState, useEffect } from "react";
import { ReviewsAPI } from "../api";
import "./ThemePark.css";

function makeReview({ onSwitchToReviews }) {
  const [reviewData, setReviewData] = useState({
    ride: "",
    score: "",
    feedback: "",
  });
  const [rides, setRides] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("")
  const [hover, setHover] = useState(0)
  const [rating, setRating] = useState(0)

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    fetchRides();
  }, []);

  const fetchRides = async () => {
    if(!currentUser.customerId) {
      setError("Please login first");
      setTimeout(() => setError(""), 3000);
      return;
    }

    try {
      const [rideResponse, reviewResponse] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/rides`),
        fetch(`${import.meta.env.VITE_API_URL}/reviews/customer/${currentUser.customerId}`)
      ]);

      if (!rideResponse.ok) throw new Error("Failed to fetch rides");
      if (!reviewResponse.ok) throw new Error("Failed to fetch reviews")

      const [rideData, reviewData] = await Promise.all([
        rideResponse.json(),
        reviewResponse.json()
      ]);

      const reviewedRides = reviewData.map(r => r.rideName);
      const filteredRides = rideData.filter(r => !reviewedRides.includes(r.ride_Name));

      setRides(filteredRides);
    } catch (err) {
      setError("Failed to load rides");
      setTimeout(() => setError(""), 3000);
    }
  };

  const handleChange = (e) => {
    setReviewData({ ...reviewData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!currentUser.customerId) {
      setError("Please login first");
      setTimeout(() => setError(""), 3000);
      return;
    }

    try {
      const data = {
        Ride_ID: parseInt(reviewData.ride),
        Customer_ID: parseInt(currentUser.customerId),
        Rating: parseInt(reviewData.score),
        Feedback: reviewData.feedback,
        Date: new Date().toISOString(),
      };
      await ReviewsAPI.createReview(data);
      setSuccessMessage("Review created successfully!")
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Submission error:", error);
      if (error.response) {
        console.error("Backend said:", error.response.data);
      }
      setError("Review submission failed");
      setTimeout(() => setError(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="theme-park-page" style={{ padding: "40px 10px" }}> 
      <div
        className="theme-park-container"
        style={{ maxWidth: "1800px", width: "100%" }}
      >
        <div className="theme-park-header">
          <h1 className="theme-park-title">Make a Review</h1>
          <p className="theme-park-subtitle">Note: You can only review a ride once. To change your review, please delete or edit your review.</p>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              marginTop: "8px",
            }}
          >
            <button
              className="theme-park-btn theme-park-btn-primary theme-park-btn-lg"
              style={{
                        position: "absolute",
                        right: 0,
                        marginBottom: "10px"
                      }}
              onClick={onSwitchToReviews}
            >
              Back
            </button>
          </div>
        </div>
        
        {error && (
          <div
            style={{
              padding: "12px",
              backgroundColor: "#f8d7da",
              color: "#721c24",
              borderRadius: "6px",
              marginBottom: "20px",
              textAlign: "center",
            }}
          >
            {error}
          </div>
        )}

        {successMessage && (
          <div className = "theme-park-alert theme-park-alert-success">
          <span style={{ fontSize: "24px" }}>🎉</span>
          <span>{successMessage}</span>
        </div>
        )}

        {loading ? (
          <div className="theme-park-page">
            <div className="theme-park-loading">
              <div className="theme-park-spinner"></div>
              <div className="theme-park-loading-text">Loading...</div>
            </div>
          </div>
        ) : (

          <div className="theme-park-card" style={{ marginTop: "1.5rem", height: "450px"}}>
            
            <form onSubmit={handleSubmit} className="theme-park-form">
              <div className="theme-park-form-group" style={{marginTop:"10px"}}>
                <label className="theme-park-label">Ride:</label>
                <select
                  name="ride"
                  value={reviewData.ride}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    padding: "12px",
                    fontSize: "16px",
                    border: "2px solid #ddd",
                    borderRadius: "6px",
                  }}
                  className="theme-park-select"
                  required
                >
                  <option value="">-- Choose a ride --</option>
                  {rides.map((ride) => (
                    <option key={ride.ride_ID} value={ride.ride_ID}>
                      {ride.ride_Name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="theme-park-form-group" style={{marginTop:"10px"}}>
                <label className="theme-park-label">Rating:</label>
                <div style={{ display: "flex", gap: "8px", cursor: "pointer" }}>
                  {[...Array(5)].map((_, star) => {
                    return (
                      <span 
                        key={star + 1}
                        style={{
                          fontSize: "32px",
                          color: star + 1 <= (hover || rating) ? "#facc15" : "#d1d5db",
                          transition: "color 0.2s",
                        }}
                        onMouseEnter={() => setHover(star + 1)}
                        onMouseLeave={() => setHover(0)}
                        onClick={() => {
                          setRating(star + 1);
                          handleChange({target: {name: "score", value: star + 1}})
                        }}
                        >
                        &#9733;
                      </span>
                    );
                  })}
                </div>
              </div>

              <div className="theme-park-form-group" style={{marginTop:"10px"}}>
                <label className="theme-park-label">Feedback:</label>
                <input
                  type="text"
                  name="feedback"
                  value={reviewData.feedback}
                  onChange={handleChange}
                  className="theme-park-input"
                />
              </div>

              <button type="submit" disabled={loading} className="theme-park-btn theme-park-btn-primary" style={{marginTop: "20px"}}>
                {loading ? "Submitting..." : "Submit"}
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}

export default makeReview;
