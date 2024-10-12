import React, { useContext } from 'react';
import { Context } from '../store/appContext';
import { useNavigate } from 'react-router-dom';
import '../styles/phonecard.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye } from '@fortawesome/free-regular-svg-icons';
import { faComments, faHeart } from '@fortawesome/free-solid-svg-icons';
const PhoneCard = ({ phones, favorites }) => {
    const { store, actions } = useContext(Context);
    const navigate = useNavigate();

    // Function to handle viewing phone details
    const handleView = (phoneId) => {
        navigate(`/viewphone/${phoneId}`);
    };

    // Function to handle chat button click
    const handleChat = async (phoneUserId) => {
        await actions.checkAndCreateChannel(store.activeuserid, phoneUserId);
        navigate(`/chat`);
    };

    // Function to toggle favorite status
    const toggleFavorite = async (phone) => {
        const isFavorite = favorites.some(fav => fav.phone_sell_id === phone.id);
        if (isFavorite) {
            await actions.deleteFavorite(store.activeuserid, phone.id);
        } else {
            await actions.addToFavorite(store.activeuserid, phone.id);
        }
        actions.getFavorite(store.activeuserid); // Refresh favorites
    };

    return (
        <div className="phone-card-container">
            {phones.map(phone => (
                <div key={phone.id} className="phone-card">
                    <img src={phone.image_url[0]} alt={phone.model} className="browse-phone-image" />
                    <div className="phone-details">
                        <h5> ${phone.price}</h5>
                        <h6> {phone.phonetype},{phone.color},{phone.storage},</h6>
                        <h6> {phone.carrier}, {phone.condition}, {phone.seller}</h6>
                        {store.allsold.some(item => item.phone_sell_id === phone.id) ? (
                            <h6 className="sold-out">Sold Out</h6>
                        ) : null}
                    </div>
                    
                    <div className="phone-actions">
                        <button className="view-button" onClick={() => handleView(phone.id)}>
                            <FontAwesomeIcon icon={faEye} />
                        </button>
                        {store.token && store.activeuserid !== phone.user.id && (
                            <>
                                <button className="chat-button" onClick={() => handleChat(phone.user.id)}>
                                    <FontAwesomeIcon icon={faComments} />
                                </button>
                                <button className="favorite-button" onClick={() => toggleFavorite(phone)}>
                                    {favorites.some(fav => fav.phone_sell_id === phone.id) ? <FontAwesomeIcon icon={faHeart} style={{ color: 'red' }} /> : <FontAwesomeIcon icon={faHeart} />}
                                </button>
                            </>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default PhoneCard;
