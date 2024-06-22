import { useNavigate } from 'react-router-dom';
import { Context } from '../store/appContext';
import '../styles/App.css';
import React, { useContext } from "react";
import PhoneCard from '../components/phonecard';
const App = () => {
  const { store, actions } = useContext(Context);
  const navigate = useNavigate()

  return (
    <div className='mainpage'>
      <div className="App">
        <button onClick={()=>navigate("/login")}>Route to login</button>
        <PhoneCard phones={store.phones} />
      </div>
    </div>
  );
}

export default App;
