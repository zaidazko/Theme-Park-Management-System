import {useState, useEffect} from 'react';

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

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', maxWidth: '1200px', margin: '40px auto', padding: '30px'}}>
            <div style = {{ marginBottom: '20px', display: 'block'}}>
                <h2 style={{ textAlign: 'center'}}>Rides</h2>
            </div>
            {error && <div style={{ padding: '12px', backgroundColor: '#d4edda', color: '#721c24', borderRadius: '6px', marginBottom: '20px', textAlgin: 'center' }}>{error}</div>}
            
            {loading ? (
                <div style = {{ textAlign: 'center', padding: '40px' }}>Loading...</div>
            ) : rides.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                    No rides available.
                </div>
            ) : (
                <div className='RideGrid' style={{ display: 'block', margin:'auto'}}>
                    {rides.map((ride)=>(
                        <div key={ride.ride_ID} style={{
                            backgroundColor: '#fff',
                            borderRadius: '8px',
                            width: '48%',
                            float: 'left',
                            margin: '10px',
                            }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                float: 'center',
                                height: '300px',
                                overflow: 'hidden',
                                borderRadius: '8px'
                            }}>
                                <img src={ride.image || "https://media.istockphoto.com/id/186293315/photo/looping-roller-coaster.jpg?s=612x612&w=0&k=20&c=r0Uq8QvhEjoFOodlgaD_5gMOYOF4rbFxKIp6UOFrcJA="} style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover'
                                }}/>
                                <p>{ride.Image}</p>
                            </div>
                            <h3 style={{
                                paddingTop: '30px',
                                paddingBottom: '30px',
                                textAlign: 'center'
                            }}>
                                {ride.ride_Name}
                            </h3>
                        </div>
                    ))}    
                </div>
            )}
            
        </div>
    );
};

export default Rides;