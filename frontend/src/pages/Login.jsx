// frontend/src/pages/Login.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [idSorteio, setIdSorteio] = useState('');
  const navigate = useNavigate();

  const handleEntrar = () => {
    if (idSorteio.trim()) {
      // Navega para a nova página unificada
      navigate(`/sorteio/${idSorteio}`);
    } else {
      alert("Por favor, insira um ID para o sorteio.");
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleEntrar();
    }
  };

  // ... o resto do seu código JSX continua igual ...
  return (
    
     <div className="flex items-center justify-center h-screen bg-gray-800">
      <div className="bg-gray-700 p-8 rounded-lg shadow-xl w-full max-w-md text-center">
        <h1 className="text-3xl font-bold mb-6 text-cyan-400">Roda da Sorte</h1>
        <p className="mb-6 text-gray-300">
          Insira um ID para criar um novo sorteio ou para se juntar a um existente.
        </p>
        <input
          id="input_ID_SORTEIO"
          type="text"
          value={idSorteio}
          onChange={(e) => setIdSorteio(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ex: sorteio-da-empresa-2025"
          className="w-full p-3 mb-4 bg-gray-800 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
        />
        <button
          id="btn_entrar"
          onClick={handleEntrar}
          className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 rounded-lg transition duration-300"
        >
          Entrar
        </button>
      </div>
    </div>
  );
}

export default Login;