import React, { useContext, useRef, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Context } from '../store/appContext';
import { useNavigate } from 'react-router-dom';
import '../styles/selliphone.css'

const phoneData = {
  'iPhone 11': {
    colors: ['Black', 'Green', 'Yellow', 'Purple', '(PRODUCT)RED', 'White'],
    storage: ['64GB', '128GB', '256GB'],
    modelNumbers: ['A2111', 'A2221', 'A2223']
  },
  'iPhone 11 Pro': {
    colors: ['Gold', 'Space Gray', 'Silver', 'Midnight Green'],
    storage: ['64GB', '256GB', '512GB'],
    modelNumbers: ['A2160', 'A2215', 'A2217']
  },
  'iPhone 11 Pro Max': {
    colors: ['Gold', 'Space Gray', 'Silver', 'Midnight Green'],
    storage: ['64GB', '256GB', '512GB'],
    modelNumbers: ['A2161', 'A2218', 'A2220']
  },
  'iPhone 12': {
    colors: ['Black', 'White', '(PRODUCT)RED', 'Green', 'Blue', 'Purple'],
    storage: ['64GB', '128GB', '256GB'],
    modelNumbers: ['A2172', 'A2402', 'A2403', 'A2404']
  },
  'iPhone 12 Mini': {
    colors: ['Black', 'White', '(PRODUCT)RED', 'Green', 'Blue', 'Purple'],
    storage: ['64GB', '128GB', '256GB'],
    modelNumbers: ['A2176', 'A2398', 'A2400', 'A2399']
  },
  'iPhone 12 Pro': {
    colors: ['Silver', 'Graphite', 'Gold', 'Pacific Blue'],
    storage: ['128GB', '256GB', '512GB'],
    modelNumbers: ['A2341', 'A2406', 'A2407', 'A2408']
  },
  'iPhone 12 Pro Max': {
    colors: ['Silver', 'Graphite', 'Gold', 'Pacific Blue'],
    storage: ['128GB', '256GB', '512GB'],
    modelNumbers: ['A2342', 'A2410', 'A2411', 'A2412']
  },
  'iPhone 13': {
    colors: ['Pink', 'Blue', 'Midnight', 'Starlight', '(PRODUCT)RED', 'Green'],
    storage: ['128GB', '256GB', '512GB'],
    modelNumbers: ['A2482', 'A2631', 'A2634', 'A2635', 'A2633']
  },
  'iPhone 13 Mini': {
    colors: ['Pink', 'Blue', 'Midnight', 'Starlight', '(PRODUCT)RED', 'Green'],
    storage: ['128GB', '256GB', '512GB'],
    modelNumbers: ['A2481', 'A2626', 'A2629', 'A2630', 'A2628']
  },
  'iPhone 13 Pro': {
    colors: ['Graphite', 'Gold', 'Silver', 'Sierra Blue', 'Alpine Green'],
    storage: ['128GB', '256GB', '512GB', '1TB'],
    modelNumbers: ['A2483', 'A2636', 'A2638', 'A2639', 'A2640']
  },
  'iPhone 13 Pro Max': {
    colors: ['Graphite', 'Gold', 'Silver', 'Sierra Blue', 'Alpine Green'],
    storage: ['128GB', '256GB', '512GB', '1TB'],
    modelNumbers: ['A2484', 'A2641', 'A2643', 'A2644', 'A2645']
  },
  'iPhone 14': {
    colors: ['Midnight', 'Purple', 'Starlight', '(PRODUCT)RED', 'Blue', 'Yellow'],
    storage: ['128GB', '256GB', '512GB'],
    modelNumbers: ['A2649', 'A2881', 'A2882', 'A2883', 'A2884']
  },
  'iPhone 14 Plus': {
    colors: ['Midnight', 'Purple', 'Starlight', '(PRODUCT)RED', 'Blue', 'Yellow'],
    storage: ['128GB', '256GB', '512GB'],
    modelNumbers: ['A2632', 'A2885', 'A2886', 'A2887', 'A2888']
  },
  'iPhone 14 Pro': {
    colors: ['Space Black', 'Silver', 'Gold', 'Deep Purple'],
    storage: ['128GB', '256GB', '512GB', '1TB'],
    modelNumbers: ['A2650', 'A2889', 'A2890', 'A2891', 'A2892']
  },
  'iPhone 14 Pro Max': {
    colors: ['Space Black', 'Silver', 'Gold', 'Deep Purple'],
    storage: ['128GB', '256GB', '512GB', '1TB'],
    modelNumbers: ['A2651', 'A2893', 'A2894', 'A2895', 'A2896']
  },
  'iPhone 15': {
    colors: ['Black', 'White', '(PRODUCT)RED', 'Green', 'Blue', 'Purple'],
    storage: ['128GB', '256GB', '512GB'],
    modelNumbers: ['A3090', 'A3091', 'A3092', 'A3093']
  },
  'iPhone 15 Plus': {
    colors: ['Black', 'White', '(PRODUCT)RED', 'Green', 'Blue', 'Purple'],
    storage: ['128GB', '256GB', '512GB'],
    modelNumbers: ['A3094', 'A3095', 'A3096', 'A3097']
  },
  'iPhone 15 Pro': {
    colors: ['Graphite', 'Gold', 'Silver', 'Sierra Blue'],
    storage: ['128GB', '256GB', '512GB', '1TB'],
    modelNumbers: ['A3098', 'A3099', 'A3100', 'A3101']
  },
  'iPhone 15 Pro Max': {
    colors: ['Graphite', 'Gold', 'Silver', 'Sierra Blue'],
    storage: ['128GB', '256GB', '512GB', '1TB'],
    modelNumbers: ['A3102', 'A3103', 'A3104', 'A3105']
  }
};

