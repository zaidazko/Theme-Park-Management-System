import {useState, useEffect} from 'react';
import './ThemePark.css';

const Rides = () => {
    const [rides, setRides] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchRides();
    }, []);

    const fetchRides = async () => {
        try {
            const response = await fetch('http://localhost:5239/api/rides');
            if (!response.ok) throw new Error('Failed to fetch rides');
            const data = await response.json();
            setRides(data);
        }
        catch (err) {
            setError('Failed to load rides');
        }
        finally {
            setLoading(false);
        }
    };

    const getRideStatusBadge = (status) => {
        if (status === 'Open' || status === 'Operational') {
            return <span className="theme-park-badge theme-park-badge-success">✅ Open</span>;
        } else if (status === 'Closed' || status === 'Under Maintenance') {
            return <span className="theme-park-badge theme-park-badge-danger">🔧 Closed</span>;
        } else {
            return <span className="theme-park-badge theme-park-badge-warning">⚠️ {status}</span>;
        }
    };

    if (loading) {
        return (
            <div className="theme-park-page">
                <div className="theme-park-loading">
                    <div className="theme-park-spinner"></div>
                    <div className="theme-park-loading-text">Loading rides...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="theme-park-page">
            <div className="theme-park-container-wide">
                <div className="theme-park-header">
                    <h1 className="theme-park-title">🎢 Our Rides</h1>
                    <p className="theme-park-subtitle">Experience the ultimate thrills and excitement</p>
                </div>

                {error && (
                    <div className="theme-park-alert theme-park-alert-error">
                        <span style={{ fontSize: '24px' }}>⚠️</span>
                        <span>{error}</span>
                    </div>
                )}

                {rides.length === 0 ? (
                    <div className="theme-park-empty">
                        <div className="theme-park-empty-icon">🎢</div>
                        <div className="theme-park-empty-title">No Rides Available</div>
                        <div className="theme-park-empty-text">Check back later for exciting attractions!</div>
                    </div>
                ) : (
                    <div className="theme-park-grid">
                        {rides.map((ride) => (
                            <div key={ride.ride_ID} className="theme-park-card" style={{ padding: '0', overflow: 'hidden' }}>
                                <div style={{
                                    position: 'relative',
                                    height: '250px',
                                    overflow: 'hidden',
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                                }}>
                                    <img
                                        src={ride.image || "https://media.istockphoto.com/id/186293315/photo/looping-roller-coaster.jpg?s=612x612&w=0&k=20&c=r0Uq8QvhEjoFOodlgaD_5gMOYOF4rbFxKIp6UOFrcJA="}
                                        alt={ride.ride_Name}
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover',
                                            transition: 'transform 0.3s ease'
                                        }}
                                        onMouseOver={(e) => e.target.style.transform = 'scale(1.1)'}
                                        onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                                    />
                                    <div style={{
                                        position: 'absolute',
                                        top: '15px',
                                        right: '15px'
                                    }}>
                                        {getRideStatusBadge(ride.status)}
                                    </div>
                                </div>
                                <div style={{ padding: '25px', textAlign: 'center' }}>
                                    <h3 style={{ fontSize: '22px', fontWeight: '700', color: 'var(--text-dark)', marginBottom: '10px' }}>
                                        🎢 {ride.ride_Name}
                                    </h3>
                                    <div style={{ fontSize: '14px', color: 'var(--text-medium)' }}>
                                        Capacity: {ride.capacity} riders
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Rides;