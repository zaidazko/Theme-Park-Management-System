import React, { useState, useEffect } from 'react';
import api from '../api';

const Restaurant = () => {
    const [menuItems, setMenuItems] = useState([]);
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(false);

    // Mock data - replace with API call when backend is ready
    useEffect(() => {
        // Replace this with actual API call
        setMenuItems([
            { id: 1, name: 'Burger', price: 12.99, category: 'Main', description: 'Classic beef burger with fries' },
            { id: 2, name: 'Pizza', price: 15.99, category: 'Main', description: 'Margherita pizza' },
            { id: 3, name: 'Ice Cream', price: 4.99, category: 'Dessert', description: 'Vanilla ice cream' },
            { id: 4, name: 'Soda', price: 2.99, category: 'Drink', description: 'Coca-Cola' },
        ]);
    }, []);

    const addToCart = (item) => {
        const existingItem = cart.find(c => c.id === item.id);
        if (existingItem) {
            setCart(cart.map(c => 
                c.id === item.id 
                    ? { ...c, quantity: c.quantity + 1 }
                    : c
            ));
        } else {
            setCart([...cart, { ...item, quantity: 1 }]);
        }
    };

    const removeFromCart = (itemId) => {
        setCart(cart.filter(item => item.id !== itemId));
    };

    const getTotalPrice = () => {
        return cart.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2);
    };

    const handleCheckout = async () => {
        setLoading(true);
        try {
            // Add API call here
            alert('Order placed successfully!');
            setCart([]);
        } catch (error) {
            console.error('Error placing order:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-6">
            <h2 className="text-3xl font-bold mb-6">Restaurant Menu</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
                {/* Menu Section */}
                <div>
                    <h3 className="text-xl font-semibold mb-4">Menu Items</h3>
                    <div className="space-y-4">
                        {menuItems.map(item => (
                            <div key={item.id} className="bg-white p-4 rounded-lg shadow">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="font-semibold">{item.name}</h4>
                                        <p className="text-gray-600 text-sm">{item.description}</p>
                                        <span className="inline-block bg-gray-100 px-2 py-1 rounded text-xs mt-1">
                                            {item.category}
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-lg">${item.price}</p>
                                        <button
                                            onClick={() => addToCart(item)}
                                            className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                                        >
                                            Add to Cart
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Cart Section */}
                <div>
                    <h3 className="text-xl font-semibold mb-4">Your Order</h3>
                    <div className="bg-white p-4 rounded-lg shadow">
                        {cart.length === 0 ? (
                            <p className="text-gray-500 text-center py-8">Your cart is empty</p>
                        ) : (
                            <>
                                <div className="space-y-3">
                                    {cart.map(item => (
                                        <div key={item.id} className="flex justify-between items-center">
                                            <div>
                                                <p className="font-medium">{item.name}</p>
                                                <p className="text-sm text-gray-600">
                                                    ${item.price} x {item.quantity}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold">
                                                    ${(item.price * item.quantity).toFixed(2)}
                                                </span>
                                                <button
                                                    onClick={() => removeFromCart(item.id)}
                                                    className="text-red-500 hover:text-red-700"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                
                                <div className="border-t mt-4 pt-4">
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="text-xl font-semibold">Total:</span>
                                        <span className="text-2xl font-bold text-blue-600">
                                            ${getTotalPrice()}
                                        </span>
                                    </div>
                                    <button
                                        onClick={handleCheckout}
                                        disabled={loading}
                                        className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400"
                                    >
                                        {loading ? 'Processing...' : 'Place Order'}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Restaurant;