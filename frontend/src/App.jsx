// frontend/src/App.jsx

import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './pages/Login';
import Sorteio from './pages/Sorteio'; // Importe o novo componente

function App() {
  return (
    <Router>
      <div className="bg-gray-900 text-white min-h-screen font-sans">
        <Routes>
          <Route path="/" element={<Login />} />
          {/* Rota única para o sorteio que lida com ambos os papéis */}
          <Route path="/sorteio/:id_sorteio" element={<Sorteio />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;