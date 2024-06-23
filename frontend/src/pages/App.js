import { useNavigate } from 'react-router-dom';
import { Context } from '../store/appContext';
import '../styles/App.css';
import React, { useContext } from "react";
import PhoneCard from '../components/phonecard';

const App = () => {
  const { store } = useContext(Context);
  const navigate = useNavigate();

  return (
    <div className='mainpage'>
      <div className="App">
        {store.phones ? (
          <PhoneCard phones={store.phones} />
        ) : (
          <div>No phones available at the moment.</div>
        )}
      </div>
    </div>
  );
}

export default App;
