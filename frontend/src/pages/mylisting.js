import React, { useContext, useEffect, useState } from "react";
import { Context } from "../store/appContext";
import { useNavigate } from "react-router-dom";

const MyListing = () => {
    const { store, actions } = useContext(Context);
    const [loading, setLoading] = useState(true);
    const [showPriceModal, setShowPriceModal] = useState(false); // State for price modal
    const [showEmailModal, setShowEmailModal] = useState(false); // State for PayPal email modal
    const [editPhoneId, setEditPhoneId] = useState(null);
    const [oldPrice, setOldPrice] = useState('');
    const [newPrice, setNewPrice] = useState('');
    const [oldPayPalEmail, setOldPayPalEmail] = useState(''); // State for old PayPal email
    const [newPayPalEmail, setNewPayPalEmail] = useState(''); // State for new PayPal email
    const navigate = useNavigate();

    useEffect(() => {
        if (!store.activeuserid) {
            return;
        }

        const fetchPhone = async () => {
            setLoading(true);
            await actions.getalllistingphone(store.activeuserid);
            setLoading(false);
        };

        fetchPhone();
    }, [store.activeuserid]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!store.alllistedphones || store.alllistedphones.length === 0) {
        return <div>No phone details available.</div>;
    }

    const handleView = async (phone_sell_id) => {
        navigate(`/viewphone/${phone_sell_id}`);
    };

    const deletePhone = async (phone_sell_id) => {
        try {
            await actions.deletePhone(phone_sell_id);
            await actions.getalllistingphone(store.activeuserid);
        } catch (error) {
            console.error('Error deleting phone:', error);
        }
    };

    const openEditPriceModal = (phone) => {
        setEditPhoneId(phone.id);
        setOldPrice(phone.price);
        setNewPrice(phone.price);
        setShowPriceModal(true);
    };

    const openEditEmailModal = (phone) => {
        setEditPhoneId(phone.id);
        setOldPayPalEmail(phone.paypal_email);
        setNewPayPalEmail(phone.paypal_email);
        setShowEmailModal(true);
    };

    const handlePriceChange = async (e) => {
        e.preventDefault();
        try {
            await actions.updatePrice(editPhoneId, newPrice);
            setShowPriceModal(false);
            await actions.getalllistingphone(store.activeuserid);
        } catch (error) {
            console.error('Error updating price:', error);
        }
    };

    const handleEmailChange = async (e) => {
        e.preventDefault();
        try {
            await actions.updatePaypalEmail(editPhoneId, newPayPalEmail);
            setShowEmailModal(false);
            await actions.getalllistingphone(store.activeuserid);
        } catch (error) {
            console.error('Error updating PayPal email:', error);
        }
    };

    return (
        <div>
            <h1>Phone Details</h1>
            {store.alllistedphones.map((phone) => (
                <div key={phone.id} className="col-lg-4 col-md-6 mb-4">
                    <div className="card h-100">
                        <div className="card-body">
                            <h5 className="card-title">{phone.model}</h5>
                            <p className="card-text">
                                <strong>Price:</strong> ${phone.price}
                            </p>
                            <p className="card-text">
                                <strong>Type:</strong> {phone.phonetype}
                            </p>
                            <p className="card-text">
                                <strong>Color:</strong> {phone.color}
                            </p>
                            <p className="card-text">
                                <strong>Storage:</strong> {phone.storage}
                            </p>
                            <p className="card-text">
                                <strong>Carrier:</strong> {phone.carrier}
                            </p>
                            <p className="card-text">
                                <strong>Condition:</strong> {phone.condition}
                            </p>
                            <p className="card-text">
                                <strong>Seller:</strong> {phone.seller}
                            </p>
                            <p className="card-text">
                                <strong>Location:</strong> {phone.location}
                            </p>
                            <p className="card-text">
                                <strong>IMEI:</strong> {phone.IMEI}
                            </p>
                            <p className="card-text">
                                <strong>User Email:</strong> {phone.user_email}
                            </p>
                            <p className="card-text">
                                <strong>PayPal Email:</strong> {phone.paypal_email}
                            </p>
                            <button
                                className="btn btn-primary"
                                onClick={() => handleView(phone.id)}
                            >
                                <strong>View</strong>
                            </button>
                            
                            {store.allsold.some((item) => item.phone_sell_id === phone.id) ? (
                                <p>Sold Out</p>
                            ) : (
                            <>
                            <button className="btn btn-primary" onClick={() => deletePhone(phone.id)}>
                                <strong>Delete this listing</strong>
                            </button>
                            <button className="btn btn-primary" onClick={() => openEditPriceModal(phone)}>
                                <strong>Edit Price</strong>
                            </button>
                            <button className="btn btn-primary" onClick={() => openEditEmailModal(phone)}>
                                <strong>Edit PayPal Email</strong>
                            </button>
                            </>)}
                        </div>
                    </div>
                </div>
            ))}

            {showPriceModal && (
                <div className="modal show" style={{ display: 'block' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Edit Price</h5>
                                <button type="button" className="close" onClick={() => setShowPriceModal(false)}>
                                    <span>&times;</span>
                                </button>
                            </div>
                            <div className="modal-body">
                                <form onSubmit={handlePriceChange}>
                                    <div className="form-group">
                                        <label>Old Price</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={`$${oldPrice}`}
                                            readOnly
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>New Price</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            value={newPrice}
                                            onChange={(e) => setNewPrice(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <button type="submit" className="btn btn-primary">
                                        Update Price
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showEmailModal && (
                <div className="modal show" style={{ display: 'block' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Edit PayPal Email</h5>
                                <button type="button" className="close" onClick={() => setShowEmailModal(false)}>
                                    <span>&times;</span>
                                </button>
                            </div>
                            <div className="modal-body">
                                <form onSubmit={handleEmailChange}>
                                    <div className="form-group">
                                        <label>Old PayPal Email</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={oldPayPalEmail}
                                            readOnly
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>New PayPal Email</label>
                                        <input
                                            type="email"
                                            className="form-control"
                                            value={newPayPalEmail}
                                            onChange={(e) => setNewPayPalEmail(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <button type="submit" className="btn btn-primary">
                                        Update PayPal Email
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyListing;
