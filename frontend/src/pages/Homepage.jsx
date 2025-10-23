import React from "react";

const Homepage = ({ onViewAccount }) => {
  const containerStyle = {
    minHeight: "100vh",
    backgroundColor: "#f5f5f5",
    margin: 0,
    padding: 0,
  };

  const navbarStyle = {
    backgroundColor: "white",
    padding: "15px 0",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingLeft: "40px",
    paddingRight: "40px",
    position: "relative",
  };

  const logoStyle = {
    fontSize: "24px",
    fontWeight: "bold",
    color: "#007bff",
    margin: 0,
  };

  const navItemsStyle = {
    display: "flex",
    gap: "30px",
    position: "absolute",
    left: "50%",
    transform: "translateX(-50%)",
  };

  const navItemStyle = {
    color: "#333",
    textDecoration: "none",
    fontSize: "16px",
    cursor: "pointer",
  };

  const accountButtonStyle = {
    padding: "10px 20px",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "16px",
  };

  const heroStyle = {
    backgroundColor: "white",
    padding: "80px 40px",
    textAlign: "center",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
  };

  const heroTitleStyle = {
    fontSize: "48px",
    fontWeight: "bold",
    color: "#333",
    margin: "0 0 20px 0",
  };

  const heroSubtitleStyle = {
    fontSize: "20px",
    color: "#666",
    margin: 0,
  };

  const sectionStyle = {
    padding: "60px 40px",
    backgroundColor: "white",
    marginTop: "20px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
    height: "700px",
  };

  const sectionTitleStyle = {
    fontSize: "32px",
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: "20px",
  };

  return (
    <div style={containerStyle}>
      {/* Navbar */}
      <nav style={navbarStyle}>
        <h1 style={logoStyle}>Theme Park Manager</h1>
        <div style={navItemsStyle}>
          <a style={navItemStyle}>Home</a>
          <a style={navItemStyle}>About</a>
          <a style={navItemStyle}>Services</a>
          <a style={navItemStyle}>Contact</a>
        </div>
        <button style={accountButtonStyle} onClick={onViewAccount}>
          My Account
        </button>
      </nav>

      {/* Hero Section */}
      <section style={heroStyle}>
        <h1 style={heroTitleStyle}>Welcome to our Theme Park!</h1>
        <p style={heroSubtitleStyle}>
          Your ultimate destination for theme park management and fun!
        </p>
      </section>

      {/* Content Sections */}
      <section style={sectionStyle}>
        <h2 style={sectionTitleStyle}>Section 1</h2>
        {/* Content will be added here later */}
      </section>

      <section style={sectionStyle}>
        <h2 style={sectionTitleStyle}>Section 2</h2>
        {/* Content will be added here later */}
      </section>

      <section style={sectionStyle}>
        <h2 style={sectionTitleStyle}>Section 3</h2>
        {/* Content will be added here later */}
      </section>
    </div>
  );
};

export default Homepage;
