import React, { useState, useEffect } from "react";
import "./LandingPage.css";

function LandingPage({ onGetStarted, onLogin }) {
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
      {/* Sticky Navigation */}
      <header className="sticky-header">
        <div className="header-content">
          <h1 className="brand-logo">ThrillWorld</h1>
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
          <div className="video-placeholder">
            <img
              src="/ThemeParkPoster.jpg"
              alt="Theme Park"
              className="hero-bg-image"
            />
          </div>
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
          <h2 className="section-title">TICKETS & SEASON PASSES</h2>
          <p className="section-subtitle">
            Choose your adventure - from single day tickets to unlimited annual
            passes
          </p>
        </div>

        <div className="tickets-grid">
          {/* Daily Admission */}
          <div className="ticket-card featured">
            <div className="ticket-badge">BEST VALUE</div>
            <div className="ticket-header">
              <h3>Daily Admission</h3>
              <div className="price-section">
                <span className="original-price">$79.99</span>
                <span className="current-price">$49.99</span>
                <span className="price-label">per person</span>
              </div>
            </div>
            <ul className="ticket-features">
              <li>✓ Access to all rides & attractions</li>
              <li>✓ Live shows & entertainment</li>
              <li>✓ Water park included</li>
              <li>✓ Free parking</li>
            </ul>
            <button className="ticket-btn" onClick={onGetStarted}>
              Buy Now
            </button>
          </div>

          {/* Season Pass */}
          <div className="ticket-card premium">
            <div className="ticket-badge popular">MOST POPULAR</div>
            <div className="ticket-header">
              <h3>Gold Season Pass</h3>
              <div className="price-section">
                <span className="current-price">$99.99</span>
                <span className="price-label">Pay monthly: $8.33/mo</span>
              </div>
            </div>
            <ul className="ticket-features">
              <li>✓ Unlimited visits all year</li>
              <li>✓ Free parking every visit</li>
              <li>✓ 10% discount on food & merchandise</li>
              <li>✓ Exclusive member events</li>
              <li>✓ Skip the line on select rides</li>
            </ul>
            <button className="ticket-btn premium-btn" onClick={onGetStarted}>
              Get Season Pass
            </button>
          </div>

          {/* VIP Experience */}
          <div className="ticket-card vip">
            <div className="ticket-badge vip-badge">VIP</div>
            <div className="ticket-header">
              <h3>Platinum VIP Pass</h3>
              <div className="price-section">
                <span className="current-price">$299.99</span>
                <span className="price-label">Ultimate experience</span>
              </div>
            </div>
            <ul className="ticket-features">
              <li>✓ Everything in Gold Pass</li>
              <li>✓ Front-of-line access on ALL rides</li>
              <li>✓ VIP lounge access</li>
              <li>✓ Free meals & snacks</li>
              <li>✓ Private parking</li>
              <li>✓ Exclusive merchandise</li>
            </ul>
            <button className="ticket-btn vip-btn" onClick={onGetStarted}>
              Go VIP
            </button>
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
