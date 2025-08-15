// frontend/src/pages/Login.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [idSorteio, setIdSorteio] = useState('');
  const navigate = useNavigate();

  const handleEntrar = () => {
    // Validação simples para garantir que o ID não está vazio
    if (idSorteio.trim()) {
      // O backend irá decidir se o usuário vai para /config ou /realtime.
      // Aqui, simplesmente tentamos conectar. A lógica de redirecionamento
      // será tratada nas próprias páginas de Config e Realtime.
      // Por simplicidade, assumimos que o primeiro a entrar cria e é redirecionado.
      // Uma implementação real faria uma chamada API para verificar se o ID existe.
      // Para este projeto, vamos simular o fluxo redirecionando diretamente.
      
      // Conectamos ao WebSocket para verificar.
      const ws = new WebSocket('ws://localhost:8080');
      
      ws.onopen = () => {
        // Envia o ID para o servidor para se "inscrever" na sala
        ws.send(JSON.stringify({
          type: 'JOIN_SORTEIO',
          id_sorteio: idSorteio,
        }));
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'ROLE_ASSIGNED') {
          if (data.payload.role === 'configurador') {
            navigate(`/config/${idSorteio}`);
          } else {
            navigate(`/realtime/${idSorteio}`);
          }
        }
        // Fechamos esta conexão temporária pois as páginas irão gerir as suas próprias conexões.
        ws.close(); 
      };
    } else {
      alert("Por favor, insira um ID para o sorteio.");
    }
  };

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