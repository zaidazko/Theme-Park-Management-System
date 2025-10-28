import React, { useState, useEffect } from "react";
import "./LandingPage.css";

function LandingPage({ onGetStarted, onLogin }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [emailSignup, setEmailSignup] = useState("");

  const featuredAttractions = [
    {
      name: "Steel Dragon",
      description: "Experience 120 mph of pure adrenaline on our newest hypercoaster!",
      tag: "NEW 2025",
      image: "https://images.unsplash.com/photo-1509549649946-f549463eb0b7?w=1200"
    },
    {
      name: "Twisted Cyclone",
      description: "Death-defying loops and zero-gravity rolls!",
      tag: "EXTREME",
      image: "https://images.unsplash.com/photo-1608889335941-32ac5f2041b9?w=1200"
    },
    {
      name: "Splash Mountain",
      description: "Beat the heat with our epic water ride adventure!",
      tag: "FAMILY FUN",
      image: "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=1200"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % featuredAttractions.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    alert(`Thanks for signing up with ${emailSignup}! You'll receive exclusive deals.`);
    setEmailSignup("");
  };

  return (
    <div className="landing-page-new">
      {/* Sticky Navigation */}
      <header className="sticky-header">
        <div className="header-content">
          <div className="logo-section">
            <h1 className="brand-logo">🎢 THRILLWORLD</h1>
          </div>
          <nav className="main-nav">
            <button className="nav-link-btn">Plan Your Visit</button>
            <button className="nav-link-btn">Tickets & Passes</button>
            <button className="nav-link-btn">Rides</button>
            <button className="nav-link-btn">Events</button>
          </nav>
          <div className="header-actions">
            <button className="signin-btn" onClick={onLogin}>Sign In</button>
            <button className="buy-tickets-btn" onClick={onGetStarted}>
              BUY TICKETS
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section with Video Background */}
      <section className="hero-video-section">
        <div className="video-background">
          <div className="video-overlay"></div>
          {/* Using a placeholder for video - you can replace with actual video */}
          <div className="video-placeholder">
            <img
              src="https://images.unsplash.com/photo-1594211261451-c3db53b8e2d7?w=1920&h=1080"
              alt="Theme Park"
              className="hero-bg-image"
            />
          </div>
        </div>
        <div className="hero-content-overlay">
          <div className="promo-badge">⭐ SPECIAL OFFER: 40% OFF SEASON PASSES!</div>
          <h1 className="hero-main-title">
            UNLEASH THE<br />
            <span className="highlight-text">THRILL</span>
          </h1>
          <p className="hero-tagline">
            America's Premier Amusement Park • 50+ World-Class Rides
          </p>
          <div className="hero-cta-buttons">
            <button className="cta-primary" onClick={onGetStarted}>
              <span className="btn-icon">🎟️</span>
              BUY TICKETS NOW
            </button>
            <button className="cta-secondary">
              <span className="btn-icon">🎫</span>
              SEASON PASSES
            </button>
          </div>
          <div className="hero-stats">
            <div className="stat-item">
              <span className="stat-number">50+</span>
              <span className="stat-label">Rides</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">15</span>
              <span className="stat-label">Coasters</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">365</span>
              <span className="stat-label">Days Open</span>
            </div>
          </div>
        </div>
        <div className="scroll-indicator">
          <span className="scroll-text">Scroll to Explore</span>
          <span className="scroll-arrow">↓</span>
        </div>
      </section>

      {/* Promotional Alert Bar */}
      <div className="alert-bar">
        <div className="alert-content">
          <span className="alert-icon">🔥</span>
          <span className="alert-text">
            LIMITED TIME: Buy 1 Day Ticket, Get 2nd Day FREE!
          </span>
          <button className="alert-cta" onClick={onGetStarted}>CLAIM OFFER →</button>
        </div>
      </div>

      {/* Ticket Deals Section */}
      <section className="tickets-section">
        <div className="section-header">
          <h2 className="section-title">TICKETS & SEASON PASSES</h2>
          <p className="section-subtitle">Choose your adventure - from single day tickets to unlimited annual passes</p>
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
            <button className="ticket-btn" onClick={onGetStarted}>Buy Now</button>
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
            <button className="ticket-btn premium-btn" onClick={onGetStarted}>Get Season Pass</button>
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
            <button className="ticket-btn vip-btn" onClick={onGetStarted}>Go VIP</button>
          </div>
        </div>
      </section>

      {/* Featured Attractions Carousel */}
      <section className="attractions-carousel-section">
        <div className="section-header">
          <h2 className="section-title">FEATURED ATTRACTIONS</h2>
          <p className="section-subtitle">Experience the most thrilling rides on the planet</p>
        </div>

        <div className="carousel-container">
          <div className="carousel-slide" style={{ backgroundImage: `url(${featuredAttractions[currentSlide].image})` }}>
            <div className="slide-overlay">
              <span className="slide-tag">{featuredAttractions[currentSlide].tag}</span>
              <h3 className="slide-title">{featuredAttractions[currentSlide].name}</h3>
              <p className="slide-description">{featuredAttractions[currentSlide].description}</p>
              <button className="slide-btn">Learn More →</button>
            </div>
          </div>
          <div className="carousel-dots">
            {featuredAttractions.map((_, index) => (
              <button
                key={index}
                className={`dot ${index === currentSlide ? 'active' : ''}`}
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
          <p className="section-subtitle">Don't miss out on these limited-time experiences</p>
        </div>

        <div className="events-grid">
          <div className="event-card halloween">
            <div className="event-image">
              <img src="https://images.unsplash.com/photo-1509722747041-616f39b57569?w=600" alt="Halloween Event" />
              <div className="event-date-badge">OCT 1 - 31</div>
            </div>
            <div className="event-content">
              <h3>Fright Fest</h3>
              <p>Experience terror around every corner with haunted mazes, scare zones, and spine-chilling shows!</p>
              <button className="event-btn">Get Tickets →</button>
            </div>
          </div>

          <div className="event-card holiday">
            <div className="event-image">
              <img src="https://images.unsplash.com/photo-1543589077-47d81606c1bf?w=600" alt="Holiday Event" />
              <div className="event-date-badge">NOV 15 - JAN 5</div>
            </div>
            <div className="event-content">
              <h3>Holiday in the Park</h3>
              <p>Millions of twinkling lights, festive shows, and magical holiday experiences for the whole family!</p>
              <button className="event-btn">Get Tickets →</button>
            </div>
          </div>

          <div className="event-card summer">
            <div className="event-image">
              <img src="https://images.unsplash.com/photo-1527004013197-933c4bb611b3?w=600" alt="Summer Event" />
              <div className="event-date-badge">JUN 1 - AUG 31</div>
            </div>
            <div className="event-content">
              <h3>Summer Nights</h3>
              <p>Extended hours, fireworks spectacular, and exclusive nighttime entertainment every weekend!</p>
              <button className="event-btn">Get Tickets →</button>
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
            <p>From quick bites to gourmet meals, we've got every craving covered</p>
            <a href="#" className="feature-link">Explore Restaurants →</a>
          </div>

          <div className="feature-box shopping">
            <div className="feature-icon-large">🛍️</div>
            <h3>Exclusive Merchandise</h3>
            <p>Take home memories with our unique souvenirs and apparel</p>
            <a href="#" className="feature-link">Shop Now →</a>
          </div>

          <div className="feature-box entertainment">
            <div className="feature-icon-large">🎪</div>
            <h3>Live Entertainment</h3>
            <p>Daily shows, street performers, and character meet & greets</p>
            <a href="#" className="feature-link">View Schedule →</a>
          </div>

          <div className="feature-box accessibility">
            <div className="feature-icon-large">♿</div>
            <h3>Accessibility Services</h3>
            <p>We're committed to making thrills accessible for everyone</p>
            <a href="#" className="feature-link">Learn More →</a>
          </div>
        </div>
      </section>

      {/* Email Signup Section */}
      <section className="newsletter-section">
        <div className="newsletter-content">
          <h2 className="newsletter-title">GET EXCLUSIVE DEALS</h2>
          <p className="newsletter-subtitle">
            Sign up for our newsletter and receive special offers, park updates, and insider information!
          </p>
          <form className="newsletter-form" onSubmit={handleEmailSubmit}>
            <input
              type="email"
              placeholder="Enter your email address"
              className="newsletter-input"
              value={emailSignup}
              onChange={(e) => setEmailSignup(e.target.value)}
              required
            />
            <button type="submit" className="newsletter-btn">
              SIGN UP
            </button>
          </form>
          <p className="newsletter-privacy">
            By signing up, you agree to receive marketing emails. You can unsubscribe at any time.
          </p>
        </div>
      </section>

      {/* Social Media Feed */}
      <section className="social-section">
        <h2 className="section-title">FOLLOW THE THRILLS</h2>
        <div className="social-grid">
          <a href="#" className="social-card">
            <div className="social-icon">📸</div>
            <span>Instagram</span>
          </a>
          <a href="#" className="social-card">
            <div className="social-icon">🐦</div>
            <span>Twitter</span>
          </a>
          <a href="#" className="social-card">
            <div className="social-icon">📘</div>
            <span>Facebook</span>
          </a>
          <a href="#" className="social-card">
            <div className="social-icon">🎵</div>
            <span>TikTok</span>
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="modern-footer">
        <div className="footer-main">
          <div className="footer-column">
            <h4>Plan Your Visit</h4>
            <ul>
              <li><a href="#">Park Hours</a></li>
              <li><a href="#">Directions & Parking</a></li>
              <li><a href="#">Park Map</a></li>
              <li><a href="#">Weather Policy</a></li>
              <li><a href="#">Group Sales</a></li>
            </ul>
          </div>

          <div className="footer-column">
            <h4>Guest Services</h4>
            <ul>
              <li><a href="#">FAQ</a></li>
              <li><a href="#">Accessibility</a></li>
              <li><a href="#">Lost & Found</a></li>
              <li><a href="#">Contact Us</a></li>
              <li><a href="#">Careers</a></li>
            </ul>
          </div>

          <div className="footer-column">
            <h4>More Information</h4>
            <ul>
              <li><a href="#">Safety Guidelines</a></li>
              <li><a href="#">Rules & Regulations</a></li>
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Terms of Service</a></li>
              <li><a href="#">Sponsorship</a></li>
            </ul>
          </div>

          <div className="footer-column">
            <h4>Stay Connected</h4>
            <p>Download our mobile app for the ultimate park experience!</p>
            <div className="app-buttons">
              <button className="app-store-btn">App Store</button>
              <button className="play-store-btn">Google Play</button>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; 2025 ThrillWorld Theme Park. All Rights Reserved.</p>
          <p className="footer-tagline">Where Adventure Never Ends</p>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
