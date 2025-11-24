import { useState, useEffect } from "react";
import "./ThemePark.css";
import "./UnifiedSalesReport.css";
import { ReviewsAPI } from "../api";

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rides, setRides] = useState([])

  const [message, setMessage] = useState("")
  const [selectedReview, setSelectedReview] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const isEmployee =
    currentUser.userType === "Employee" || currentUser.userType === "Manager";

  useEffect(() => {
      fetchMyReviews();
      fetchRides();
  }, []);

  // For Customers - Show their reviews
  const fetchMyReviews = async () => {
    if (!currentUser.customerId) {
      setError("Please login to view your tickets");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/reviews/customer/${
          currentUser.customerId
        }`
      );
      if (!response.ok) throw new Error("Failed to fetch reviews");
      const data = await response.json();
      setReviews(data);
      console.log(data)
    } catch (err) {
      setError("Failed to load reviews");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRides = async () => {
    if(!currentUser.customerId) {
      setError("Please login first");
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
    }
  };
  
  const [showMakeReviewModal, setShowMakeReviewModal] = useState(false);
  const [makeReviewFormData, setMakeReviewFormData] = useState({
    ride: "",
    score: "",
    feedback: "",
  })

  const handleChange = (e) => {
    setMakeReviewFormData({ ...makeReviewFormData, [e.target.name]: e.target.value });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    if (!currentUser.customerId) {
      setError("Please login first");
      return;
    }
    
    try {
      const data = {
        Ride_ID: parseInt(makeReviewFormData.ride),
        Customer_ID: parseInt(currentUser.customerId),
        Rating: parseInt(makeReviewFormData.score),
        Feedback: makeReviewFormData.feedback,
        Date: new Date().toISOString(),
      };
      await ReviewsAPI.createReview(data);
      setMessage("Review created successfully!")
      setShowMakeReviewModal(false)
      fetchMyReviews()
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
  
  const [showEditModal, setShowEditModal] = useState(false)
  const [reviewEditFormData, setReviewEditFormData] = useState({
    score: "",
    feedback: ""
  })
  
  const handleEditReview = (review) => {
    setSelectedReview(review);
    setReviewEditFormData({
      score: review.score || "",
      feedback: review.feedback || ""
    });
    setShowEditModal(true);
  }

  const handleSaveReview = async () => {
    setMessage("")
    setError("")
    if(!selectedReview) {return;}

    try{
      const updateReviewData = {
        Review_ID: selectedReview.reviewID,
        Ride_ID: selectedReview.rideID,
        Customer_ID: parseInt(currentUser.customerId),
        Score: parseInt(reviewEditFormData.score) || selectedReview.score,
        Feedback: reviewEditFormData.feedback || selectedReview.feedback || "",
        Date: new Date().toISOString()
      };

      await ReviewsAPI.updateReviewData(selectedReview.reviewID, updateReviewData);
      setShowEditModal(false);
      setSelectedReview(false);
      await fetchMyReviews();
      setMessage("Edited review successfully!")
    } catch (err) {
      console.error(error);
      setError("Review edit failed");
    }
  }

  const handleConfirmDeleteReview = (review) => {
    setSelectedReview(review);
    setShowDeleteConfirm(true);
  };

  const handleDeleteReview = async () => {
    setMessage("")
    setError("")
    if(!selectedReview){
      return;
    }

    try {
      await ReviewsAPI.deleteReview(selectedReview.reviewID);
      setShowDeleteConfirm(false)
      setMessage("Review deleted successfully!")
    } catch (err) {
      console.error(err);
      setError("Unable to delete this review. Please try again.");
      return;
    } finally {
      await fetchMyReviews()
    }
  }

  const [hover, setHover] = useState(0)
  const [rating, setRating] = useState(0)

  const styles = {
    modal: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(75, 85, 99, 0.5)",
      overflowY: "auto",
      height: "100%",
      width: "100%",
      zIndex: 50,
      marginLeft: "140px"
    },
    modalContent: {
      position: "relative",
      top: "80px",
      margin: "0 auto",
      padding: "20px",
      border: "1px solid #e5e7eb",
      width: "450px",
      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
      borderRadius: "6px",
      backgroundColor: "white",
    },
    modalFooter: {
      display: "flex",
      justifyContent: "flex-end",
      gap: "12px",
      marginTop: "24px",
    }
  }

  return (
    <div className="theme-park-page" style={{ padding: "40px 10px" }}>
      <div
        className="theme-park-container"
        style={{ maxWidth: "1800px", width: "100%" }}
      >
        <div className="theme-park-header">
        
          <h1 className="theme-park-title">
            {"🎫 My Reviews"}
          </h1>

          {!isEmployee && (
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
                onClick={()=>setShowMakeReviewModal(true)}
              >
                Make a Review
              </button>
            </div>
          )}
        
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

      {message && (          
        <div className = "theme-park-alert theme-park-alert-success">
          <span style={{ fontSize: "24px" }}>🎉</span>
          <span>{message}</span>
        </div>
      )}

      {loading ? (
        <div className="theme-park-page">
          <div className="theme-park-loading">
            <div className="theme-park-spinner"></div>
            <div className="theme-park-loading-text">Loading ride data...</div>
          </div>
        </div>
      ) : (
        <>
          {reviews.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px", color: "#999" }}>
              {isEmployee ? "No reviews yet" : "You haven't made any reviews yet"}
            </div>
          ) : (
              <>
              {!isEmployee && (
                <div className="theme-park-card" style={{ padding: "30px 15px" }}>
                    <div
                      className="theme-park-table-container"
                      style={{ overflowX: "auto", width: "100%" }}
                    >
                      <table
                        className="theme-park-table"
                        style={{ tableLayout: "fixed", width: "100%" }}
                      >
                        <thead>
                          <tr>
                            <th style={{ width: "10%", minWidth: "100px" }}>Ride</th>
                            <th style={{ width: "10%", minWidth: "100px" }}>Rating</th>
                            <th style={{ width: "10%", minWidth: "100px" }}>
                              Feedback
                            </th>
                            <th style={{ width: "10%", minWidth: "100px" }}>
                              Review Date
                            </th>
                            <th style={{ width: "15%", minWidth: "150px" }}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reviews.map((review) => (
                            <tr
                              key={review.reviewID}
                              style={{transition: "background-color 0.2s"}}
                            >
                              <td style={{ textAlign: "center", padding: "40px"}}>{review.rideName}</td>
                              <td style={{ textAlign: "center", padding: "40px"}}>
                                {Array.from({ length: 5 }).map((_, star) => (
                                  <span
                                    key={star}
                                    style={{
                                      color: star < review.score ? "#facc15" : "#d1d5db",
                                      fontSize: "20px"
                                    }}
                                  >
                                    &#9733;
                                  </span>
                                ))}
                              </td>
                              <td style={{ textAlign: "center", padding: "40px"}}>{review.feedback}</td>
                              <td style={{ textAlign: "center", padding: "40px"}}>
                                {new Date(review.reviewDate).toLocaleDateString()}
                              </td>
                              <td style={{ display: "flex", gap: "8px"}}>
                                <button
                                  onClick={()=>handleEditReview(review)}
                                  className="theme-park-btn theme-park-btn-outline theme-park-btn-sm"
                                >
                                  Edit
                                </button>
                                <button
                                  className="theme-park-btn theme-park-btn-danger theme-park-btn-sm"
                                  onClick={()=>handleConfirmDeleteReview(review)}
                                >
                                  Delete Review
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                </div>
              )
            }
            </>
          )}

          {/*Make Review Modal*/}
          {showMakeReviewModal && (
            <div style={styles.modal}>
              <div style={styles.modalContent}>
                <h3 className="theme-park-card-title theme-park-modal-header">Make a Review</h3>

                <form onSubmit={handleSubmit} className="theme-park-form">
                  <div className="theme-park-form-group" style={{marginTop:"10px"}}>
                    <label className="theme-park-label">Ride:</label>
                    <select
                      name="ride"
                      value={makeReviewFormData.ride}
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
                      value={makeReviewFormData.feedback}
                      onChange={handleChange}
                      className="theme-park-input"
                    />
                  </div>
                  
                  <div style = {styles.modalFooter}>
                    <button
                      onClick={()=>setShowMakeReviewModal(false)}
                      className="theme-park-btn theme-park-btn-sm"
                      type="button"
                    >
                      Cancel
                    </button>
                    
                    <button className="theme-park-btn theme-park-btn-sm theme-park-btn-primary" type="submit">
                      {loading ? "Submitting..." : "Submit"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/*Edit Modal*/}
          {showEditModal && (
            <div style={styles.modal}>
              <div style={styles.modalContent}>
                <h3 className="theme-park-card-title theme-park-modal-header">Edit Review</h3>

                <div className="theme-park-form-group" style={{marginTop:"10px"}}>
                  <label className="theme-park-label">Ride Name</label>
                  <p style={{marginTop:"5px"}}>{selectedReview.rideName}</p>
                </div>

                <div className="theme-park-form-group" style={{marginTop:"20px"}}>
                  <label className="theme-park-label">Rating</label>
                  <div style={{ display: "flex", gap: "8px", cursor: "pointer"}}>
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
                            setReviewEditFormData({
                              ...reviewEditFormData,
                              score: star + 1
                            })
                          }}
                          >
                          &#9733;
                        </span>
                      );
                    })}
                  </div>
                </div>

                <div className="theme-park-form-group" style={{marginTop:"10px"}}>
                  <label className="theme-park-label">Feedback</label>
                  <input
                    type="text"
                    value={reviewEditFormData.feedback}
                    onChange={(e) =>
                      setReviewEditFormData({
                        ...reviewEditFormData,
                        feedback: e.target.value,
                      })
                    }
                    className="theme-park-input"
                  />
                </div>

                <div style={styles.modalFooter}>
                  <button
                    onClick={()=>setShowEditModal(false)}
                    className="theme-park-btn theme-park-btn-sm"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleSaveReview}
                    className="theme-park-btn theme-park-btn-sm theme-park-btn-primary"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}


          {/*Delete Confirmation*/}
          {showDeleteConfirm && (
            <div
              style={styles.modal}
            >
              <div
                style={{
                  ...styles.modalContent,
                  top: "35%",
                  width: "550px",
                  height: "150px",
                }}
              >
                <h3 className="theme-park-card-title">
                  Are you sure you want to delete this review?
                </h3>

                <div
                  style={styles.modalFooter}
                >
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className='theme-park-btn theme-park-btn-sm theme-park-btn-outline'
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleDeleteReview}
                    className='theme-park-btn theme-park-btn-sm theme-park-btn-danger'
                  >
                    Confirm
                  </button>
                </div>

              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Reviews;
