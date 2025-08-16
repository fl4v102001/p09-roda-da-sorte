// ---------------------------------------------------
// Ficheiro 1: frontend/src/App.jsx
// Substitua todo o conteúdo do seu App.jsx por este:
// ---------------------------------------------------

import React from 'react';
import './index.css'; // Importa os estilos do Tailwind

import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './pages/Login';
import Sorteio from './pages/Sorteio';

function App() {
  return (
    <Router>
      <div className="bg-gray-900 text-white min-h-screen font-sans">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/sorteio/:id_sorteio" element={<Sorteio />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;