import { useState } from 'react';
import { createEmptyBoard, createEmptyShots, resetBoard as resetBoardUtil } from '../utils/gameUtils';

export const useGameState = () => {
  const [board, setBoard] = useState(createEmptyBoard());
  const [playerBoard, setPlayerBoard] = useState(createEmptyShots());
  const [opponentShots, setOpponentShots] = useState(createEmptyShots());
  const [playerShipsRemaining, setPlayerShipsRemaining] = useState(17);
  const [opponentShipsRemaining, setOpponentShipsRemaining] = useState(17);
  const [placedShips, setPlacedShips] = useState([]);
  const [currentShipIndex, setCurrentShipIndex] = useState(0);
  const [orientation, setOrientation] = useState('horizontal');

  const resetBoard = () => {
    resetBoardUtil(setBoard, setPlacedShips, setCurrentShipIndex);
    setPlayerBoard(createEmptyShots());
    setOpponentShots(createEmptyShots());
    setPlayerShipsRemaining(17);
    setOpponentShipsRemaining(17);
  };

  return {
    board,
    setBoard,
    playerBoard,
    setPlayerBoard,
    opponentShots,
    setOpponentShots,
    playerShipsRemaining,
    setPlayerShipsRemaining,
    opponentShipsRemaining,
    setOpponentShipsRemaining,
    placedShips,
    setPlacedShips,
    currentShipIndex,
    setCurrentShipIndex,
    orientation,
    setOrientation,
    resetBoard,
  };
};