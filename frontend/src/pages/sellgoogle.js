import React, { useContext, useState , useRef} from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Context } from '../store/appContext';
import { useNavigate } from 'react-router-dom';
import '../styles/selliphone.css'

const phoneData = {
  'Google Pixel 6 Pro': {
    colors: ['Cloudy White', 'Sorta Sunny', 'Stormy Black'],
    storage: ['128GB', '256GB', '512GB'],
    modelNumbers: ['GA03149-US', 'GA03148-US', 'GA03150-US']
  },
  'Google Pixel 6': {
    colors: ['Kinda Coral', 'Sorta Seafoam', 'Stormy Black'],
    storage: ['128GB', '256GB'],
    modelNumbers: ['GA02900-US', 'GA02901-US', 'GA02905-US']
  },
  'Google Pixel 5': {
    colors: ['Just Black', 'Sorta Sage'],
    storage: ['128GB'],
    modelNumbers: ['GD1YQ', 'GTT9Q']
  },
  'Google Pixel 4a 5G': {
    colors: ['Just Black', 'Clearly White'],
    storage: ['128GB'],
    modelNumbers: ['G025E', 'G6QU3']
  },
  'Google Pixel 4a': {
    colors: ['Just Black', 'Barely Blue'],
    storage: ['128GB'],
    modelNumbers: ['G025J', 'G025N']
  },
  'Google Pixel 4 XL': {
    colors: ['Just Black', 'Clearly White', 'Oh So Orange'],
    storage: ['64GB', '128GB'],
    modelNumbers: ['G020J', 'G020P', 'G020I']
  },
  'Google Pixel 4': {
    colors: ['Just Black', 'Clearly White', 'Oh So Orange'],
    storage: ['64GB', '128GB'],
    modelNumbers: ['G020N', 'G020Q']
  },
  'Google Pixel 3a XL': {
    colors: ['Just Black', 'Clearly White', 'Purple-ish'],
    storage: ['64GB'],
    modelNumbers: ['G020C', 'G020F']
  },
  'Google Pixel 3a': {
    colors: ['Just Black', 'Clearly White', 'Purple-ish'],
    storage: ['64GB'],
    modelNumbers: ['G020E', 'G020D']
  },
  'Google Pixel 3 XL': {
    colors: ['Just Black', 'Clearly White', 'Not Pink'],
    storage: ['64GB', '128GB'],
    modelNumbers: ['G013C', 'G013D', 'G013A']
  },
  'Google Pixel 3': {
    colors: ['Just Black', 'Clearly White', 'Not Pink'],
    storage: ['64GB', '128GB'],
    modelNumbers: ['G013A', 'G013E', 'G013B']
  }
};

const states = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut',
  'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois',
  'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland',
  'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana',
  'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York',
  'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania',
  'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah',
  'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'
];

