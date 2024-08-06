import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Context } from "../store/appContext";

const ViewEachPhone = () => {
    const { phone_id } = useParams();
    const navigate = useNavigate();
    const { store, actions } = useContext(Context);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPhone = async () => {
            try {
                setLoading(true);
                await actions.get_each_phone(phone_id);
                // Only fetch cart and purchase details if a user is logged in
                if (store.activeuserid) {
                    await actions.getcart(store.activeuserid);
                    await actions.getPurchase(store.activeuserid);
                }
            } catch (err) {
                console.error('Fetch error:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchPhone();
    }, [phone_id, store.activeuserid]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!store.each_phone || store.each_phone.length === 0) {
        return <div>No phone details available.</div>;
    }

    const {
        id,
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
        image_url,
        first_name,
        last_name,
        paypal_email,
        user
    } = store.each_phone;

    const renderPhoneDetails = () => (
        <>
            <h1>Phone Details</h1>
            <p><strong>Model:</strong> {model}</p>
            <p><strong>Price:</strong> ${price}</p>
            <p><strong>Type:</strong> {phonetype}</p>
            <p><strong>Color:</strong> {color}</p>
            <p><strong>Storage:</strong> {storage}</p>
            <p><strong>Carrier:</strong> {carrier}</p>
            <p><strong>Condition:</strong> {condition}</p>
            <p><strong>Seller:</strong> {seller}</p>
            <p><strong>Location:</strong> {location}</p>

            {store.token ? (
                store.activeuserid === user.id ? null : 
                store.allsold.some(item => item.phone_sell_id === id) ? (
                    "Sold Out"
                ) : store.cartdetails.some(item => item.phone_sell_id === id) ? (
                    "Already added to cart"
                ) : (
                    <button 
                        onClick={async () => {
                            await actions.addToCart(store.activeuserid, id);
                            await actions.getcart(store.activeuserid);
                        }}
                    >
                        Add to Cart
                    </button>
                )
            ) : (
                <button 
                    onClick={() => navigate('/login', { state: { from: window.location.pathname } })}
                >
                    Log in To Buy
                </button>
            )}
        </>
    );

    if (!Array.isArray(image_url) || image_url.length === 0) {
        return (
            <div>
                {renderPhoneDetails()}
                <div>No images available for this phone.</div>
            </div>
        );
    }

    return (
        <div>
            {renderPhoneDetails()}
            <div>
                <h2>Images</h2>
                {image_url.map((imageUrl, index) => (
                    <img
                        key={index}
                        src={imageUrl}
                        alt={`Image ${index + 1}`}
                        style={{ maxWidth: '200px', maxHeight: '200px', margin: '10px' }}
                    />
                ))}
            </div>
        </div>
    );
};

export default ViewEachPhone;
