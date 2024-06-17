import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import layout from './layout';
import injectContext from './store/appContext'; // Import injectContext

const root = ReactDOM.createRoot(document.getElementById('root'));
const LayoutWithStore  = injectContext(layout); // Use injectContext to wrap App

root.render(
  <React.StrictMode>
    <LayoutWithStore  /> {/* Render the wrapped App component */}
  </React.StrictMode>
);
