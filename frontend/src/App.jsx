// frontend/src/App.jsx

import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './pages/Login';
import Config from './pages/Config';
import Realtime from './pages/Realtime';

function App() {
  return (
    <Router>
      <div className="bg-gray-900 text-white min-h-screen font-sans">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/config/:id_sorteio" element={<Config />} />
          <Route path="/realtime/:id_sorteio" element={<Realtime />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;