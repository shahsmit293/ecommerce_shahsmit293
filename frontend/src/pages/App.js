// App.js
import React, { useContext, useState, useEffect } from 'react';
import { Context } from '../store/appContext';
import { useNavigate } from 'react-router-dom';
import PhoneCard from '../components/phonecard';
import Filter from '../components/filter';
import '../styles/App.css';

const App = () => {
  const { store, actions } = useContext(Context);
  const [selectedFilters, setSelectedFilters] = useState({
    phonetype: '',
    color: '',
    storage: '',
    model: '',
  });

  const navigate = useNavigate();

  useEffect(() => {
    const fetchFavorite = async () => {
      if (store.token) {
        await actions.getFavorite(store.activeuserid);
      }
    };

    fetchFavorite();
  }, [store.activeuserid]);

  // Function to handle the filter action and update URL
  const handleFilterAction = () => {
    const hasFilters = Object.values(selectedFilters).some((filter) => filter !== '');

    if (hasFilters) {
      const queryString = new URLSearchParams(selectedFilters).toString();
      navigate(`/filter?${queryString}`); // Push new history entry for filter state
    } else {
      navigate('/'); // Redirect to home page if no filters
    }
  };

  return (
    <div className='mainpage'>
      <Filter selectedFilters={selectedFilters} setSelectedFilters={setSelectedFilters} onFilter={handleFilterAction} />
      <div className="App">
        {store.phones ? (
          <PhoneCard phones={store.phones} favorites={store.allfavorites} />
        ) : (
          <div>No phones available at the moment.</div>
        )}
      </div>
    </div>
  );
};

export default App;
