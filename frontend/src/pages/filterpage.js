// FilterPage.js
import React, { useContext, useState, useEffect } from 'react';
import { Context } from '../store/appContext';
import PhoneCard from '../components/phonecard';
import Filter from '../components/filter';
import { useNavigate } from 'react-router-dom';
import '../styles/App.css';

const FilterPage = () => {
  const { store, actions } = useContext(Context);
  const navigate = useNavigate();

  // Function to extract query parameters
  const getQueryParams = () => {
    const params = new URLSearchParams(window.location.search);
    return {
      phonetype: params.get('phonetype') || '',
      color: params.get('color') || '',
      storage: params.get('storage') || '',
      model: params.get('model') || '',
    };
  };

  const [selectedFilters, setSelectedFilters] = useState(getQueryParams());

  useEffect(() => {
    const fetchFavorite = async () => {
      if (store.token) {
        await actions.getFavorite(store.activeuserid);
      }
    };

    fetchFavorite();

    // Fetch the filtered phones whenever the selectedFilters state changes
    actions.fetchFilteredPhones(selectedFilters);
  }, [store.activeuserid, selectedFilters]);

  // Handle browser back and forward button events
  useEffect(() => {
    const handlePopState = () => {
      setSelectedFilters(getQueryParams()); // Update filters on popstate event
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Function to update the query parameters in the URL
  const updateSearchParams = (filters) => {
    const queryString = new URLSearchParams(filters).toString();
    const hasFilters = Object.values(filters).some((filter) => filter !== '');

    if (hasFilters) {
      window.history.pushState(null, '', `/filter?${queryString}`); // Push state for new filter entry
    } else {
      navigate('/'); // Redirect to home page if no filters
    }
  };

  return (
    <div className='mainpage'>
      <Filter
        selectedFilters={selectedFilters}
        setSelectedFilters={(filters) => {
          setSelectedFilters(filters);
          updateSearchParams(filters); // Update URL when filters change
        }}
        onFilter={() => actions.fetchFilteredPhones(selectedFilters)}
      />
      <div className="App">
        {store.filteredPhones ? (
          <PhoneCard phones={store.filteredPhones} favorites={store.allfavorites} />
        ) : (
          <div>No phones available at the moment.</div>
        )}
      </div>
    </div>
  );
};

export default FilterPage;
