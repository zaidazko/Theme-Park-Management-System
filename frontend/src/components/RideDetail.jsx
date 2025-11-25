import React, { useState, useEffect } from "react";
import "./ThemePark.css";

function RideDetail({ rideName, onBack }) {
  const [ride, setRide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchRideByName();
  }, [rideName]);

  const fetchRideByName = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/rides`);
      if (!response.ok) throw new Error("Failed to fetch rides");

      const rides = await response.json();
      const foundRide = rides.find(
        (r) => r.ride_Name.toLowerCase() === rideName.toLowerCase()
      );

      if (foundRide) {
        setRide(foundRide);
      } else {
        setError("Ride not found");
        setTimeout(() => setError(""), 3000);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getRideStatusBadge = (status) => {
    const statusColors = {
      Open: "#10b981",
      Closed: "#ef4444",
      "Under Maintenance": "#f59e0b",
    };

    return (
      <span
        style={{
          background: statusColors[status] || "#6b7280",
          color: "white",
          padding: "6px 16px",
          borderRadius: "20px",
          fontSize: "14px",
          fontWeight: "600",
          display: "inline-block",
          marginTop: "10px",
        }}
      >
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="theme-park-container">
        <div style={{ textAlign: "center", padding: "40px" }}>
          <p>Loading ride details...</p>
        </div>
      </div>
    );
  }

  if (error || !ride) {
    return (
      <div className="theme-park-container">
        <div style={{ textAlign: "center", padding: "40px" }}>
          <h2>Oops! {error || "Ride not found"}</h2>
          <button onClick={onBack} className="theme-park-button">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="theme-park-container">
      <div style={{ marginBottom: "30px" }}>
        <button
          onClick={onBack}
          style={{
            padding: "10px 20px",
            backgroundColor: "#3b82f6",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "16px",
            fontWeight: "600",
          }}
        >
          ← Back to Home
        </button>
      </div>

      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          backgroundColor: "white",
          borderRadius: "12px",
          overflow: "hidden",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        }}
      >
        <div
          style={{
            height: "500px",
            overflow: "hidden",
            position: "relative",
          }}
        >
          <img
            src={ride.image}
            alt={ride.ride_Name}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        </div>

        <div style={{ padding: "40px" }}>
          <h1
            style={{
              fontSize: "42px",
              fontWeight: "900",
              color: "#1e40af",
              marginBottom: "10px",
            }}
          >
            {ride.ride_Name}
          </h1>

          {getRideStatusBadge(ride.status)}

          <div
            style={{
              marginTop: "30px",
              fontSize: "18px",
              lineHeight: "1.8",
              color: "#374151",
            }}
          >
            <p>{ride.description || "An amazing ride experience awaits you!"}</p>
          </div>

          <div
            style={{
              marginTop: "40px",
              padding: "30px",
              backgroundColor: "#f3f4f6",
              borderRadius: "8px",
            }}
          >
            <h3
              style={{
                fontSize: "24px",
                fontWeight: "700",
                marginBottom: "20px",
                color: "#1f2937",
              }}
            >
              Ride Information
            </h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                gap: "20px",
              }}
            >
              <div>
                <p
                  style={{
                    fontSize: "14px",
                    color: "#6b7280",
                    marginBottom: "5px",
                  }}
                >
                  Capacity
                </p>
                <p
                  style={{
                    fontSize: "24px",
                    fontWeight: "700",
                    color: "#1f2937",
                  }}
                >
                  {ride.capacity} riders
                </p>
              </div>
              <div>
                <p
                  style={{
                    fontSize: "14px",
                    color: "#6b7280",
                    marginBottom: "5px",
                  }}
                >
                  Current Status
                </p>
                <p
                  style={{
                    fontSize: "24px",
                    fontWeight: "700",
                    color: "#1f2937",
                  }}
                >
                  {ride.status}
                </p>
              </div>
            </div>
          </div>

          <div style={{ marginTop: "30px", textAlign: "center" }}>
            <button
              onClick={onBack}
              style={{
                padding: "15px 40px",
                backgroundColor: "#3b82f6",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "18px",
                fontWeight: "600",
                transition: "background-color 0.2s",
              }}
              onMouseOver={(e) =>
                (e.target.style.backgroundColor = "#2563eb")
              }
              onMouseOut={(e) => (e.target.style.backgroundColor = "#3b82f6")}
            >
              Explore More Rides
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RideDetail;
