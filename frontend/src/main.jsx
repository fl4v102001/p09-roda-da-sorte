// ---------------------------------------------------
// Ficheiro 2: frontend/src/main.jsx
// Verifique se o seu main.jsx está assim:
// ---------------------------------------------------

import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css'; // Importa os estilos do Tailwind
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <App />
);
