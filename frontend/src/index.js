import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './pages/App';
import injectContext from './store/appContext'; // Import injectContext

const root = ReactDOM.createRoot(document.getElementById('root'));
const AppWithStore = injectContext(App); // Use injectContext to wrap App

root.render(
  <React.StrictMode>
    <AppWithStore /> {/* Render the wrapped App component */}
  </React.StrictMode>
);
