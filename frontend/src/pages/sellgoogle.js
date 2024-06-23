import React, { useContext, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Context } from '../store/appContext';
import { useNavigate } from 'react-router-dom';

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
  const navigate=useNavigate()
  const {store}=useContext(Context)
  const [selectedPhone, setSelectedPhone] = useState(null);
  const [color, setColor] = useState('');
  const [storage, setStorage] = useState('');
  const [modelNumber, setModelNumber] = useState('');
  const [carrier, setCarrier] = useState('');
  const [condition, setCondition] = useState('');
  const [seller, setSeller] = useState('');
  const [location, setLocation] = useState('');
  const [price,setPrice] = useState('')
  const [IMEI,setIMEI] = useState('')

  const handlePhoneClick = (phone) => {
    setSelectedPhone(phone);
    setColor('');
    setStorage('');
    setModelNumber('');
    setCarrier('');
    setCondition('');
    setSeller('');
    setLocation('');
    setPrice('');
    setIMEI('')
  };

  const renderPhoneCards = () => {
    return Object.keys(phoneData).map(phone => (
      <div key={phone} className="card mb-3" onClick={() => handlePhoneClick(phone)} style={{ cursor: 'pointer' }}>
        <div className="card-body">
          <h5 className="card-title">{phone}</h5>
        </div>
      </div>
    ));
  };

  const renderForm = () => {
    if (!selectedPhone) {
      return <div>Please select a phone to view details.</div>;
    }

    const phone = phoneData[selectedPhone];

    return (
      <form>
        <h3>{selectedPhone}</h3>
        <div className="mb-3">
          <label htmlFor="color" className="form-label">Color</label>
          <select id="color" className="form-select" value={color} onChange={(e) => setColor(e.target.value)}>
            <option value="">Select Color</option>
            {phone.colors.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="mb-3">
          <label htmlFor="storage" className="form-label">Storage</label>
          <select id="storage" className="form-select" value={storage} onChange={(e) => setStorage(e.target.value)}>
            <option value="">Select Storage</option>
            {phone.storage.map(s => <option key={s} value={s}>{s}</option>)}
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
          <input type="number" id="price" className="form-control" value={price} onChange={(e)=>setPrice(e.target.value)} />
        </div>

        <div className="mb-3">
          <label htmlFor="IMEI" className="form-label">IMEI number</label>
          <input type="number" id="IMEI" className="form-control" value={IMEI} onChange={(e)=>setIMEI(e.target.value)} />
        </div>

        <div className="mb-3">
          <label htmlFor="location" className="form-label">Location</label>
          <select id="location" className="form-select" value={location} onChange={(e) => setLocation(e.target.value)}>
            <option value="">Select Location</option>
            {states.map(state => <option key={state} value={state}>{state}</option>)}
          </select>
        </div>
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

export default SellGoogle;
