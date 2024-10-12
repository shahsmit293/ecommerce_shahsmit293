import React, { useContext, useEffect, useState } from "react";
import { Context } from "../store/appContext";
import PayPalButton from "../components/PayPalButton";
import '../styles/cart.css'; // Import the CSS file for table styles
import { useNavigate } from "react-router-dom";

const Cart = () => {
    const { store, actions } = useContext(Context);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [buyerid, setBuyerid] = useState("");

    useEffect(() => {
        if (!store.activeuserid) {
            return; // Wait for user ID to be available
        }
        setBuyerid(store.activeuserid);
        const fetchPhone = async () => {
            setLoading(true);
            await actions.getcart(store.activeuserid);
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

    if (!store.cartdetails || store.cartdetails.length === 0) {
        return <div>No phone details available.</div>;
    }

    const handleDelete = async (phone_sell_id) => {
        try {
            await actions.deleteFromCart(store.activeuserid, phone_sell_id);
            await actions.getcart(store.activeuserid);
        } catch (error) {
            console.error('Failed to delete item:', error);
        }
    };

    const handleView = (phone_sell_id) => {
        navigate(`/viewphone/${phone_sell_id}`);
    };

    return (
        <div className="table-container">
            <h2>Cart Details</h2>
            <table className="table">
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
                    {store.cartdetails.map((cartItem, index) => {
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
                                paypal_email,
                                user,
                                user_email,
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
                                <td data-label="Actions" className="actions">
                                    <button
                                        className="table-button view-button"
                                        onClick={() => handleView(phone_sell_id)}
                                    >
                                        View
                                    </button>
                                    <button
                                        className="table-button delete-button"
                                        onClick={() => handleDelete(phone_sell_id)}
                                    >
                                        Delete
                                    </button>
                                    <PayPalButton
                                        price={price}
                                        sellerpaypalemail={paypal_email}
                                        buyer_id={buyerid}
                                        phone_sell_id={phone_sell_id}
                                        seller_id={user.id}
                                        seller_email={user_email}
                                        buyer_email={store.user.email}
                                    />
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default Cart;
