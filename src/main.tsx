import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { db } from './services/database';

// Initialize database
db.init().then(() => {
  console.log('GreenBlu.ai database ready');
}).catch((error) => {
  console.error('Failed to initialize database:', error);
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
