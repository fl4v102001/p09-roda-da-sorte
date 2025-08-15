// frontend/src/pages/Config.jsx

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import RodaSVG from '../components/RodaSVG'; // Iremos criar este componente a seguir

const COLORS = ['#FF6B6B', '#FFD93D', '#6BCB77', '#4D96FF', '#F473B9', '#A16AE8'];

function Config() {
  const { id_sorteio } = useParams();
  const navigate = useNavigate();
  const ws = useRef(null);

  // Estados para gerir os dados da configuração
  const [titulo, setTitulo] = useState('Roda da Sorte');
  const [itens, setItens] = useState([{ nome: 'Prémio 1', quantidade: 10 }, { nome: 'Prémio 2', quantidade: 5 }]);
  const [tempoRotacao, setTempoRotacao] = useState(10);
  const [corFundo, setCorFundo] = useState('#111827'); // bg-gray-900
  const [paleta, setPaleta] = useState(COLORS);
  const [mensagem, setMensagem] = useState('');
  const [vencedor, setVencedor] = useState(null);
  
  // Estado para a animação
  const [rotation, setRotation] = useState(0);

  // Conectar ao WebSocket quando o componente for montado
  useEffect(() => {
    ws.current = new WebSocket('ws://localhost:8080');

    ws.current.onopen = () => {
      console.log('Conectado como Configurador!');
      // Entra na sala de sorteio
      ws.current.send(JSON.stringify({
        type: 'JOIN_SORTEIO',
        id_sorteio: id_sorteio,
      }));
    };

    ws.current.onclose = () => {
      console.log('Desconectado.');
      alert('A conexão com o servidor foi perdida.');
      navigate('/'); // Volta para a página de login
    };

    ws.current.onerror = (error) => {
      console.error('Erro no WebSocket:', error);
      alert('Ocorreu um erro na conexão.');
      navigate('/');
    };
    
    // Cleanup ao desmontar o componente
    return () => {
      if (ws.current) ws.current.close();
    };
  }, [id_sorteio, navigate]);

  // Funções para manipular a lista de itens
  const handleItemChange = (index, field, value) => {
    const novosItens = [...itens];
    novosItens[index][field] = field === 'quantidade' ? parseInt(value, 10) || 1 : value;
    setItens(novosItens);
  };

  const adicionarItem = () => {
    setItens([...itens, { nome: `Novo Item ${itens.length + 1}`, quantidade: 1 }]);
  };

  const removerItem = (index) => {
    setItens(itens.filter((_, i) => i !== index));
  };

  // Funções para interagir com o WebSocket
  const sincronizarConfig = () => {
    const config = { titulo, itens, tempoRotacao, corFundo, paleta };
    ws.current.send(JSON.stringify({
      type: 'SYNC_CONFIG',
      id_sorteio: id_sorteio,
      payload: config
    }));
    alert('Configurações sincronizadas com os espectadores!');
  };

  const enviarMensagem = () => {
    if (!mensagem.trim()) return;
    ws.current.send(JSON.stringify({
      type: 'SEND_MESSAGE',
      id_sorteio: id_sorteio,
      payload: { texto: mensagem }
    }));
    setMensagem(''); // Limpa o campo após o envio
  };
  
  const iniciarSorteio = () => {
    if (itens.length === 0) {
        alert("Adicione pelo menos um item para iniciar o sorteio.");
        return;
    }

    const totalQuantidade = itens.reduce((sum, item) => sum + item.quantidade, 0);
    const ticketSorteado = Math.random() * totalQuantidade;
    
    let acumulado = 0;
    let itemVencedor = null;
    
    for (const item of itens) {
        acumulado += item.quantidade;
        if (ticketSorteado <= acumulado) {
            itemVencedor = item;
            break;
        }
    }

    // Calcula o ângulo final
    const anguloPorQuantidade = 360 / totalQuantidade;
    let anguloInicialItem = 0;
    for(const item of itens) {
        if(item.nome === itemVencedor.nome) break;
        anguloInicialItem += item.quantidade * anguloPorQuantidade;
    }
    const anguloFinalItem = anguloInicialItem + itemVencedor.quantidade * anguloPorQuantidade;
    
    // Sorteia um ângulo dentro da fatia do vencedor
    const anguloVencedor = anguloInicialItem + Math.random() * (anguloFinalItem - anguloInicialItem);

    // Adiciona voltas extras para a animação ser mais interessante
    const voltasExtras = 5 * 360; 
    const anguloFinalAnimacao = voltasExtras + (360 - anguloVencedor);
    
    setRotation(anguloFinalAnimacao);
    setVencedor(itemVencedor.nome);

    // Envia o resultado para os espectadores
    ws.current.send(JSON.stringify({
      type: 'START_DRAW',
      id_sorteio: id_sorteio,
      payload: { anguloFinal: anguloFinalAnimacao, vencedor: itemVencedor.nome }
    }));
  };

  return (
    <div className="flex flex-col md:flex-row h-screen" style={{ backgroundColor: corFundo }}>
      {/* Coluna da Roda */}
      <div className="md:w-1/2 flex flex-col items-center justify-center p-8">
        <h2 className="text-4xl font-bold mb-4">{titulo}</h2>
        <div className="relative w-full max-w-lg">
          <div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[200%] z-10"
            style={{ borderLeft: '15px solid transparent', borderRight: '15px solid transparent', borderTop: '25px solid #f87171' }}
          ></div>
          <div style={{
              transition: `transform ${tempoRotacao}s cubic-bezier(0.25, 1, 0.5, 1)`,
              transform: `rotate(${rotation}deg)`
            }}>
             <RodaSVG itens={itens} paleta={paleta} />
          </div>
        </div>
         {vencedor && <p className="mt-4 text-2xl font-bold bg-green-500 p-3 rounded">Vencedor: {vencedor}!</p>}
      </div>

      {/* Coluna de Controles */}
      <div className="md:w-1/2 bg-gray-800 p-6 overflow-y-auto">
        <h3 className="text-2xl font-bold mb-4 border-b border-gray-600 pb-2">Painel de Configuração</h3>
        <p className="mb-4 text-sm text-gray-400">ID do Sorteio: <span className="font-mono bg-gray-700 p-1 rounded">{id_sorteio}</span></p>

        {/* Configurações Gerais */}
        <div className="mb-4">
          <label className="block mb-2 font-semibold">Título do Sorteio</label>
          <input id="input_titulo_sorteio" type="text" value={titulo} onChange={(e) => setTitulo(e.target.value)} className="w-full p-2 bg-gray-700 rounded"/>
        </div>
        <div className="mb-4">
          <label className="block mb-2 font-semibold">Tempo de Rotação (segundos)</label>
          <input id="input_tempo_rotacao" type="number" value={tempoRotacao} onChange={(e) => setTempoRotacao(e.target.value)} className="w-full p-2 bg-gray-700 rounded"/>
        </div>
        <div className="mb-4">
          <label className="block mb-2 font-semibold">Cor de Fundo</label>
          <input id="cor_fundo" type="color" value={corFundo} onChange={(e) => setCorFundo(e.target.value)} className="w-full p-1 h-10 bg-gray-700 rounded"/>
        </div>

        {/* Lista de Itens */}
        <div id="lista_itens" className="mb-4">
          <h4 className="text-xl font-bold mb-2">Itens da Roda</h4>
          {itens.map((item, index) => (
            <div key={index} className="flex items-center gap-2 mb-2 p-2 bg-gray-700 rounded">
              <input type="text" placeholder="Nome" value={item.nome} onChange={(e) => handleItemChange(index, 'nome', e.target.value)} className="flex-grow p-1 bg-gray-600 rounded" />
              <input type="number" placeholder="Quantidade" value={item.quantidade} onChange={(e) => handleItemChange(index, 'quantidade', e.target.value)} className="w-20 p-1 bg-gray-600 rounded" />
              <button onClick={() => removerItem(index)} className="bg-red-600 hover:bg-red-700 text-white font-bold p-1 rounded">X</button>
            </div>
          ))}
          <button onClick={adicionarItem} className="w-full mt-2 bg-blue-600 hover:bg-blue-700 p-2 rounded">Adicionar Item</button>
        </div>

        {/* Ações */}
        <div className="p-4 bg-gray-900 rounded-lg">
           <button id="BOTAO_SINCRONIZAR_CONFIG" onClick={sincronizarConfig} className="w-full mb-4 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded">
                Sincronizar Configuração
           </button>
           <div className="flex gap-2 mb-4">
               <input id="input_mensagem" type="text" value={mensagem} onChange={(e) => setMensagem(e.target.value)} placeholder="Digite uma mensagem..." className="flex-grow p-2 bg-gray-700 rounded" />
               <button id="BOTAO_ENVIAR_MENSAGEM" onClick={enviarMensagem} className="bg-purple-600 hover:bg-purple-700 p-2 rounded">Enviar</button>
           </div>
           <button id="BOTAO_INICIAR_SORTEIO" onClick={iniciarSorteio} className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-4 rounded text-xl">
               INICIAR SORTEIO!
           </button>
        </div>
      </div>
    </div>
  );
}

export default Config;