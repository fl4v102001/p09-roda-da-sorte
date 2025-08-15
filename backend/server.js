// backend/server.js

const WebSocket = require('ws');

// Inicia um servidor WebSocket na porta 8080
const wss = new WebSocket.Server({ port: 8080 });

// Objeto para armazenar as salas de sorteio e os seus dados
const sorteios = {};
// Estrutura de 'sorteios':
// {
//   'ID_DO_SORTEIO': {
//     configurador: ws_client,
//     espectadores: [ws_client, ws_client, ...],
//     config: { /* dados da configuração da roda */ }
//   }
// }

console.log("Servidor WebSocket a aguardar conexões na porta 8080...");

// Evento que é acionado quando um novo cliente se conecta
wss.on('connection', (ws) => {
    console.log("Novo cliente conectado!");

    // Evento que é acionado quando o servidor recebe uma mensagem do cliente
    ws.on('message', (message) => {
        const data = JSON.parse(message);
        const { type, id_sorteio, payload } = data;

        // Garante que a sala do sorteio existe
        if (!sorteios[id_sorteio]) {
            sorteios[id_sorteio] = {
                configurador: null,
                espectadores: [],
                config: {}
            };
        }
        const sorteio = sorteios[id_sorteio];

        switch (type) {
            // Caso 1: Um usuário tenta entrar numa sala
            case 'JOIN_SORTEIO':
                // Se não houver um configurador, o usuário assume esse papel
                if (!sorteio.configurador) {
                    sorteio.configurador = ws;
                    ws.role = 'configurador';
                    ws.id_sorteio = id_sorteio;
                    ws.send(JSON.stringify({ type: 'ROLE_ASSIGNED', payload: { role: 'configurador' } }));
                    console.log(`Cliente tornou-se CONFIGURADOR do sorteio: ${id_sorteio}`);
                } else {
                    // Caso contrário, ele torna-se um espectador
                    sorteio.espectadores.push(ws);
                    ws.role = 'espectador';
                    ws.id_sorteio = id_sorteio;
                    ws.send(JSON.stringify({ type: 'ROLE_ASSIGNED', payload: { role: 'espectador' } }));
                    // Envia a configuração mais recente para este novo espectador
                    ws.send(JSON.stringify({ type: 'CONFIG_UPDATE', payload: sorteio.config }));
                    console.log(`Cliente tornou-se ESPECTADOR do sorteio: ${id_sorteio}`);
                }
                break;

            // Caso 2: O configurador sincroniza as configurações
            case 'SYNC_CONFIG':
                // Armazena a nova configuração
                sorteio.config = payload;
                // Envia a atualização para todos os espectadores da sala
                sorteio.espectadores.forEach(espectador => {
                    if (espectador.readyState === WebSocket.OPEN) {
                        espectador.send(JSON.stringify({ type: 'CONFIG_UPDATE', payload }));
                    }
                });
                console.log(`Configuração sincronizada para o sorteio: ${id_sorteio}`);
                break;

            // Caso 3: O configurador envia uma mensagem
            case 'SEND_MESSAGE':
                // Envia a mensagem para todos os espectadores
                sorteio.espectadores.forEach(espectador => {
                    if (espectador.readyState === WebSocket.OPEN) {
                        espectador.send(JSON.stringify({ type: 'MESSAGE_RECEIVE', payload }));
                    }
                });
                console.log(`Mensagem enviada para o sorteio: ${id_sorteio}`);
                break;
            
            // Caso 4: O configurador inicia o sorteio
            case 'START_DRAW':
                // Envia o resultado do sorteio para todos os espectadores
                sorteio.espectadores.forEach(espectador => {
                    if (espectador.readyState === WebSocket.OPEN) {
                        espectador.send(JSON.stringify({ type: 'DRAW_RESULT', payload }));
                    }
                });
                console.log(`Sorteio iniciado para ${id_sorteio}. Vencedor: ${payload.vencedor}`);
                break;
        }
    });

    // Evento que é acionado quando um cliente se desconecta
    ws.on('close', () => {
        console.log("Cliente desconectado.");
        const { id_sorteio, role } = ws;
        if (!id_sorteio || !sorteios[id_sorteio]) return;

        const sorteio = sorteios[id_sorteio];
        
        // Se o configurador se desconecta, a sala é limpa (implementação simples)
        if (role === 'configurador') {
            console.log(`Configurador do sorteio ${id_sorteio} desconectado. A sala será reiniciada.`);
            // Avisa os espectadores que a sala terminou
            sorteio.espectadores.forEach(espectador => {
                if (espectador.readyState === WebSocket.OPEN) {
                    espectador.send(JSON.stringify({ type: 'CONFIGURATOR_LEFT' }));
                }
            });
            delete sorteios[id_sorteio];
        } else {
            // Se um espectador se desconecta, remove-o da lista
            sorteios[id_sorteio].espectadores = sorteio.espectadores.filter(e => e !== ws);
            console.log(`Espectador do sorteio ${id_sorteio} desconectado.`);
        }
    });

    ws.on('error', (error) => {
        console.error("Erro no WebSocket:", error);
    });
});