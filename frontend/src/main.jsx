// frontend/src/main.jsx

import React from 'react'; // Adicione esta linha
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <App />
);