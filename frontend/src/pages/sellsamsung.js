import React, { useContext, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Context } from '../store/appContext';
import { useNavigate } from 'react-router-dom';

const phoneData = {
  // Samsung Galaxy S Series
  'Samsung Galaxy S21': {
    colors: ['Phantom Gray', 'Phantom White', 'Phantom Violet', 'Phantom Pink'],
    storage: ['128GB', '256GB'],
    modelNumbers: ['SM-G991B', 'SM-G991U', 'SM-G991W']
  },
  'Samsung Galaxy S21+': {
    colors: ['Phantom Black', 'Phantom Silver', 'Phantom Violet'],
    storage: ['128GB', '256GB'],
    modelNumbers: ['SM-G996B', 'SM-G996U', 'SM-G996W']
  },
  'Samsung Galaxy S21 Ultra': {
    colors: ['Phantom Black', 'Phantom Silver'],
    storage: ['128GB', '256GB', '512GB'],
    modelNumbers: ['SM-G998B', 'SM-G998U', 'SM-G998W']
  },
  'Samsung Galaxy S20': {
    colors: ['Cosmic Gray', 'Cloud Blue', 'Cloud Pink', 'Cloud White'],
    storage: ['128GB', '256GB'],
    modelNumbers: ['SM-G980F', 'SM-G980U', 'SM-G980W']
  },
  'Samsung Galaxy S20+': {
    colors: ['Cosmic Black', 'Cosmic Gray', 'Cloud Blue', 'Aura Red'],
    storage: ['128GB', '512GB'],
    modelNumbers: ['SM-G985F', 'SM-G985U', 'SM-G985W']
  },
  'Samsung Galaxy S20 Ultra': {
    colors: ['Cosmic Black', 'Cosmic Gray'],
    storage: ['128GB', '512GB'],
    modelNumbers: ['SM-G988B', 'SM-G988U', 'SM-G988W']
  },
  'Samsung Galaxy S10': {
    colors: ['Prism White', 'Prism Black', 'Prism Green', 'Prism Blue', 'Canary Yellow', 'Flamingo Pink'],
    storage: ['128GB', '512GB'],
    modelNumbers: ['SM-G973F', 'SM-G973U', 'SM-G973W']
  },
  'Samsung Galaxy S10+': {
    colors: ['Prism White', 'Prism Black', 'Prism Green', 'Prism Blue', 'Ceramic Black', 'Ceramic White'],
    storage: ['128GB', '512GB', '1TB'],
    modelNumbers: ['SM-G975F', 'SM-G975U', 'SM-G975W']
  },
  // Samsung Galaxy Note Series
  'Samsung Galaxy Note 20': {
    colors: ['Mystic Bronze', 'Mystic Green', 'Mystic Gray'],
    storage: ['128GB', '256GB'],
    modelNumbers: ['SM-N980F', 'SM-N980U', 'SM-N980W']
  },
  'Samsung Galaxy Note 20 Ultra': {
    colors: ['Mystic Bronze', 'Mystic Black', 'Mystic White'],
    storage: ['128GB', '256GB', '512GB'],
    modelNumbers: ['SM-N985F', 'SM-N985U', 'SM-N985W']
  },
  'Samsung Galaxy Note 10': {
    colors: ['Aura Glow', 'Aura White', 'Aura Black', 'Aura Pink', 'Aura Red'],
    storage: ['256GB'],
    modelNumbers: ['SM-N970F', 'SM-N970U', 'SM-N970W']
  },
  'Samsung Galaxy Note 10+': {
    colors: ['Aura Glow', 'Aura White', 'Aura Black', 'Aura Blue'],
    storage: ['256GB', '512GB'],
    modelNumbers: ['SM-N975F', 'SM-N975U', 'SM-N975W']
  },
  // Samsung Galaxy A Series
  'Samsung Galaxy A52': {
    colors: ['Awesome Black', 'Awesome White', 'Awesome Blue', 'Awesome Violet'],
    storage: ['128GB', '256GB'],
    modelNumbers: ['SM-A525F', 'SM-A525M']
  },
  'Samsung Galaxy A72': {
    colors: ['Awesome Black', 'Awesome White', 'Awesome Blue', 'Awesome Violet'],
    storage: ['128GB', '256GB'],
    modelNumbers: ['SM-A725F', 'SM-A725M']
  },
  'Samsung Galaxy A51': {
    colors: ['Prism Crush Black', 'Prism Crush White', 'Prism Crush Blue', 'Prism Crush Pink'],
    storage: ['64GB', '128GB'],
    modelNumbers: ['SM-A515F', 'SM-A515U']
  },
  'Samsung Galaxy A71': {
    colors: ['Prism Crush Black', 'Prism Crush Silver', 'Prism Crush Blue', 'Prism Crush Pink'],
    storage: ['128GB'],
    modelNumbers: ['SM-A715F', 'SM-A715U']
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
  'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'
];

const SellSamsung = () => {
  const navigate=useNavigate()
  const {store,actions}=useContext(Context)
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
          <label htmlFor="condition" className="form-label" >Condition</label>
          <select id="condition" className="form-select" value={condition} onChange={(e) => setCondition(e.target.value)}>
            <option value="">Select Condition</option>
            <option value="fair">Fair</option>
            <option value="good">Good</option>
            <option value="mint">Mint</option>
          </select>
        </div>

        <div className="mb-3">
          <label htmlFor="seller" className="form-label" >Seller</label>
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
          <label htmlFor="location" className="form-label" >Location</label>
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

export default SellSamsung;
