import React, { useContext } from 'react';
import { Context } from '../store/appContext';
import { useNavigate } from 'react-router-dom';

const PhoneCard = ({ phones }) => {
    const {actions} = useContext(Context)
    const navigate =useNavigate()
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
                            <button className="card-text" onClick={()=>{actions.get_each_phone(phone.id);navigate(`/viewphone/${phone.id}`)}}><strong>View</strong></button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default PhoneCard;
