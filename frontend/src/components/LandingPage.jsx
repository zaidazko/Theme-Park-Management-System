import React, { useState, useEffect } from "react";
import "./LandingPage.css";

function LandingPage({ onGetStarted, onLogin, onShopClick }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const featuredAttractions = [
    {
      name: "Steel Dragon",
      description:
        "Experience 120 mph of pure adrenaline on our newest hypercoaster!",
      tag: "NEW 2025",
      image: "/hypercoaster.jpg",
    },
    {
      name: "Twisted Cyclone",
      description: "Death-defying loops and zero-gravity rolls!",
      tag: "EXTREME",
      image: "/TwistedCyclone.jpg",
    },
    {
      name: "Splash Mountain",
      description: "Beat the heat with our epic water ride adventure!",
      tag: "FAMILY FUN",
      image: "/WaterRide.jpg",
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % featuredAttractions.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const scrollToTickets = () => {
    const ticketsSection = document.querySelector(".tickets-section");
    if (ticketsSection) {
      ticketsSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="landing-page-new">
      {/* Sticky Navigation - Disney Style */}
      <header className="sticky-header">
        <div className="header-content">
          <h1 className="brand-logo">ThrillWorld</h1>

          {/* Main Navigation */}
          <nav className="main-nav">
            <div className="nav-item" onClick={scrollToTickets}>
              <span>Tickets & Passes</span>
            </div>

            <div className="nav-item dropdown-trigger">
              <span>Things to Do</span>
              <div className="dropdown-menu">
                <a href="#attractions">Attractions</a>
                <a href="#dining">Dining</a>
                <a href="#entertainment">Entertainment</a>
                <a href="#events">Special Events</a>
              </div>
            </div>

            <div className="nav-item dropdown-trigger">
              <span>Shop</span>
              <div className="dropdown-menu">
                <a href="#" onClick={(e) => { e.preventDefault(); onShopClick && onShopClick(); }}>All Merchandise</a>
                <a href="#" onClick={(e) => { e.preventDefault(); onShopClick && onShopClick(); }}>Gift Cards</a>
              </div>
            </div>

            <div className="nav-item" onClick={onLogin}>
              <span>Plan Your Visit</span>
            </div>
          </nav>

          <div className="header-actions">
            <button className="signin-btn" onClick={onLogin}>
              Sign In
            </button>
            <button className="buy-tickets-btn" onClick={scrollToTickets}>
              BUY TICKETS
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section with Video Background */}
      <section className="hero-video-section">
        <div className="video-background">
          <div className="video-overlay"></div>
          <video
            autoPlay
            loop
            muted
            playsInline
            className="hero-bg-video"
          >
            <source src="/ride-preview.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
        <div className="hero-content-overlay">
          <h1 className="hero-main-title">
            UNLEASH THE
            <br />
            <span className="highlight-text">THRILL</span>
          </h1>
          <p className="hero-tagline">
            America's Premier Amusement Park • 50+ World-Class Rides
          </p>
          <div className="hero-cta-buttons">
            <button className="cta-primary" onClick={onGetStarted}>
              BUY TICKETS NOW
            </button>
            <button className="cta-secondary" onClick={scrollToTickets}>
              SEASON PASSES
            </button>
          </div>
        </div>
      </section>

      {/* Ticket Deals Section */}
      <section className="tickets-section">
        <div className="section-header">
          <h2 className="section-title">TICKETS TO THRILLS</h2>
          <p className="section-subtitle">
            Choose your adventure - from single day tickets to unlimited annual
            passes
          </p>
        </div>

        <div className="ticket-invitation-container">
          <div className="ticket-invitation-card">
            <div className="invitation-image-wrapper">
              <img src="/hypercoaster.jpg" alt="Experience thrilling rides" className="invitation-image" />
              <div className="invitation-overlay">
                <h3 className="invitation-title">Experience the Thrill</h3>
                <p className="invitation-subtitle">Discover World-Class Rides & Unforgettable Memories</p>
              </div>
            </div>
            <div className="invitation-content">
              <p className="invitation-text">
                From heart-pounding roller coasters to family-friendly attractions, ThrillWorld offers something for everyone. 
                Get your tickets today and start your adventure!
              </p>
              <button className="invitation-cta" onClick={onGetStarted}>
                Buy Tickets Now
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Attractions Carousel */}
      <section className="attractions-carousel-section">
        <div className="section-header">
          <h2 className="section-title">FEATURED ATTRACTIONS</h2>
          <p className="section-subtitle">
            Experience the most thrilling rides on the planet
          </p>
        </div>

        <div className="carousel-container">
          <div
            className="carousel-slide"
            style={{
              backgroundImage: `url(${featuredAttractions[currentSlide].image})`,
            }}
          >
            <div className="slide-overlay">
              <span className="slide-tag">
                {featuredAttractions[currentSlide].tag}
              </span>
              <h3 className="slide-title">
                {featuredAttractions[currentSlide].name}
              </h3>
              <p className="slide-description">
                {featuredAttractions[currentSlide].description}
              </p>
              <button className="slide-btn">Learn More →</button>
            </div>
          </div>
          <div className="carousel-dots">
            {featuredAttractions.map((_, index) => (
              <button
                key={index}
                className={`dot ${index === currentSlide ? "active" : ""}`}
                onClick={() => setCurrentSlide(index)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Special Events Section */}
      <section className="events-section">
        <div className="section-header">
          <h2 className="section-title">SPECIAL EVENTS</h2>
          <p className="section-subtitle">
            Don't miss out on these limited-time experiences
          </p>
        </div>

        <div className="events-grid">
          <div className="event-card halloween">
            <div className="event-image">
              <img src="/ThemeParkPoster.jpg" alt="Halloween Event" />
              <div className="event-date-badge">OCT 1 - 31</div>
            </div>
            <div className="event-content">
              <h3>Fright Fest</h3>
              <p>
                Experience terror around every corner with haunted mazes, scare
                zones, and spine-chilling shows!
              </p>
            </div>
          </div>

          <div className="event-card holiday">
            <div className="event-image">
              <img src="/hypercoaster.jpg" alt="Holiday Event" />
              <div className="event-date-badge">NOV 15 - JAN 5</div>
            </div>
            <div className="event-content">
              <h3>Holiday in the Park</h3>
              <p>
                Millions of twinkling lights, festive shows, and magical holiday
                experiences for the whole family!
              </p>
            </div>
          </div>

          <div className="event-card summer">
            <div className="event-image">
              <img src="/WaterRide.jpg" alt="Summer Event" />
              <div className="event-date-badge">JUN 1 - AUG 31</div>
            </div>
            <div className="event-content">
              <h3>Summer Nights</h3>
              <p>
                Extended hours, fireworks spectacular, and exclusive nighttime
                entertainment every weekend!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Park Features Grid */}
      <section className="features-showcase">
        <div className="features-grid-new">
          <div className="feature-box dining">
            <div className="feature-icon-large">🍔</div>
            <h3>World-Class Dining</h3>
            <p>
              From quick bites to gourmet meals, we've got every craving covered
            </p>
          </div>

          <div className="feature-box shopping">
            <div className="feature-icon-large">🛍️</div>
            <h3>Exclusive Merchandise</h3>
            <p>Take home memories with our unique souvenirs and apparel</p>
          </div>

          <div className="feature-box entertainment">
            <div className="feature-icon-large">🎪</div>
            <h3>Live Entertainment</h3>
            <p>Daily shows, street performers, and character meet & greets</p>
          </div>

          <div className="feature-box accessibility">
            <div className="feature-icon-large">♿</div>
            <h3>Accessibility Services</h3>
            <p>We're committed to making thrills accessible for everyone</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="modern-footer">
        <div className="footer-content">
          <p>&copy; 2025 ThrillWorld. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
