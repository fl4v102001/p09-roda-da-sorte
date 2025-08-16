import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import RodaSVG from '../components/RodaSVG';

// --- Definições de Tipos para o Componente ---

interface Item {
  nome: string;
  quantidade: number;
}

interface Config {
  titulo: string;
  itens: Item[];
  tempoRotacao: number;
  corFundo: string;
  paleta: string[];
}

type Role = 'configurador' | 'espectador';

// Tipos para as mensagens do WebSocket (Discriminated Union)
type ServerMessage =
  | { type: 'ROLE_ASSIGNED'; payload: { role: Role } }
  | { type: 'CONFIG_UPDATE'; payload: Config }
  | { type: 'MESSAGE_RECEIVE'; payload: { texto: string } }
  | { type: 'DRAW_RESULT'; payload: { anguloFinal: number; vencedor: string; tempoRotacao: number } }
  | { type: 'CONFIGURATOR_LEFT' };

const COLORS = ['#FF6B6B', '#FFD93D', '#6BCB77', '#4D96FF', '#F473B9', '#A16AE8'];

// --- Início do Componente ---

function Sorteio() {
  // Tipando o retorno do useParams para garantir que id_sorteio é uma string
  const { id_sorteio } = useParams<{ id_sorteio: string }>();
  const navigate = useNavigate();
  // Tipando a ref do WebSocket
  const ws = useRef<WebSocket | null>(null);
  
  // Estado para controlar o papel do usuário
  const [role, setRole] = useState<Role>('espectador');

  // Estados da Roda (combinados de ambos os ficheiros)
  const [config, setConfig] = useState<Config>({
    titulo: 'Roda da Sorte',
    itens: [],
    tempoRotacao: 10,
    corFundo: '#111827',
    paleta: COLORS,
  });
  const [mensagens, setMensagens] = useState<string[]>([]);
  const [mensagem, setMensagem] = useState<string>('');
  const [rotation, setRotation] = useState<number>(0);
  const [vencedor, setVencedor] = useState<string | null>(null);

  // Efeito para gerir a conexão WebSocket
  useEffect(() => {
    let isClosing = false; // Flag para indicar um fecho intencional

    const wsInstance = new WebSocket('ws://localhost:8080');
    ws.current = wsInstance;

    wsInstance.onopen = () => {
      console.log('Conectado ao sorteio!');
      wsInstance.send(JSON.stringify({ type: 'JOIN_SORTEIO', id_sorteio }));
    };

    wsInstance.onmessage = (event) => {
      const data: ServerMessage = JSON.parse(event.data);
      switch (data.type) {
        case 'ROLE_ASSIGNED':
          setRole(data.payload.role);
          // Se for configurador, pode precisar de uma configuração inicial
          if (data.payload.role === 'configurador' && config.itens.length === 0) {
            setConfig(prev => ({ ...prev, itens: [{ nome: 'Prémio 1', quantidade: 10 }, { nome: 'Prémio 2', quantidade: 5 }]}));
          }
          break;
        case 'CONFIG_UPDATE':
          setConfig(data.payload);
          break;
        case 'MESSAGE_RECEIVE':
          setMensagens(prev => [...prev, data.payload.texto]);
          break;
        case 'DRAW_RESULT':
          setRotation(data.payload.anguloFinal);
          setTimeout(() => setVencedor(data.payload.vencedor), data.payload.tempoRotacao * 1000 || config.tempoRotacao * 1000);
          break;
        case 'CONFIGURATOR_LEFT':
          alert('O configurador saiu. A sala foi encerrada.');
          navigate('/');
          break;
      }
    };

    wsInstance.onclose = () => {
      console.log('Desconectado.');
      // Apenas mostra o alerta e redireciona se a conexão não foi fechada intencionalmente
      if (!isClosing) {
        alert('A conexão com o servidor foi perdida.');
        navigate('/');
      }
    };

    wsInstance.onerror = (error) => {
        console.error("Erro no WebSocket:", error);
    };

    return () => {
      console.log("A limpar conexão WebSocket intencionalmente...");
      isClosing = true;
      wsInstance.close();
      ws.current = null;
    };
  }, [id_sorteio, navigate]);

  // Funções de controlo (do antigo Config.jsx)
  const handleItemChange = (index: number, field: keyof Item, value: string) => {
    const novosItens = [...config.itens];
    const itemToUpdate = { ...novosItens[index], [field]: field === 'quantidade' ? parseInt(value, 10) || 1 : value };
    novosItens[index] = itemToUpdate;
    setConfig(prev => ({...prev, itens: novosItens}));
  };
  const adicionarItem = () => setConfig(prev => ({...prev, itens: [...prev.itens, { nome: `Novo Item ${prev.itens.length + 1}`, quantidade: 1 }]}));
  const removerItem = (index: number) => setConfig(prev => ({...prev, itens: prev.itens.filter((_, i) => i !== index)}));
  
  const sincronizarConfig = () => {
    ws.current?.send(JSON.stringify({ type: 'SYNC_CONFIG', id_sorteio, payload: config }));
  };
  const enviarMensagem = () => {
    if (!mensagem.trim()) return;
    ws.current?.send(JSON.stringify({ type: 'SEND_MESSAGE', id_sorteio, payload: { texto: mensagem } }));
    setMensagem('');
  };
  const iniciarSorteio = () => {
    if (config.itens.length === 0) return alert("Adicione pelo menos um item.");
    const total = config.itens.reduce((sum, item) => sum + item.quantidade, 0);
    const ticket = Math.random() * total;
    let acumulado = 0;
    let itemVencedor = config.itens[0];
    for (const item of config.itens) {
      acumulado += item.quantidade;
      if (ticket <= acumulado) {
        itemVencedor = item;
        break;
      }
    }
// CÓDIGO NOVO E CORRIGIDO
const anguloPorUnidade = 360 / total;
let anguloInicialItem = 0;
for (const item of config.itens) {
    if (item.nome === itemVencedor.nome) break;
    anguloInicialItem += item.quantidade * anguloPorUnidade;
}
const anguloFatia = itemVencedor.quantidade * anguloPorUnidade;

// Sorteia um ângulo exato dentro da fatia vencedora
const anguloVencedor = anguloInicialItem + Math.random() * anguloFatia;

// --- INÍCIO DA LÓGICA CORRIGIDA ---

// O ângulo alvo na roda (0-360) que deve parar sob o ponteiro (que está no topo, a 0/360 graus)
const targetAngle = 360 - anguloVencedor;

// A posição angular atual da roda, ignorando as voltas completas
const currentAngle = rotation % 360;

// Calcula a distância a girar no sentido horário.
// Adicionamos 360 para garantir que o resultado seja sempre positivo.
const spinAmount = (targetAngle - currentAngle + 360) % 360;

// Adiciona várias voltas completas para um efeito visual mais interessante
const voltasExtras = 5 * 360;

// A nova rotação total é a rotação antiga + as voltas extras + a distância calculada
const anguloFinalAnimacao = rotation + voltasExtras + spinAmount;

// --- FIM DA LÓGICA CORRIGIDA ---
    
    setRotation(anguloFinalAnimacao);
    setVencedor(itemVencedor.nome);

    const payload = { anguloFinal: anguloFinalAnimacao, vencedor: itemVencedor.nome, tempoRotacao: config.tempoRotacao };
    ws.current?.send(JSON.stringify({ type: 'START_DRAW', id_sorteio, payload }));
  };
  
  const handleConfigChange = (field: keyof Omit<Config, 'itens' | 'paleta'>, value: string | number) => {
      setConfig(prev => ({...prev, [field]: value }));
  };

  // UI do Configurador
  const renderConfigurator = () => (
    <div className="md:w-1/2 bg-gray-800 p-6 overflow-y-auto">
      <button onClick={iniciarSorteio} className="w-full bg-cyan-600 hover:bg-cyan-700 font-bold py-4 rounded text-xl">INICIAR SORTEIO!</button>
      <h3 className="text-2xl font-bold mb-4 border-b border-gray-600 pb-2">Painel de Configuração</h3>
      <p className="mb-4 text-sm text-gray-400">ID: <span className="font-mono bg-gray-700 p-1 rounded">{id_sorteio}</span></p>
      <div className="mb-4"><label className="block mb-2 font-semibold">Título</label><input type="text" value={config.titulo} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleConfigChange('titulo', e.target.value)} className="w-full p-2 bg-gray-700 rounded"/></div>
      <div className="mb-4"><label className="block mb-2 font-semibold">Tempo de Rotação (s)</label><input type="number" value={config.tempoRotacao} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleConfigChange('tempoRotacao', Number(e.target.value))} className="w-full p-2 bg-gray-700 rounded"/></div>
      <div className="mb-4"><label className="block mb-2 font-semibold">Cor de Fundo</label><input type="color" value={config.corFundo} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleConfigChange('corFundo', e.target.value)} className="w-full p-1 h-10 bg-gray-700 rounded"/></div>
      <div className="mb-4">
        <h4 className="text-xl font-bold mb-2">Itens da Roda</h4>
        {config.itens.map((item, index) => (
          <div key={index} className="flex items-center gap-2 mb-2 p-2 bg-gray-700 rounded">
            <input type="text" value={item.nome} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleItemChange(index, 'nome', e.target.value)} className="flex-grow p-1 bg-gray-600 rounded" />
            <input type="number" value={item.quantidade} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleItemChange(index, 'quantidade', e.target.value)} className="w-20 p-1 bg-gray-600 rounded" />
            <button onClick={() => removerItem(index)} className="bg-red-600 hover:bg-red-700 text-white font-bold p-1 rounded">X</button>
          </div>
        ))}
        <button onClick={adicionarItem} className="w-full mt-2 bg-blue-600 hover:bg-blue-700 p-2 rounded">Adicionar Item</button>
      </div>
      <div className="p-4 bg-gray-900 rounded-lg">
        <button onClick={sincronizarConfig} className="w-full mb-4 bg-green-600 hover:bg-green-700 font-bold py-3 rounded">Sincronizar</button>
        <div className="flex gap-2 mb-4">
          <input type="text" value={mensagem} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMensagem(e.target.value)} placeholder="Digite uma mensagem..." className="flex-grow p-2 bg-gray-700 rounded" />
          <button onClick={enviarMensagem} className="bg-purple-600 hover:bg-purple-700 p-2 rounded">Enviar</button>
        </div>
      </div>
    </div>
  );

  // UI do Espectador e da Roda (comum a ambos)
  const renderWheel = () => (
    <div className="md:w-1/2 flex flex-col items-center justify-center p-8">
      {role === 'espectador' && <div className="absolute top-4 left-4"><h4 className="text-lg font-bold">Modo Espectador</h4><p className="text-sm text-gray-400">ID: {id_sorteio}</p></div>}
      <div className="absolute top-4 right-4 flex flex-col items-end">
        {role === 'espectador' && <button onClick={() => navigate('/')} className="bg-red-600 hover:bg-red-700 p-2 rounded">Sair</button>}
        <div className="mt-2 text-right">
          {mensagens.map((msg, index) => <p key={index} className="bg-purple-800 p-2 rounded-lg mt-1">{msg}</p>)}
        </div>
      </div>
      <h1 className="text-5xl font-bold mb-6 text-center">{config.titulo}</h1>
      <div className="relative w-full max-w-lg">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[200%] z-10" style={{ borderLeft: '15px solid transparent', borderRight: '15px solid transparent', borderTop: '25px solid #f87171' }}></div>
        <div style={{ transition: `transform ${config.tempoRotacao}s cubic-bezier(0.25, 1, 0.5, 1)`, transform: `rotate(${rotation}deg)` }}>
          <RodaSVG itens={config.itens} paleta={config.paleta} />
        </div>
      </div>
      {vencedor && <p className="mt-4 text-3xl font-bold bg-green-500 p-4 rounded-xl animate-pulse">Vencedor: {vencedor}!</p>}
    </div>
  );

  return (
    <div className="flex flex-col md:flex-row h-screen" style={{ backgroundColor: config.corFundo }}>
      {renderWheel()}
      {role === 'configurador' && renderConfigurator()}
    </div>
  );
}

export default Sorteio;