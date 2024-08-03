import React, { useContext, useEffect, useState } from "react";
import { Context } from "../store/appContext";
import { useNavigate } from "react-router-dom";

const Purchase = () => {
    const { store, actions } = useContext(Context);
    const [loading, setLoading] = useState(true);
    const navigate =useNavigate()
    useEffect(() => {
        if (!store.activeuserid) {
            // Wait for user ID to be available
            return;
        }
        const fetchPhone = async () => {
            setLoading(true);
            await actions.getPurchase(store.activeuserid);
            setLoading(false);
        };

        fetchPhone();
    }, [store.activeuserid]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!store.allpurchased || store.allpurchased.length === 0) {
        return <div>No phone details available.</div>;
    }

    const handleView = async (phone_sell_id) => {
        navigate(`/viewphone/${phone_sell_id}`);
    };
    return (
        <div>
            <h1>Phone Details</h1>
            {store.allpurchased.map((cartItem, index) => {
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
                        paypal_email
                    }
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
                        <button className="btn btn-primary" onClick={() => handleView(phone_sell_id)}><strong>View</strong></button>
                    </div>
                );
            })}
        </div>
    );
};

export default Purchase;
