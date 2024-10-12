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
    sort: ''
  });
  const [loading, setLoading] = useState(true); // Loading state

  const navigate = useNavigate();

  useEffect(() => {
    const fetchFavorite = async () => {
      setLoading(true); // Set loading true when data fetching starts
      if (store.token) {
        await actions.getFavorite(store.activeuserid);
      }
      setLoading(false); // Set loading false when data fetching is complete
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
    <div className="app-container">
      <div className="filter-sidebar">
        <Filter selectedFilters={selectedFilters} setSelectedFilters={setSelectedFilters} onFilter={handleFilterAction} />
      </div>

      <div className="phone-list-container">
        {loading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
          </div>
        ) : store.phones ? (
          <PhoneCard phones={store.phones} favorites={store.allfavorites} />
        ) : (
          <div className="no-phones-message">No phones available at the moment.</div>
        )}
      </div>
    </div>
  );
};

export default App;
