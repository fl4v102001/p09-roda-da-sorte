// frontend/src/pages/Realtime.jsx

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import RodaSVG from '../components/RodaSVG';

function Realtime() {
  const { id_sorteio } = useParams();
  const navigate = useNavigate();
  const ws = useRef(null);

  // Estados para armazenar os dados recebidos do servidor
  const [config, setConfig] = useState({
    titulo: 'Aguardando configuração...',
    itens: [],
    tempoRotacao: 10,
    corFundo: '#1F2937', // bg-gray-800
    paleta: ['#ccc'],
  });
  const [mensagens, setMensagens] = useState([]);
  const [rotation, setRotation] = useState(0);
  const [vencedor, setVencedor] = useState(null);

  useEffect(() => {
    ws.current = new WebSocket('ws://localhost:8080');

    ws.current.onopen = () => {
      console.log('Conectado como Espectador!');
      ws.current.send(JSON.stringify({
        type: 'JOIN_SORTEIO',
        id_sorteio: id_sorteio,
      }));
    };

    // Lógica para receber mensagens do servidor
    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      switch (data.type) {
        case 'CONFIG_UPDATE':
          console.log('Configuração recebida:', data.payload);
          setConfig(data.payload);
          break;
        case 'MESSAGE_RECEIVE':
          console.log('Mensagem recebida:', data.payload);
          setMensagens(prev => [...prev, data.payload.texto]);
          break;
        case 'DRAW_RESULT':
          console.log('Resultado do sorteio recebido:', data.payload);
          setRotation(data.payload.anguloFinal);
          // Mostra o vencedor após a animação
          setTimeout(() => {
              setVencedor(data.payload.vencedor);
          }, config.tempoRotacao * 1000);
          break;
        case 'CONFIGURATOR_LEFT':
          alert('O configurador saiu. A sala foi encerrada.');
          navigate('/');
          break;
        default:
          break;
      }
    };
    
    ws.current.onclose = () => {
      console.log('Desconectado.');
      alert('A conexão com o servidor foi perdida.');
      navigate('/');
    };

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [id_sorteio, navigate, config.tempoRotacao]);
  
  const sairDoSorteio = () => {
      if (ws.current) {
        ws.current.close();
      }
      navigate('/');
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen p-4" style={{ backgroundColor: config.corFundo }}>
      <div className="absolute top-4 left-4">
        <h4 className="text-lg font-bold">Modo Espectador</h4>
        <p className="text-sm text-gray-400">ID: {id_sorteio}</p>
      </div>
       <div className="absolute top-4 right-4 flex flex-col items-end">
        <button id="btn_sair" onClick={sairDoSorteio} className="bg-red-600 hover:bg-red-700 p-2 rounded">Sair do Sorteio</button>
        <div id="chat_mensagens" className="mt-2 text-right">
            {mensagens.map((msg, index) => (
                <p key={index} className="bg-purple-800 p-2 rounded-lg mt-1">{msg}</p>
            ))}
        </div>
      </div>
      
      <h1 id="titulo_sorteio" className="text-5xl font-bold mb-6">{config.titulo}</h1>
      
      <div className="relative w-full max-w-lg">
          <div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[200%] z-10"
            style={{ borderLeft: '15px solid transparent', borderRight: '15px solid transparent', borderTop: '25px solid #f87171' }}
          ></div>
          <div id="roda_svg_clone" style={{
              transition: `transform ${config.tempoRotacao}s cubic-bezier(0.25, 1, 0.5, 1)`,
              transform: `rotate(${rotation}deg)`
            }}>
             <RodaSVG itens={config.itens} paleta={config.paleta} />
          </div>
        </div>

        {vencedor && <p className="mt-4 text-3xl font-bold bg-green-500 p-4 rounded-xl animate-pulse">Vencedor: {vencedor}!</p>}
    </div>
  );
}

export default Realtime;