import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Context } from "../store/appContext";

const ViewEachPhone = () => {
    const { seller_id } = useParams();
    const { store, actions } = useContext(Context);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPhone = async () => {
            setLoading(true);
            await actions.get_each_phone(seller_id);
            setLoading(false);
        };

        fetchPhone();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [seller_id]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!store.each_phone || store.each_phone.length === 0) {
        return <div>No phone details available.</div>;
    }

    const { model, price, phonetype, color, storage, carrier, condition, seller, location, IMEI, user_email, image_url } = store.each_phone[0];

    // Check if image_urls is defined and is an array before mapping
    if (!Array.isArray(image_url) || image_url.length === 0) {
        return (
            <div>
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
                <p><strong>IMEI:</strong> {IMEI}</p>
                <p><strong>User Email:</strong> {user_email}</p>
                <div>No images available for this phone.</div>
            </div>
        );
    }

    return (
        <div>
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
            <p><strong>IMEI:</strong> {IMEI}</p>
            <p><strong>User Email:</strong> {user_email}</p>

            <div>
                <h2>Images</h2>
                {image_url.map((imageUrl, index) => (
                    <img key={index} src={imageUrl} alt={`Image ${index + 1}`} style={{ maxWidth: '200px', maxHeight: '200px', margin: '10px' }} />
                ))}
            </div>
        </div>
    );
};

export default ViewEachPhone;
