import React, { useContext, useEffect, useState } from "react";
import { Context } from "../store/appContext";
import { useNavigate } from "react-router-dom";

const Favorite = () => {
    const { store, actions } = useContext(Context);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);  // Error state for handling fetch failures
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

    // Handle loading state
    if (loading) {
        return <div>Loading...</div>;
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
        <div>
            <h1>Phone Details</h1>
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
                        location,
                        IMEI,
                        user_email,
                        first_name,
                        last_name,
                        paypal_email,
                    },
                } = cartItem;

                return (
                    <div key={index} style={{ marginBottom: '20px' }}>
                        <p><strong>Model:</strong> {model}</p>
                        <p><strong>Price:</strong> ${price}</p>
                        <p><strong>Type:</strong> {phonetype}</p>
                        <p><strong>Color:</strong> {color}</p>
                        <p><strong>Storage:</strong> {storage}</p>
                        <p><strong>Carrier:</strong> {carrier}</p>
                        <p><strong>Condition:</strong> {condition}</p>
                        <p><strong>Seller:</strong> {seller}</p>
                        <p><strong>Location:</strong> {location}</p>
                        <button onClick={() => handleDelete(phone_sell_id)}>Delete</button>
                        <button className="btn btn-primary" onClick={() => handleView(phone_sell_id)}>
                            <strong>View</strong>
                        </button>
                    </div>
                );
            })}
        </div>
    );
};

export default Favorite;
