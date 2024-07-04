import React, { useContext } from 'react';
import { Context } from '../store/appContext';
import { useNavigate } from 'react-router-dom';

const PhoneCard = ({ phones }) => {
    const { store, actions } = useContext(Context);
    const navigate = useNavigate();
    
    const handleView = async (phoneId) => {
        await actions.get_each_phone(phoneId);
        navigate(`/viewphone/${phoneId}`);
    };

    const handleChat = async (phoneUserId) => {
        await actions.checkAndCreateChannel(store.activeuserid, phoneUserId);
        navigate(`/chat`);
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
                            <p className="card-text"><strong>IMEI:</strong> {phone.IMEI}</p>
                            <p className="card-text"><strong>User Email:</strong> {phone.user_email}</p>
                            <button className="btn btn-primary" onClick={() => handleView(phone.id)}><strong>View</strong></button>
                            <button className="btn btn-secondary" onClick={() => handleChat(phone.user.id)}><strong>Chat</strong></button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default PhoneCard;
