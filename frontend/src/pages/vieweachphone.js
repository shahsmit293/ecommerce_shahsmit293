import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Context } from "../store/appContext";
import '../styles/vieweachphone.css'; // Import the new CSS file

const ViewEachPhone = () => {
    const { phone_id } = useParams();
    const navigate = useNavigate();
    const { store, actions } = useContext(Context);
    const [loading, setLoading] = useState(true);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isFullScreen, setIsFullScreen] = useState(false); // State to manage full-screen view

    useEffect(() => {
        const fetchPhone = async () => {
            try {
                setLoading(true);
                await actions.get_each_phone(phone_id);
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
        return (
            <div className="loading-spinner">
                <div className="spinner"></div>
            </div>
        );
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

    const handlePrevImage = () => {
        setCurrentImageIndex((prevIndex) => (prevIndex === 0 ? image_url.length - 1 : prevIndex - 1));
    };

    const handleNextImage = () => {
        setCurrentImageIndex((prevIndex) => (prevIndex === image_url.length - 1 ? 0 : prevIndex + 1));
    };

    const toggleFullScreen = () => {
        setIsFullScreen(!isFullScreen);
    };

    const renderPhoneDetails = () => (
        <div className="phone-info">
            <h1>{phonetype}</h1>
            <p>
                Discover the best deals on used phones. This {phonetype} is in {condition} condition,
                available in {color}, with {storage} of storage, and sold by {seller} from {location}.
            </p>
            <ul>
                <li><strong>Storage:</strong> {storage}</li>
                <li><strong>Carrier:</strong> {carrier}</li>
                <li><strong>Condition:</strong> {condition}</li>
                <li><strong>Seller:</strong> {seller}</li>
                <li><strong>Location:</strong> {location}</li>
                <li><strong>Model:</strong> {model}</li>
            </ul>
            <h2 className="phone-price">${price}</h2>
            
            {store.token ? (
                store.activeuserid === user.id ? null :
                store.allsold.some(item => item.phone_sell_id === id) ? (
                    <div className="sold-out-viewpage">Sold Out</div>
                ) : store.cartdetails.some(item => item.phone_sell_id === id) ? (
                    <div className="already-in-cart">Added to cart</div>
                ) : (
                    <button 
                        className="buy-now-button"
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
                    className="buy-now-button"
                    onClick={() => navigate('/login', { state: { from: window.location.pathname } })}
                >
                    Log in To Buy
                </button>
            )}
        </div>
    );

    return (
        <div className="phone-details-container">
            <div className="phone-images">
                {/* Show prev and next buttons only if more than one image */}
                {image_url.length > 1 && (
                    <button className="prev-btn" onClick={handlePrevImage}>❮</button>
                )}
                <img
                    src={image_url[currentImageIndex]}
                    alt={`Phone image ${currentImageIndex + 1}`}
                    className="phone-image"
                    onClick={toggleFullScreen} // Add click event to trigger full-screen
                />
                {image_url.length > 1 && (
                    <button className="next-btn" onClick={handleNextImage}>❯</button>
                )}

                {/* Fullscreen Overlay */}
                {isFullScreen && (
                    <div className="fullscreen-overlay">
                        {/* Show prev and next buttons only if more than one image */}
                        {image_url.length > 1 && (
                            <>
                                <button className="prev-btn-fullscreen" onClick={handlePrevImage}>❮</button>
                                <button className="next-btn-fullscreen" onClick={handleNextImage}>❯</button>
                            </>
                        )}
                        <img
                            src={image_url[currentImageIndex]}
                            alt={`Full-screen phone image ${currentImageIndex + 1}`}
                            className="fullscreen-image"
                        />
                        <button className="close-btn" onClick={toggleFullScreen}>✖</button>
                    </div>
                )}

                {/* Progress Dots */}
                {image_url.length > 1 && (
                    <div className="image-indicators">
                        {image_url.map((_, index) => (
                            <span
                                key={index}
                                className={`dot ${index === currentImageIndex ? 'active' : ''}`}
                            ></span>
                        ))}
                    </div>
                )}
            </div>

            {renderPhoneDetails()}
        </div>
    );
};

export default ViewEachPhone;