const SellGoogle = () => {
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

  const isValidEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validateForm = () => {
    let errors = {};
    if (!first_name) errors.first_name = 'First name is required';
    if (!last_name) errors.last_name = 'Last name is required';
    if (!seller_contact_number) {
      errors.seller_contact_number = 'Contact number is required';
    } else if (seller_contact_number <= 0) {
      errors.seller_contact_number = 'Contact number must be positive';
    }
    if (!location) errors.location = 'Location is required';
    if (!IMEI) {
      errors.IMEI = 'IMEI number is required';
    } else if (IMEI <= 0) {
      errors.IMEI = 'IMEI number must be positive';
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
      errors.price = 'Price must be positive';
    }
    if (images.length === 0) errors.images = 'At least one image is required';

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (setter, field) => (e) => {
    setter(e.target.value);
    setValidationErrors((prevErrors) => ({ ...prevErrors, [field]: '' }));
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
        <div className="phonetitle">
          <h3>{selectedPhone}</h3>
        </div>

        <div className="form-item">
          <label className="form-label">Your First Name</label>
          <input
            type="text"
            className="form-control"
            value={first_name}
            onChange={handleInputChange(setFirstname, 'first_name')}
          />
          {validationErrors.first_name && <div className="text-danger">{validationErrors.first_name}</div>}
        </div>

        <div className="form-item">
          <label className="form-label">Your Last Name</label>
          <input
            type="text"
            className="form-control"
            value={last_name}
            onChange={handleInputChange(setLastname, 'last_name')}
          />
          {validationErrors.last_name && <div className="text-danger">{validationErrors.last_name}</div>}
        </div>

        <div className="form-item">
          <label className="form-label">Your Contact Number</label>
          <input
            type="number"
            className="form-control"
            value={seller_contact_number}
            onChange={handleInputChange(setSellercontactnumber, 'seller_contact_number')}
          />
          {validationErrors.seller_contact_number && <div className="text-danger">{validationErrors.seller_contact_number}</div>}
        </div>

        <div className="form-item">
          <label htmlFor="location" className="form-label">Location</label>
          <select className="form-select" value={location} onChange={handleInputChange(setLocation, 'location')}>
            <option value="">Select Location</option>
            {states.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
          {validationErrors.location && <div className="text-danger">{validationErrors.location}</div>}
        </div>

        <div className="form-item">
          <label htmlFor="IMEI" className="form-label">IMEI Number</label>
          <input
            type="number"
            className="form-control"
            value={IMEI}
            onChange={handleInputChange(setIMEI, 'IMEI')}
          />
          {validationErrors.IMEI && <div className="text-danger">{validationErrors.IMEI}</div>}
        </div>

        <div className="form-item">
          <label className="form-label">Your PayPal Email</label>
          <input
            type="email"
            className="form-control"
            value={paypal_email}
            onChange={handleInputChange(setPaypalemail, 'paypal_email')}
          />
          {validationErrors.paypal_email && <div className="text-danger">{validationErrors.paypal_email}</div>}
        </div>

        <div className="form-item">
          <label htmlFor="color" className="form-label">Color</label>
          <select className="form-select" value={color} onChange={handleInputChange(setColor, 'color')}>
            <option value="">Select Color</option>
            {phone.colors.map((color) => (
              <option key={color} value={color}>
                {color}
              </option>
            ))}
          </select>
          {validationErrors.color && <div className="text-danger">{validationErrors.color}</div>}
        </div>

        <div className="form-item">
          <label htmlFor="storage" className="form-label">Storage</label>
          <select className="form-select" value={storage} onChange={handleInputChange(setStorage, 'storage')}>
            <option value="">Select Storage</option>
            {phone.storage.map((storage) => (
              <option key={storage} value={storage}>
                {storage}
              </option>
            ))}
          </select>
          {validationErrors.storage && <div className="text-danger">{validationErrors.storage}</div>}
        </div>

        <div className="form-item">
          <label htmlFor="modelNumber" className="form-label">Model Number</label>
          <select className="form-select" value={modelNumber} onChange={handleInputChange(setModelNumber, 'modelNumber')}>
            <option value="">Select Model Number</option>
            {phone.modelNumbers.map((number) => (
              <option key={number} value={number}>
                {number}
              </option>
            ))}
          </select>
          {validationErrors.modelNumber && <div className="text-danger">{validationErrors.modelNumber}</div>}
        </div>

        <div className="form-item">
          <label htmlFor="carrier" className="form-label">Carrier</label>
          <select className="form-select" value={carrier} onChange={handleInputChange(setCarrier, 'carrier')}>
            <option value="">Select Carrier</option>
            <option value="unlocked">Unlocked</option>
            <option value="at&t">AT&T</option>
            <option value="tmobile">T-Mobile</option>
          </select>
          {validationErrors.carrier && <div className="text-danger">{validationErrors.carrier}</div>}
        </div>

        <div className="form-item">
          <label htmlFor="condition" className="form-label">Condition</label>
          <select className="form-select" value={condition} onChange={handleInputChange(setCondition, 'condition')}>
            <option value="">Select Condition</option>
            <option value="fair">Fair</option>
            <option value="good">Good</option>
            <option value="mint">Mint</option>
          </select>
          {validationErrors.condition && <div className="text-danger">{validationErrors.condition}</div>}
        </div>

        <div className="form-item">
          <label htmlFor="seller" className="form-label">Seller</label>
          <select className="form-select" value={seller} onChange={handleInputChange(setSeller, 'seller')}>
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
            onChange={handleInputChange(setPrice, 'price')}
          />
          {validationErrors.price && <div className="text-danger">{validationErrors.price}</div>}
        </div>

        <div className="form-item">
          <label htmlFor="images" className="form-label">Upload Images</label>
          <input
            type="file"
            className="form-control"
            multiple
            accept=".jpeg,.jpg,.png"
            onChange={handleFileChange}
            disabled={images.length >= 5}
            ref={fileInputRef}
          />
          {validationErrors.images && <div className="text-danger">{validationErrors.images}</div>}
          {images.length > 0 && (
            <div className="mt-2">
              {images.map((image, index) => (
                <div key={index} className="d-flex justify-content-between align-items-center">
                  <span>{image.name}</span>
                  <button type="button" className="btn btn-danger btn-sm" onClick={() => handleRemoveImage(index)}>
                    Delete
                  </button>
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

export default SellGoogle;