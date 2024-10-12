import React, { useContext, useEffect } from 'react';
import '../styles/filter.css'
import { Context } from '../store/appContext';
const Filter = ({ selectedFilters, setSelectedFilters, onFilter }) => {
  const {store, actions} = useContext(Context)
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
  },
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
  },

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

  // Update selected filters based on URL query parameters when the component mounts
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setSelectedFilters({
      phonetype: params.get('phonetype') || '',
      color: params.get('color') || '',
      storage: params.get('storage') || '',
      model: params.get('model') || '',
      sort: params.get('sort') || ''
    });
  }, []);

  // Handle the reset of the filter
  const handleResetFilter = () => {
    setSelectedFilters({
      phonetype: '',
      color: '',
      storage: '',
      model: '',
      sort: ''
    });
    store.filteredPhones=[]
    window.history.pushState(null, '', '/');  // Push a state with no filters
  };

  return (
    <div className="filter-bar">
      <div className="filter-dropdown">
        <label htmlFor="phonetype">Phone Type:</label>
        <select
          id="phonetype"
          value={selectedFilters.phonetype}
          onChange={(e) => setSelectedFilters({ ...selectedFilters, phonetype: e.target.value })}
        >
          <option value="">All Phone Type</option>
          {Object.keys(phoneData).map((phoneType) => (
            <option key={phoneType} value={phoneType}>
              {phoneType}
            </option>
          ))}
        </select>
      </div>
      {selectedFilters.phonetype && (
        <>
          <div className="filter-dropdown">
            <label htmlFor="sort">Sort By Price:</label>
            <select id="sort" value={selectedFilters.sort} onChange={(e) => setSelectedFilters({ ...selectedFilters, sort: e.target.value })}>
              <option value="">None</option>
              <option value="asc">Lowest to Highest</option>
              <option value="desc">Highest to Lowest</option>
            </select>
          </div>

          <div className="filter-dropdown">
            <label htmlFor="color">Color:</label>
            <select
              id="color"
              value={selectedFilters.color}
              onChange={(e) => setSelectedFilters({ ...selectedFilters, color: e.target.value })}
            >
              <option value="">All Color</option>
              {phoneData[selectedFilters.phonetype].colors.map((color) => (
                <option key={color} value={color}>
                  {color}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-dropdown">
            <label htmlFor="storage">Storage:</label>
            <select
              id="storage"
              value={selectedFilters.storage}
              onChange={(e) => setSelectedFilters({ ...selectedFilters, storage: e.target.value })}
            >
              <option value="">All Storage</option>
              {phoneData[selectedFilters.phonetype].storage.map((storage) => (
                <option key={storage} value={storage}>
                  {storage}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-dropdown">
            <label htmlFor="model">Model Number:</label>
            <select
              id="model"
              value={selectedFilters.model}
              onChange={(e) => setSelectedFilters({ ...selectedFilters, model: e.target.value })}
            >
              <option value="">All Model</option>
              {phoneData[selectedFilters.phonetype].modelNumbers.map((model) => (
                <option key={model} value={model}>
                  {model}
                </option>
              ))}
            </select>
          </div>
        </>
      )}
      <div className="filter-actions">
        <button className="select-button" onClick={onFilter}>Apply Filter</button>
        <button className="reset-button" onClick={handleResetFilter}>Reset Filter</button>
      </div>
    </div>
  );
};

export default Filter;



