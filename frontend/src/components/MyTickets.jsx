import React, { useState, useEffect } from 'react';
import api from '../api';

const MyTickets = () => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMyTickets();
    }, []);

    const fetchMyTickets = async () => {
        try {
            const customerId = localStorage.getItem('customerId');
            const response = await api.get(`/ticket/customer/${customerId}`);
            setTickets(response.data);
        } catch (error) {
            console.error('Error fetching tickets:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="text-center py-8">Loading...</div>;

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h2 className="text-3xl font-bold mb-6">My Tickets</h2>
            
            {tickets.length === 0 ? (
                <div className="bg-white p-8 rounded-lg shadow text-center">
                    <p className="text-gray-500">You haven't purchased any tickets yet.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {tickets.map((ticket) => (
                        <div key={ticket.saleId} className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-xl font-semibold">{ticket.ticketType}</h3>
                                    <p className="text-gray-600">Quantity: {ticket.quantitySold}</p>
                                    <p className="text-gray-600">
                                        Date: {new Date(ticket.saleDate).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-bold text-blue-600">${ticket.totalPrice}</p>
                                    <p className="text-sm text-gray-500">Sale #{ticket.saleId}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyTickets;