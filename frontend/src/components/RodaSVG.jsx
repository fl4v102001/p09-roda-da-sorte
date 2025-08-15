// frontend/src/components/RodaSVG.jsx

import React from 'react';

const RodaSVG = ({ itens, paleta }) => {
  if (!itens || itens.length === 0) {
    // Retorna uma roda 'vazia' se não houver itens
    return (
      <svg viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="48" fill="#ccc" stroke="#666" strokeWidth="2" />
        <text x="50" y="55" textAnchor="middle" fontSize="5" fill="#000">Adicione itens para começar</text>
      </svg>
    );
  }

  const totalQuantidade = itens.reduce((sum, item) => sum + item.quantidade, 0);
  let anguloAcumulado = 0;

  const getCoordenadasDoAngulo = (raio, angulo) => {
    const radianos = (angulo - 90) * Math.PI / 180;
    return {
      x: 50 + raio * Math.cos(radianos),
      y: 50 + raio * Math.sin(radianos),
    };
  };

  return (
    <svg id="roda_svg" viewBox="0 0 100 100">
      {itens.map((item, index) => {
        const anguloFatia = (item.quantidade / totalQuantidade) * 360;
        const anguloInicial = anguloAcumulado;
        const anguloFinal = anguloAcumulado + anguloFatia;
        anguloAcumulado = anguloFinal;

        const pontoInicial = getCoordenadasDoAngulo(50, anguloInicial);
        const pontoFinal = getCoordenadasDoAngulo(50, anguloFinal);
        const arcoLargo = anguloFatia > 180 ? 1 : 0;

        const pathData = `M 50,50 L ${pontoInicial.x},${pontoInicial.y} A 50,50 0 ${arcoLargo},1 ${pontoFinal.x},${pontoFinal.y} Z`;
        
        const cor = paleta[index % paleta.length];

        // Posicionamento do texto
        const anguloTexto = anguloInicial + anguloFatia / 2;
        const posTexto = getCoordenadasDoAngulo(35, anguloTexto);

        return (
          <g key={index}>
            <path d={pathData} fill={cor} stroke="#fff" strokeWidth="0.5" />
            <text
              x={posTexto.x}
              y={posTexto.y}
              fill="#000"
              fontSize="3.5"
              fontWeight="bold"
              textAnchor="middle"
              alignmentBaseline="middle"
              transform={`rotate(${anguloTexto + 90}, ${posTexto.x}, ${posTexto.y})`}
            >
              {item.nome}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

export default RodaSVG;