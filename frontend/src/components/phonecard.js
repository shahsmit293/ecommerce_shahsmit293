import React, { useContext } from 'react';
import { Context } from '../store/appContext';
import { useNavigate } from 'react-router-dom';

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
        // Check if the phone is currently a favorite
        const isFavorite = favorites.some(fav => fav.phone_sell_id === phone.id);

        if (isFavorite) {
            console.log("Unfavoriting phone.");
            await actions.deleteFavorite(store.activeuserid, phone.id);
        } else {
            console.log("Adding phone to favorites.");
            await actions.addToFavorite(store.activeuserid, phone.id);
        }

        // Refresh the favorites from the backend to reflect changes
        actions.getFavorite(store.activeuserid);
    };

    return (
        <div className="row">
            {phones.map(phone => (
                <div key={phone.id} className="col-lg-4 col-md-6 mb-4">
                    <div className="card h-100">
                        <div className="card-body">
                            <h5 className="card-title">{phone.model}</h5>
                            <p className="card-text"><strong>Price:</strong> ${phone.price}</p>
                            <p className="card-text"><strong>Type:</strong> {phone.phonetype}</p>
                            <p className="card-text"><strong>Color:</strong> {phone.color}</p>
                            <p className="card-text"><strong>Storage:</strong> {phone.storage}</p>
                            <p className="card-text"><strong>Carrier:</strong> {phone.carrier}</p>
                            <p className="card-text"><strong>Condition:</strong> {phone.condition}</p>
                            <p className="card-text"><strong>Seller:</strong> {phone.seller}</p>
                            <p className="card-text"><strong>Location:</strong> {phone.location}</p>
                            <button className="btn btn-primary" onClick={() => handleView(phone.id)}>
                                <strong>View</strong>
                            </button>
                            {store.allsold.some(item=>item.phone_sell_id === phone.id) ? ("Sold Out") : (null)}
                            {store.token ? (
                                store.activeuserid === phone.user.id ? (null) : (
                                    <button className="btn btn-secondary" onClick={() => handleChat(phone.user.id)}>
                                        <strong>Chat</strong>
                                    </button>
                                )
                            ) : null}

                            {store.token && store.activeuserid !== phone.user.id && (
                                <button
                                    className="btn btn-warning"
                                    onClick={() => toggleFavorite(phone)}
                                >
                                    {favorites.some(fav => fav.phone_sell_id === phone.id) ? 'UnFavorite' : 'Add to Favorite'}
                                </button>
                            )}

                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default PhoneCard;
