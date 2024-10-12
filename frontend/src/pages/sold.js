import React, { useContext, useEffect, useState } from "react";
import { Context } from "../store/appContext";
import { useNavigate } from "react-router-dom";
import '../styles/sold.css'; // Import the CSS file for table styles

const Sold = () => {
    const { store, actions } = useContext(Context);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    
    useEffect(() => {
        if (!store.activeuserid) {
            // Wait for user ID to be available
            return;
        }
        const fetchPhone = async () => {
            setLoading(true);
            await actions.getSold(store.activeuserid);
            setLoading(false);
        };

        fetchPhone();
    }, [store.activeuserid]);

    if (!store.token) {
        return (
          <div>
            Please log in to view this page.
            <button onClick={() => navigate('/login')}>Login</button>
          </div>
        );
      }

    if (loading) {
        return (
            <div className="loading-spinner">
                <div className="spinner"></div>
            </div>
        );
    }

    if (!store.mysold || store.mysold.length === 0) {
        return <div>No phone details available.</div>;
    }

    const handleView = (phone_sell_id) => {
        navigate(`/viewphone/${phone_sell_id}`);
    };

    return (
        <div className="sold-table-container">
            <h2>Sold Phones</h2>
            <table className="sold-table">
                <thead>
                    <tr>
                        <th>Model</th>
                        <th>Price</th>
                        <th>Type</th>
                        <th>Color</th>
                        <th>Storage</th>
                        <th>Carrier</th>
                        <th>Condition</th>
                        <th>Seller</th>
                        <th>Location</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {store.mysold.map((cartItem, index) => {
                        const {
                            phone_sell_id,
                            phone: {
                                model,
                                price,
                                phonetype,
                                color,
                                storage,
                                carrier,
                                condition,
                                seller,
                                location
                            },
                        } = cartItem;

                        return (
                            <tr key={index}>
                                <td data-label="Model">{model}</td>
                                <td data-label="Price">${price}</td>
                                <td data-label="Type">{phonetype}</td>
                                <td data-label="Color">{color}</td>
                                <td data-label="Storage">{storage}</td>
                                <td data-label="Carrier">{carrier}</td>
                                <td data-label="Condition">{condition}</td>
                                <td data-label="Seller">{seller}</td>
                                <td data-label="Location">{location}</td>
                                <td className="sold-actions">
                                    <button 
                                        className="sold-view-button" 
                                        onClick={() => handleView(phone_sell_id)}>
                                        View
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default Sold;
