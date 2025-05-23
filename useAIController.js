import { useRef, useState } from 'react';

export const useAIController = (playerBoard, aiShots, setAIShots, setPlayerShipsRemaining, checkShipSunk, onDefeat) => {
  const [message, setMessage] = useState('');
  const [tempAlert, setTempAlert] = useState('');
  const targetStack = useRef([]);

  const getAdjacentCells = (row, col) => {
    const directions = [
      [0, 1], [1, 0], [0, -1], [-1, 0]
    ];
    return directions.map(([dr, dc]) => [row + dr, col + dc])
      .filter(([r, c]) => r >= 0 && r < 10 && c >= 0 && c < 10 && aiShots[r][c] === ' ');
  };

  const aiTurn = (setPlayerTurn) => {
    setTimeout(() => {
      setMessage('La IA está pensando...');

      setTimeout(() => {
        const newShots = aiShots.map(r => [...r]);
        let row, col;

        if (targetStack.current.length > 0) {
          [row, col] = targetStack.current.pop();
        } else {
          let valid = false;
          while (!valid) {
            row = Math.floor(Math.random() * 10);
            col = Math.floor(Math.random() * 10);
            if (newShots[row][col] === ' ') valid = true;
          }
        }

        const hit = playerBoard[row][col] !== 0;
        newShots[row][col] = hit ? 'X' : '·';
        setAIShots(newShots);
        setMessage(hit ? '¡Te dieron!' : 'La IA falló');

        if (hit) {
          setPlayerShipsRemaining(p => p - 1);
          if (checkShipSunk(playerBoard, newShots, row, col)) {
            setTempAlert('¡La IA hundió uno de tus barcos!');
          } else {
            const targets = getAdjacentCells(row, col);
            targetStack.current.push(...targets);
          }
        }

        setTimeout(() => {
          if (hit && playerBoard.flat().filter(cell => typeof cell === 'string' && cell === 'X').length >= 17) {
            onDefeat();
          } else {
            setMessage('');
            setPlayerTurn(true);
          }
        }, 2000);
      }, 1000);
    }, 1000);
  };

  return {
    aiTurn,
    message,
    tempAlert,
    setMessage,
    setTempAlert,
  };
};