const states = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado',
  'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois',
  'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland',
  'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana',
  'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York',
  'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania',
  'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah',
  'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming',
];

const SellIphone = () => {
  const { store, actions } = useContext(Context);
  const navigate = useNavigate();
  const [selectedPhone, setSelectedPhone] = useState('');
  const [color, setColor] = useState('');
  const [storage, setStorage] = useState('');
  const [modelNumber, setModelNumber] = useState('');
  const [carrier, setCarrier] = useState('');
  const [condition, setCondition] = useState('');
  const [seller, setSeller] = useState('');
  const [location, setLocation] = useState('');
  const [price, setPrice] = useState('');
  const [paypal_email, setPaypalemail] = useState('');
  const [first_name, setFirstname] = useState('');
  const [last_name, setLastname] = useState('');
  const [seller_contact_number, setSellercontactnumber] = useState('');
  const [IMEI, setIMEI] = useState('');
  const [images, setImages] = useState([]);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const fileInputRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  // Helper function to check if email is valid
  const isValidEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  // Validation logic
  const validateForm = () => {
    let errors = {};
    if (!first_name) errors.first_name = 'First name is required';
    if (!last_name) errors.last_name = 'Last name is required';
    if (!seller_contact_number) {
      errors.seller_contact_number = 'Contact number is required';
    } else if (seller_contact_number <= 0) {
      errors.seller_contact_number = 'Contact number must be a positive number';
    }
    if (!location) errors.location = 'Location is required';
    if (!IMEI) {
      errors.IMEI = 'IMEI number is required';
    } else if (IMEI <= 0) {
      errors.IMEI = 'IMEI number must be a positive number';
    }
    if (!paypal_email || !isValidEmail(paypal_email)) errors.paypal_email = 'Valid PayPal email is required';
    if (!color) errors.color = 'Color is required';
    if (!storage) errors.storage = 'Storage is required';
    if (!modelNumber) errors.modelNumber = 'Model number is required';
    if (!carrier) errors.carrier = 'Carrier is required';
    if (!condition) errors.condition = 'Condition is required';
    if (!seller) errors.seller = 'Seller type is required';
    if (!price) {
      errors.price = 'Price is required';
    } else if (price <= 0) {
      errors.price = 'Price must be a positive number';
    }
    if (images.length === 0) errors.images = 'At least one image is required';

    setValidationErrors(errors);
    return Object.keys(errors).length === 0; // Return true if no errors
  };

  // Dynamic error removal on valid input
  const handleInputChange = (setter, field, value) => {
    setter(value);
    if (field === 'seller_contact_number' || field === 'IMEI' || field === 'price') {
      // Clear the error if the number is positive
      if (value > 0) {
        setValidationErrors((prevErrors) => ({ ...prevErrors, [field]: '' }));
      }
    } else {
      setValidationErrors((prevErrors) => ({ ...prevErrors, [field]: '' })); // Clear specific field error when user types
    }
  };

  const handlePhoneSelection = (phone) => {
    setSelectedPhone(phone);
    setColor('');
    setStorage('');
    setModelNumber('');
    setCarrier('');
    setCondition('');
    setSeller('');
    setLocation('');
    setPrice('');
    setIMEI('');
    setImages([]);
    setValidationErrors({});
    setError('');
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = [];
    const invalidFiles = [];

    files.forEach((file) => {
      if (file.type === 'image/jpeg' || file.type === 'image/png') {
        validFiles.push(file);
      } else {
        invalidFiles.push(file.name);
      }
    });

    if (images.length + validFiles.length >= 5) {
      fileInputRef.current.disabled = true;
    }

    if (invalidFiles.length > 0) {
      setError(`Invalid file types: ${invalidFiles.join(', ')}`);
    } else {
      setError('');
    }

    setImages((prevImages) => [...prevImages, ...validFiles]);
    e.target.value = null;
  };

  const handleRemoveImage = (index) => {
    setImages((prevImages) => {
      const updatedImages = prevImages.filter((_, i) => i !== index);
      if (updatedImages.length < 5) {
        fileInputRef.current.disabled = false;
      }
      return updatedImages;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!validateForm()) return; // Stop form submission if validation fails
  
    const phoneDetails = {
      price,
      phonetype: selectedPhone,
      color,
      storage,
      carrier,
      model: modelNumber,
      condition,
      seller,
      location,
      IMEI,
      user_email: store.user.email,
      paypal_email,
      first_name,
      last_name,
      seller_contact_number,
    };
  
    setIsLoading(true); // Show spinner
  
    try {
      const result = await actions.addPhone(phoneDetails, images);
      console.log('Phone added:', result);
  
      setSuccessMessage('Phone successfully added!'); // Show success message
  
      // After 2 seconds, reload the page
      setTimeout(() => {
        setSuccessMessage(''); // Clear the message
        window.location.reload(); // Reload the page
      }, 2000);
  
    } catch (error) {
      console.error('Error adding phone:', error);
      setIsLoading(false); // Stop spinner if error occurs
    }
  };
  

  const renderPhoneCards = () => {
    return Object.keys(phoneData).map((phone) => (
      <button
        key={phone}
        className={`selltoggle-button ${selectedPhone === phone ? 'active' : ''}`}
        onClick={() => handlePhoneSelection(phone)}
      >
        {phone}
      </button>
    ));
  };

  const renderForm = () => {
    const phone = phoneData[selectedPhone];
    if (!selectedPhone) {
      return <div>Please select a phone to view details.</div>;
    }

    return (
      <form onSubmit={handleSubmit} className="grid-form">
        <div className="phonetitle"><h3>{selectedPhone}</h3></div>
        
        <div className="form-item">
          <label className="form-label">Your First Name</label>
          <input type="text" className="form-control" value={first_name} onChange={(e) => handleInputChange(setFirstname, 'first_name', e.target.value)} />
          {validationErrors.first_name && <div className="text-danger">{validationErrors.first_name}</div>}
        </div>

        <div className="form-item">
          <label className="form-label">Your Last Name</label>
          <input type="text" className="form-control" value={last_name} onChange={(e) => handleInputChange(setLastname, 'last_name', e.target.value)} />
          {validationErrors.last_name && <div className="text-danger">{validationErrors.last_name}</div>}
        </div>

        <div className="form-item">
          <label className="form-label">Your Contact Number</label>
          <input
            type="number"
            className="form-control"
            value={seller_contact_number}
            onChange={(e) => handleInputChange(setSellercontactnumber, 'seller_contact_number', e.target.value)}
          />
          {validationErrors.seller_contact_number && <div className="text-danger">{validationErrors.seller_contact_number}</div>}
        </div>

        <div className="form-item">
          <label htmlFor="location" className="form-label">Location</label>
          <select className="form-select" value={location} onChange={(e) => handleInputChange(setLocation, 'location', e.target.value)}>
            <option value="">Select Location</option>
            {states.map((state) => <option key={state} value={state}>{state}</option>)}
          </select>
          {validationErrors.location && <div className="text-danger">{validationErrors.location}</div>}
        </div>

        <div className="form-item">
          <label htmlFor="IMEI" className="form-label">IMEI number</label>
          <input
            type="number"
            className="form-control"
            value={IMEI}
            onChange={(e) => handleInputChange(setIMEI, 'IMEI', e.target.value)}
          />
          {validationErrors.IMEI && <div className="text-danger">{validationErrors.IMEI}</div>}
        </div>

        <div className="form-item">
          <label className="form-label">Your Paypal Email</label>
          <input type="email" className="form-control" value={paypal_email} onChange={(e) => handleInputChange(setPaypalemail, 'paypal_email', e.target.value)} />
          {validationErrors.paypal_email && <div className="text-danger">{validationErrors.paypal_email}</div>}
        </div>

        <div className="form-item">
          <label htmlFor="color" className="form-label">Color</label>
          <select className="form-select" value={color} onChange={(e) => handleInputChange(setColor, 'color', e.target.value)}>
            <option value="">Select Color</option>
            {phone.colors.map((color) => <option key={color} value={color}>{color}</option>)}
          </select>
          {validationErrors.color && <div className="text-danger">{validationErrors.color}</div>}
        </div>

        <div className="form-item">
          <label htmlFor="storage" className="form-label">Storage</label>
          <select className="form-select" value={storage} onChange={(e) => handleInputChange(setStorage, 'storage', e.target.value)}>
            <option value="">Select Storage</option>
            {phone.storage.map((storage) => <option key={storage} value={storage}>{storage}</option>)}
          </select>
          {validationErrors.storage && <div className="text-danger">{validationErrors.storage}</div>}
        </div>

        <div className="form-item">
          <label htmlFor="modelNumber" className="form-label">Model Number</label>
          <select className="form-select" value={modelNumber} onChange={(e) => handleInputChange(setModelNumber, 'modelNumber', e.target.value)}>
            <option value="">Select Model Number</option>
            {phone.modelNumbers.map((number) => <option key={number} value={number}>{number}</option>)}
          </select>
          {validationErrors.modelNumber && <div className="text-danger">{validationErrors.modelNumber}</div>}
        </div>

        <div className="form-item">
          <label htmlFor="carrier" className="form-label">Carrier</label>
          <select className="form-select" value={carrier} onChange={(e) => handleInputChange(setCarrier, 'carrier', e.target.value)}>
            <option value="">Select Carrier</option>
            <option value="unlocked">Unlocked</option>
            <option value="at&t">AT&T</option>
            <option value="tmobile">T-Mobile</option>
          </select>
          {validationErrors.carrier && <div className="text-danger">{validationErrors.carrier}</div>}
        </div>

        <div className="form-item">
          <label htmlFor="condition" className="form-label">Condition</label>
          <select className="form-select" value={condition} onChange={(e) => handleInputChange(setCondition, 'condition', e.target.value)}>
            <option value="">Select Condition</option>
            <option value="fair">Fair</option>
            <option value="good">Good</option>
            <option value="mint">Mint</option>
          </select>
          {validationErrors.condition && <div className="text-danger">{validationErrors.condition}</div>}
        </div>

        <div className="form-item">
          <label htmlFor="seller" className="form-label">Seller</label>
          <select className="form-select" value={seller} onChange={(e) => handleInputChange(setSeller, 'seller', e.target.value)}>
            <option value="">Select Seller</option>
            <option value="Self">Self</option>
            <option value="Enterprise">Enterprise</option>
          </select>
          {validationErrors.seller && <div className="text-danger">{validationErrors.seller}</div>}
        </div>

        <div className="form-item">
          <label htmlFor="price" className="form-label">Price</label>
          <input
            type="number"
            className="form-control"
            value={price}
            onChange={(e) => handleInputChange(setPrice, 'price', e.target.value)}
          />
          {validationErrors.price && <div className="text-danger">{validationErrors.price}</div>}
        </div>

        <div className="form-item">
          <label htmlFor="images" className="form-label">Upload Images</label>
          <input type="file" className="form-control" multiple accept=".jpeg,.jpg,.png" onChange={handleFileChange} disabled={images.length >= 5} ref={fileInputRef} />
          {validationErrors.images && <div className="text-danger">{validationErrors.images}</div>}
          {images.length > 0 && (
            <div className="mt-2">
              {images.map((image, index) => (
                <div key={index} className="d-flex justify-content-between align-items-center">
                  <span>{image.name}</span>
                  <button type="button" className="btn btn-danger btn-sm" onClick={() => handleRemoveImage(index)}>Delete</button>
                </div>
              ))}
            </div>
          )}
        </div>

        <button type="submit" className="btn btn-primary">Sell Phone</button>
      </form>
    );
  };

  if (!store.token) {
    return (
      <div>
        Please log in to view this page.
        <button onClick={() => navigate('/login')}>Login</button>
      </div>
    );
  }

  return (
    <div className="sellactivity-container">
    <div className="sellbutton-container">{renderPhoneCards()}</div>
    <div className="sellcomponent-container">
      {isLoading && (
        <div className="spinner-overlay">
          <div className="spinner"></div>
        </div>
      )}
      {successMessage && <div className="alert alert-success">{successMessage}</div>}
      {renderForm()}
    </div>
  </div>
  );
};

export default SellIphone;