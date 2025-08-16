import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css'; // Importa os estilos do Tailwind
import App from './App';

// Pega o container do DOM. A asserção `!` informa ao TypeScript que temos certeza que este elemento existe.
const container = document.getElementById('root')!;

// Cria a raiz da aplicação React.
const root = createRoot(container);

// Renderiza a aplicação. O StrictMode ajuda a identificar potenciais problemas.
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
