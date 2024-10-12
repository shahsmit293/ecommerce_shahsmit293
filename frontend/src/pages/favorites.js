import React, { useContext, useEffect, useState } from "react";
import { Context } from "../store/appContext";
import { useNavigate } from "react-router-dom";
import '../styles/favorites.css'; // Import the CSS file for table styles

const Favorite = () => {
    const { store, actions } = useContext(Context);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null); // Error state for handling fetch failures
    const navigate = useNavigate();

    useEffect(() => {
        const fetchFavoritePhones = async () => {
            if (!store.activeuserid) {
                // Wait for user ID to be available
                return;
            }

            try {
                setLoading(true);
                setError(null); // Reset error state before fetching
                await actions.getFavorite(store.activeuserid);
            } catch (err) {
                setError('Failed to load favorite phones. Please try again later.');
                console.error('Fetch error:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchFavoritePhones();
    }, [store.activeuserid]); // Depend on `store.activeuserid` to ensure it is set before fetching

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

    // Handle error state
    if (error) {
        return <div>{error}</div>;
    }

    // Handle case where there are no favorites
    if (!store.allfavorites || store.allfavorites.length === 0) {
        return <div>No phone details available.</div>;
    }

    // Handle delete favorite phone
    const handleDelete = async (phone_sell_id) => {
        try {
            await actions.deleteFavorite(store.activeuserid, phone_sell_id);
            await actions.getFavorite(store.activeuserid); // Refresh favorites after deletion
        } catch (err) {
            console.error('Failed to delete item:', err);
        }
    };

    // Handle view phone details
    const handleView = (phone_sell_id) => {
        navigate(`/viewphone/${phone_sell_id}`);
    };

    return (
        <div className="fav-table-container">
            <h2>Phone</h2>
            <table className="fav-table">
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
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {store.allfavorites.map((cartItem, index) => {
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
                                <td className="fav-actions">
                                    <button 
                                        className="fav-view-button" 
                                        onClick={() => handleView(phone_sell_id)}>
                                        View
                                    </button>
                                    <button 
                                        className="fav-delete-button" 
                                        onClick={() => handleDelete(phone_sell_id)}>
                                        Delete
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

export default Favorite;
