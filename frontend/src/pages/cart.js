import React, { useContext, useEffect, useState } from "react";
import { Context } from "../store/appContext";
import PayPalButton from "../components/PayPalButton";

const Cart = () => {
    const { store, actions } = useContext(Context);
    const [loading, setLoading] = useState(true);
    const [buyerid, setBuyerid] = useState("");

    useEffect(() => {
        if (!store.activeuserid) {
            // Wait for user ID to be available
            return;
        }
        setBuyerid(store.activeuserid);
        const fetchPhone = async () => {
            setLoading(true);
            await actions.getcart(store.activeuserid);
            setLoading(false);
        };

        fetchPhone();
    }, [store.activeuserid]);

    if (loading) {
        return <div>Loading...</div>;
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
    return (
        <div>
            <h1>Phone Details</h1>
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
                        IMEI,
                        user_email,
                        first_name,
                        last_name,
                        paypal_email,
                        user
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
                        <button onClick={() => handleDelete(phone_sell_id)}>Delete</button>
                        <PayPalButton 
                            price={price} 
                            sellerpaypalemail={paypal_email} 
                            buyer_id={buyerid} 
                            phone_sell_id={phone_sell_id} 
                            seller_id={user.id} 
                        />
                    </div>
                );
            })}
        </div>
    );
};

export default Cart;
