import React from 'react';

// Interface para os itens da roda. Pode ser movida para um arquivo de tipos compartilhado.
interface Item {
  nome: string;
  quantidade: number;
}

// Define as props que o componente RodaSVG espera receber.
interface RodaSVGProps {
  itens: Item[];
  paleta: string[];
}

// Função auxiliar para converter coordenadas polares (ângulo, raio) em cartesianas (x, y).
const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
};

// Função auxiliar para criar o atributo 'd' de um caminho de arco SVG.
const describeArc = (x: number, y: number, radius: number, startAngle: number, endAngle: number): string => {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
  const d = ['M', start.x, start.y, 'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y, 'L', x, y, 'L', start.x, start.y, 'Z'].join(' ');
  return d;
};

const RodaSVG: React.FC<RodaSVGProps> = ({ itens, paleta }) => {
  // Se não houver itens, renderiza um estado de placeholder.
  if (itens.length === 0) {
    return (
      <svg viewBox="0 0 200 200" width="100%" height="100%">
        <circle cx="100" cy="100" r="98" fill="#374151" stroke="#4B5563" strokeWidth="2" />
        <text x="100" y="100" textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="12">
          Adicione itens no painel...
        </text>
      </svg>
    );
  }

  const totalQuantidade = itens.reduce((sum, item) => sum + item.quantidade, 0);
  // Evita divisão por zero se a quantidade total for 0.
  if (totalQuantidade === 0) return null;

  const anguloPorUnidade = 360 / totalQuantidade;
  let anguloAcumulado = 0;

  const fatias = itens.map((item, index) => {
    const anguloFatia = item.quantidade * anguloPorUnidade;
    const anguloInicial = anguloAcumulado;
    const anguloFinal = anguloAcumulado + anguloFatia;
    const anguloMeio = anguloInicial + anguloFatia / 2;

    const pathData = describeArc(100, 100, 100, anguloInicial, anguloFinal);
    const cor = paleta[index % paleta.length];

    // Calcula a posição do texto no meio da fatia.
    const textPos = polarToCartesian(100, 100, 65, anguloMeio);

    anguloAcumulado = anguloFinal;

    return (
      <g key={index}>
        <path d={pathData} fill={cor} stroke="#111827" strokeWidth="1" />
        <text
          x={textPos.x}
          y={textPos.y}
          transform={`rotate(${anguloMeio + 90}, ${textPos.x}, ${textPos.y})`}
          fill="white"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="8"
          fontWeight="bold"
          style={{ pointerEvents: 'none' }}
        >
          {item.nome}
        </text>
      </g>
    );
  });

  return <svg viewBox="0 0 200 200" width="100%" height="100%">{fatias}</svg>;
};

export default RodaSVG;