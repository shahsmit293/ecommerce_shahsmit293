import React, { useContext, useEffect, useState } from "react";
import { Context } from "../store/appContext";
import { useNavigate } from "react-router-dom";
import '../styles/mylisting.css'; // Import the CSS file for table styles
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faTrashAlt, faEdit, faDollarSign, faEnvelope } from '@fortawesome/free-solid-svg-icons'; // Import specific icons

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
    if (!store.token) {
        return (
          <div>
            Please log in to view this page.
            <button onClick={() => navigate('/login')}>Login</button>
          </div>
        );
      }
    if (loading) {
        return (
            <div className="loading-spinner">
                <div className="spinner"></div>
            </div>
        );
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
        <div className="listing-table-container">
            <h2>My Listings</h2>
            <table className="listing-table">
                <thead>
                    <tr>
                        <th>Model</th>
                        <th>Price</th>
                        <th>Type</th>
                        <th>Color</th>
                        <th>Storage</th>
                        <th>Carrier</th>
                        <th>IMEI</th>
                        <th>PayPal Email</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {store.alllistedphones.map((phone) => (
                        <tr key={phone.id}>
                            <td data-label="Model">{phone.model}</td>
                            <td data-label="Price">${phone.price}</td>
                            <td data-label="Type">{phone.phonetype}</td>
                            <td data-label="Color">{phone.color}</td>
                            <td data-label="Storage">{phone.storage}</td>
                            <td data-label="Carrier">{phone.carrier}</td>
                            <td data-label="IMEI">{phone.IMEI}</td>
                            <td data-label="PayPal Email">{phone.paypal_email}</td>
                            <td className="listing-actions">
                                <button 
                                    className="listing-view-button" 
                                    onClick={() => handleView(phone.id)}>
                                    <FontAwesomeIcon icon={faEye} />
                                </button>
                                <button 
                                    className="listing-delete-button" 
                                    onClick={() => deletePhone(phone.id)}>
                                    <FontAwesomeIcon icon={faTrashAlt} />
                                </button>
                                <button 
                                    className="listing-edit-button" 
                                    onClick={() => openEditPriceModal(phone)}>
                                    <FontAwesomeIcon icon={faDollarSign} />
                                </button>
                                <button 
                                    className="listing-edit-button" 
                                    onClick={() => openEditEmailModal(phone)}>
                                    <FontAwesomeIcon icon={faEnvelope} />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Price Edit Modal */}
            {showPriceModal && (
                <div className="modal show custom-modal" style={{ display: 'block' }}>
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
                                    <button type="submit" className="btn btn-primary custom-btn">
                                        Update Price
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* PayPal Email Edit Modal */}
            {showEmailModal && (
                <div className="modal show custom-modal" style={{ display: 'block' }}>
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
                                    <button type="submit" className="btn btn-primary custom-btn">
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
