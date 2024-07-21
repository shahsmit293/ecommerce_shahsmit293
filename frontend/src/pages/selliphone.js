import React, { useContext, useRef, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Context } from '../store/appContext';
import { useNavigate } from 'react-router-dom';

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
  const {store,actions} = useContext(Context)
  const navigate = useNavigate()
  const [selectedPhone, setSelectedPhone] = useState('');
  const [color, setColor] = useState('');
  const [storage, setStorage] = useState('');
  const [modelNumber, setModelNumber] = useState('');
  const [carrier, setCarrier] = useState('');
  const [condition, setCondition] = useState('');
  const [seller, setSeller] = useState('');
  const [location, setLocation] = useState('');
  const [price,setPrice] = useState('')
  const [paypal_email,setPaypalemail] = useState('')
  const [first_name,setFirstname] = useState('')
  const [last_name,setLastname] = useState('')
  const [seller_contact_number,setSellercontactnumber] = useState('')
  const [IMEI,setIMEI] = useState('')
  const [images, setImages] = useState([]);
  const [error, setError] = useState('');

  const fileInputRef = useRef(null)

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
    setError('')
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

    // Disable file input if there are already 5 files uploaded
    if (images.length + validFiles.length >= 5) {
      fileInputRef.current.disabled = true;
    }

    if (invalidFiles.length > 0) {
      setError(`Invalid file types: ${invalidFiles.join(', ')}`);
    } else {
      setError('');
    }

    setImages((prevImages) => [...prevImages, ...validFiles]);
    e.target.value = null; // Clear the file input value
  };

  const handleRemoveImage = (index) => {
    setImages((prevImages) => {
      const updatedImages = prevImages.filter((_, i) => i !== index);
      // Enable file input when removing images if total is less than 5
      if (updatedImages.length < 5) {
        fileInputRef.current.disabled = false;
      }
      return updatedImages;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const phoneDetails = {
        price: price,
        phonetype: selectedPhone,
        color: color,
        storage: storage,
        carrier: carrier,
        model: modelNumber,
        condition: condition,
        seller: seller,
        location: location,
        IMEI: IMEI,
        user_email: store.user.email,
        paypal_email: paypal_email,
        first_name: first_name,
        last_name: last_name,
        seller_contact_number: seller_contact_number
    };

    try {
        const result = await actions.addPhone(phoneDetails, images);
        console.log("Phone added:", result);
    } catch (error) {
        console.error("Error adding phone:", error);
    }
};

  const renderPhoneCards = () => {
    return Object.keys(phoneData).map(phone => (
      <div key={phone} className="card mb-2" onClick={() => handlePhoneSelection(phone)} style={{ cursor: 'pointer' }}>
        <div className="card-body">
          <h5 className="card-title">{phone}</h5>
        </div>
      </div>
    ));
  };

  const renderForm = () => {
    const phone = phoneData[selectedPhone];
    if (!selectedPhone) {

      return <div>Please select a phone to view details.</div>;

    }
    return (
      <form onSubmit={handleSubmit}>
        <h3>{selectedPhone}</h3>
        <div className="mb-3">
          <label htmlFor="color" className="form-label">Color</label>
          <select id="color" className="form-select" value={color} onChange={(e) => setColor(e.target.value)}>
            <option value="">Select Color</option>
            {phone.colors.map(color => <option key={color} value={color}>{color}</option>)}
          </select>
        </div>

        <div className="mb-3">
          <label htmlFor="storage" className="form-label">Storage</label>
          <select id="storage" className="form-select" value={storage} onChange={(e) => setStorage(e.target.value)}>
            <option value="">Select Storage</option>
            {phone.storage.map(storage => <option key={storage} value={storage}>{storage}</option>)}
          </select>
        </div>

        <div className="mb-3">
          <label htmlFor="modelNumber" className="form-label">Model Number</label>
          <select id="modelNumber" className="form-select" value={modelNumber} onChange={(e) => setModelNumber(e.target.value)}>
            <option value="">Select Model Number</option>
            {phone.modelNumbers.map(number => <option key={number} value={number}>{number}</option>)}
          </select>
        </div>

        <div className="mb-3">
          <label htmlFor="carrier" className="form-label">Carrier</label>
          <select id="carrier" className="form-select" value={carrier} onChange={(e) => setCarrier(e.target.value)}>
            <option value="">Select Carrier</option>
            <option value="unlocked">Unlocked</option>
            <option value="at&t">AT&T</option>
            <option value="tmobile">T-Mobile</option>
          </select>
        </div>

        <div className="mb-3">
          <label htmlFor="condition" className="form-label">Condition</label>
          <select id="condition" className="form-select" value={condition} onChange={(e) => setCondition(e.target.value)}>
            <option value="">Select Condition</option>
            <option value="fair">Fair</option>
            <option value="good">Good</option>
            <option value="mint">Mint</option>
          </select>
        </div>

        <div className="mb-3">
          <label htmlFor="seller" className="form-label">Seller</label>
          <select id="seller" className="form-select" value ={seller} onChange={(e) => setSeller(e.target.value)}>
            <option value="">Select Seller</option>
            <option value="Self">Self</option>
            <option value="Enterprise">Enterprise</option>
          </select>
        </div>

        <div className="mb-3">
          <label htmlFor="price" className="form-label">Price</label>
          <input type="number" id="price" className="form-control"  value={price} onChange={(e)=>setPrice(e.target.value)}/>
        </div>

        <div className="mb-3">
          <label htmlFor="IMEI" className="form-label">IMEI number</label>
          <input type="number" id="IMEI" className="form-control" value={IMEI} onChange={(e)=>setIMEI(e.target.value)} />
        </div>

        <div className="mb-3">
          <label className="form-label">Your PaypalEmail</label>
          <input type="email" id="paypal_email" className="form-control" value={paypal_email} onChange={(e)=>setPaypalemail(e.target.value)} />
        </div>

        <div className="mb-3">
          <label className="form-label">Your FirstName</label>
          <input type="text" id="first_name" className="form-control" value={first_name} onChange={(e)=>setFirstname(e.target.value)} />
        </div>

        <div className="mb-3">
          <label className="form-label">Your LastName</label>
          <input type="text" id="last_name" className="form-control" value={last_name} onChange={(e)=>setLastname(e.target.value)} />
        </div>

        <div className="mb-3">
          <label className="form-label">Your ContactNumber</label>
          <input type="number" id="seller_contact_number" className="form-control" value={seller_contact_number} onChange={(e)=>setSellercontactnumber(e.target.value)} />
        </div>

        <div className="mb-3">
          <label htmlFor="location" className="form-label">Location</label>
          <select id="location" className="form-select" value={location} onChange={(e) => setLocation(e.target.value)}>
            <option value="">Select Location</option>
            {states.map(state => <option key={state} value={state}>{state}</option>)}
          </select>
        </div>

        <div className="mb-3">
          <label htmlFor="images" className="form-label">Upload Images</label>
          <input
            type="file"
            id="images"
            className="form-control"
            multiple
            accept=".jpeg,.jpg,.png"
            onChange={handleFileChange}
            disabled={images.length >= 5}
            ref={fileInputRef}  // Attach the ref to the input element
          />
          <p>Only 5 Images Allow To Upload</p>
          {error && <div className="alert alert-danger mt-2">{error}</div>}
          <div className="mt-2">
            {images.map((image, index) => (
              <div key={index} className="d-flex justify-content-between align-items-center">
                <span>{image.name}</span>
                <button type="button" className="btn btn-danger btn-sm" onClick={() => handleRemoveImage(index)}>Delete</button>
              </div>
            ))}
          </div>
        </div>

        <button type="submit" className="btn btn-primary">Sell Phone</button>
      </form>
    );
  };
  if (!store.token) {
    return <div>Error: Access token not found. Please log in to view this page.<button onClick={()=>navigate('/login')}>Login</button></div>;
  }
  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-3">
          {renderPhoneCards()}
        </div>
        <div className="col-9">
          {renderForm()}
        </div>
      </div>
    </div>
  );
};

export default SellIphone;
