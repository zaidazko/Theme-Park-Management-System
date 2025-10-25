import {useState, useEffect} from 'react';

const Rides = () => {
    const [rides, setRides] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const isEmployee = currentUser.userType === 'Employee' || currentUser.userType === 'Manager';

    useEffect(() => {
        fetchRides();
    }, []);

    const fetchRides = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:5239/api/rides');
            if (!response.ok) throw new Error('Failed to fetch rides');
            const data = await response.json();
            setRides(data);
            console.log(data)
        }
        catch (err) {
            setError('Failed to load rides');
        }
        finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', maxWidth: '1200px', margin: '40px auto', padding: '30px', backgroundColor: '#fff', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)'}}>
            <div style = {{ margin: '20px', height: '50px', display: 'block'}}>
                <h2 style={{ textAlign: 'center'}}>Rides</h2>
            </div>
            {error && <div style={{ padding: '12px', backgroundColor: 'd4edda', color: '#721c24', borderRadius: '6px', marginBottom: '20px', textAlgin: 'center' }}>{error}</div>}
            
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
                            backgroundColor: '#d9ebffff',
                            borderRadius: '8px',
                            width: '48%',
                            float: 'left',
                            margin: '10px',
                            }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                float: 'center'
                            }}>
                                <img src="https://media.istockphoto.com/id/186293315/photo/looping-roller-coaster.jpg?s=612x612&w=0&k=20&c=r0Uq8QvhEjoFOodlgaD_5gMOYOF4rbFxKIp6UOFrcJA=" style={{
                                    width: '80%',
                                    borderRadius: '8px',
                                    marginTop: '10px'
                                }}/>
                            </div>
                            <h3 style={{
                                paddingTop: '30px',
                                paddingBottom: '30px',
                                textAlign: 'center'
                            }}>{ride.ride_Name}</h3>

                            {isEmployee && <p style={{
                                textAlign: 'center',
                                marginBottom: '40px'
                            }}>{ride.status}</p>}
                        
                        </div>
                    ))}    
                </div>
            )}
            
        </div>
    );
};

export default Rides;