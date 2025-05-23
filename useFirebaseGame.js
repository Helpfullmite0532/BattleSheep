import { useState, useEffect, useRef } from 'react';
import { Alert } from 'react-native';
import { database } from '../firebaseConfig';
import { ref, onValue, set, update, onDisconnect, off } from 'firebase/database';
import { checkShipSunk } from '../utils/gameUtils';

const WAIT_TIMEOUT = 120000; // 2 minutes
const SETUP_TIMEOUT = 300000; // 5 minutes
const TURN_DELAY = 1000; // 1 second

export const useFirebaseGame = (roomId, player, navigation, gameState) => {
  const {
    board,
    playerBoard,
    setPlayerBoard,
    opponentShots,
    setOpponentShots,
    setPlayerShipsRemaining,
    setOpponentShipsRemaining,
  } = gameState;

  const [gameStatus, setGameStatus] = useState('waiting');
  const [currentTurn, setCurrentTurn] = useState('player1');
  const [opponentReady, setOpponentReady] = useState(false);
  const [playerReady, setPlayerReady] = useState(false);
  const [gameActive, setGameActive] = useState(true);
  const [hasOpponent, setHasOpponent] = useState(false);
  const [message, setMessage] = useState('No hay oponentes conectados');
  const [tempAlert, setTempAlert] = useState('');
  const [waitTime, setWaitTime] = useState(0);
  const [setupTime, setSetupTime] = useState(0);
  const waitTimeoutRef = useRef(null);
  const setupTimeoutRef = useRef(null);

  // Handle temporary alerts
  useEffect(() => {
    if (tempAlert) {
      const timer = setTimeout(() => setTempAlert(''), 1500);
      return () => clearTimeout(timer);
    }
  }, [tempAlert]);

  // Waiting timeout (2 minutes)
  useEffect(() => {
    if (gameStatus === 'waiting' && gameActive && !hasOpponent && !waitTimeoutRef.current) {
      setWaitTime(WAIT_TIMEOUT / 1000);
      waitTimeoutRef.current = setTimeout(() => {
        if (gameActive) {
          setGameActive(false);
          set(ref(database, `games/${roomId}`), null).catch(error => console.error('Error cleaning up room:', error));
          Alert.alert('No se encontró oponente', 'No se unió ningún oponente en el tiempo establecido.', [
            { text: 'Volver', onPress: () => navigation.navigate('Multiplayer') },
          ]);
        }
      }, WAIT_TIMEOUT);

      const interval = setInterval(() => {
        setWaitTime(prev => (prev > 0 ? prev - 1 : 0));
      }, 1000);

      return () => {
        clearInterval(interval);
        if (waitTimeoutRef.current) {
          clearTimeout(waitTimeoutRef.current);
          waitTimeoutRef.current = null;
        }
      };
    }
  }, [gameStatus, gameActive, hasOpponent, roomId, navigation]);

  // Setup timeout (5 minutes)
  useEffect(() => {
    if (gameStatus === 'setup' && gameActive && hasOpponent && (!playerReady || !opponentReady) && !setupTimeoutRef.current) {
      setSetupTime(SETUP_TIMEOUT / 1000);
      setupTimeoutRef.current = setTimeout(() => {
        if (gameActive) {
          setGameActive(false);
          set(ref(database, `games/${roomId}`), null).catch(error => console.error('Error cleaning up room:', error));
          Alert.alert('Tiempo agotado para preparación', 'El tiempo para colocar barcos ha expirado.', [
            { text: 'Volver', onPress: () => navigation.navigate('Multiplayer') },
          ]);
        }
      }, SETUP_TIMEOUT);

      const interval = setInterval(() => {
        setSetupTime(prev => (prev > 0 ? prev - 1 : 0));
      }, 1000);

      return () => {
        clearInterval(interval);
        if (setupTimeoutRef.current) {
          clearTimeout(setupTimeoutRef.current);
          setupTimeoutRef.current = null;
        }
      };
    }
  }, [gameStatus, gameActive, hasOpponent, playerReady, opponentReady, roomId, navigation]);

  // Firebase game listener
  useEffect(() => {
    if (!roomId) {
      console.error('No roomId provided');
      return;
    }

    const presenceRef = ref(database, `games/${roomId}/presence/${player}`);
    set(presenceRef, true).catch(error => console.error('Error setting presence:', error));
    onDisconnect(presenceRef).remove();

    const gameRef = ref(database, `games/${roomId}`);
    const unsubscribe = onValue(gameRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setGameStatus(data.gameStatus || 'setup');
        setCurrentTurn(data.currentTurn || 'player1');
        const opponentKey = player === 'player1' ? 'player2' : 'player1';
        const newHasOpponent = !!data[opponentKey];
        setHasOpponent(newHasOpponent);

        if (data.gameStatus !== 'waiting' && !newHasOpponent && gameActive) {
          setGameActive(false);
          setMessage('Oponente desconectado');
          set(ref(database, `games/${roomId}`), null).catch(error => console.error('Error cleaning up room:', error));
          Alert.alert('Oponente desconectado', 'El otro jugador ha abandonado la partida.', [
            { text: 'Volver', onPress: () => navigation.navigate('Multiplayer') },
          ]);
          return;
        }

        if (gameActive) {
          setOpponentReady(data[opponentKey]?.ready || false);

          if (data?.player1?.ready && data?.player2?.ready && data.gameStatus === 'setup') {
            update(ref(database, `games/${roomId}`), {
              gameStatus: 'playing',
              currentTurn: 'player1',
              shots: {},
              shotsBy: '',
            }).catch(error => console.error('Error updating game to playing:', error));
          }

          setMessage(
            data.gameStatus === 'playing'
              ? data.currentTurn === player
                ? 'Tu turno'
                : 'Esperando el turno del oponente...'
              : data.gameStatus === 'setup'
              ? playerReady
                ? 'Esperando a que oponente coloque barcos'
                : data[opponentKey]?.ready
                ? 'Oponente está listo'
                : 'Esperando a que oponente coloque barcos'
              : 'No hay oponentes conectados'
          );

          if (data.shots) {
            const newPlayerBoard = [...playerBoard];
            const newOpponentShots = [...opponentShots];
            let playerBoardUpdated = false;
            let opponentShotsUpdated = false;
            const shotsToCheck = [];

            for (const [key, value] of Object.entries(data.shots)) {
              const [row, col] = key.split('-').map(Number);
              if (data.shotsBy === player) {
                if (newPlayerBoard[row][col] === ' ' && playerBoard[row][col] === ' ') {
                  newPlayerBoard[row][col] = value;
                  playerBoardUpdated = true;
                }
              } else {
                if (newOpponentShots[row][col] === ' ' && opponentShots[row][col] === ' ') {
                  newOpponentShots[row][col] = value;
                  opponentShotsUpdated = true;
                  if (value === 'X') {
                    setPlayerShipsRemaining(prev => prev - 1);
                    shotsToCheck.push({ row, col });
                  }
                }
              }
            }

            if (playerBoardUpdated) setPlayerBoard(newPlayerBoard);
            if (opponentShotsUpdated) setOpponentShots(newOpponentShots);
            shotsToCheck.forEach(({ row, col }) => checkSunkShips(row, col, newOpponentShots));
          }
        }
      } else {
        setGameActive(false);
        setMessage('Sala cerrada');
        Alert.alert('Sala cerrada', 'La sala ya no existe.', [
          { text: 'Volver', onPress: () => navigation.navigate('Multiplayer') },
        ]);
      }
    }, (error) => {
      console.error('Error listening to game data:', error);
    });

    return () => {
      off(gameRef);
      set(presenceRef, null).catch(error => console.error('Error removing presence:', error));
      if (waitTimeoutRef.current) clearTimeout(waitTimeoutRef.current);
      if (setupTimeoutRef.current) clearTimeout(setupTimeoutRef.current);
    };
  }, [roomId, player, gameActive, navigation, playerBoard, opponentShots]);

  const markReady = async () => {
    if (gameState.placedShips.length < gameState.placedShips.length || playerReady) {
      if (gameState.placedShips.length < gameState.placedShips.length) {
        Alert.alert("Barcos pendientes", "Debes colocar todos los barcos antes de continuar.");
      }
      return;
    }
    try {
      await update(ref(database, `games/${roomId}/${player}`), { ready: true });
      setPlayerReady(true);
    } catch (error) {
      console.error('Error marking ready:', error);
      Alert.alert('Error', 'No se pudo marcar como listo.');
    }
  };

  const handleShot = async (row, col) => {
    if (playerBoard[row][col] !== ' ' || currentTurn !== player || gameStatus !== 'playing' || !gameActive) {
      return;
    }

    const hit = board[row][col] !== 0;
    const newValue = hit ? 'X' : '·';
    const newPlayerBoard = [...playerBoard];
    newPlayerBoard[row][col] = newValue;
    setPlayerBoard(newPlayerBoard);

    if (hit) {
      setOpponentShipsRemaining(prev => prev - 1);
      setMessage('¡Le diste!');
      if (checkShipSunk(board, newPlayerBoard, row, col)) {
        const shipName = SHIPS.find(s => s.name.charAt(0) === board[row][col])?.name || 'Barco';
        setTempAlert(`¡Hundiste un barco enemigo! (${shipName})`);
      }
    } else {
      setMessage('Fallaste');
    }

    try {
      await update(ref(database, `games/${roomId}`), {
        [`shots/${row}-${col}`]: newValue,
        shotsBy: player,
      });

      if (opponentShipsRemaining - (hit ? 1 : 0) <= 0) {
        await update(ref(database, `games/${roomId}`), {
          gameStatus: 'finished',
          winner: player,
        });
        Alert.alert('¡Felicidades!', '¡Has hundido toda la flota enemiga!', [
          { text: 'Volver', onPress: () => navigation.navigate('Multiplayer') },
        ]);
        return;
      }

      setTimeout(async () => {
        await update(ref(database, `games/${roomId}`), {
          currentTurn: player === 'player1' ? 'player2' : 'player1',
        });
      }, TURN_DELAY);
    } catch (error) {
      console.error('Error in handleShot:', error);
      const revertedBoard = [...playerBoard];
      revertedBoard[row][col] = ' ';
      setPlayerBoard(revertedBoard);
      if (hit) setOpponentShipsRemaining(prev => prev + 1);
      Alert.alert('Error', 'No se pudo realizar el disparo.');
    }
  };

  const checkSunkShips = (row, col, updatedShots) => {
    if (checkShipSunk(board, updatedShots, row, col)) {
      const shipName = SHIPS.find(s => s.name.charAt(0) === board[row][col])?.name || 'Barco';
      setTempAlert(`¡El oponente hundió uno de tus barcos! (${shipName})`);
    }

    if (playerShipsRemaining <= 0) {
      const winner = player === 'player1' ? 'player2' : 'player1';
      update(ref(database, `games/${roomId}`), {
        gameStatus: 'finished',
        winner,
      }).catch(error => console.error('Error setting game over:', error));
      Alert.alert('¡Derrota!', 'El oponente ha hundido toda tu flota.', [
        { text: 'Volver', onPress: () => navigation.navigate('Multiplayer') },
      ]);
    }
  };

  return {
    gameStatus,
    currentTurn,
    opponentReady,
    playerReady,
    setPlayerReady,
    gameActive,
    message,
    tempAlert,
    hasOpponent,
    waitTime,
    setupTime,
    handleShot,
    markReady,
    checkSunkShips,
  };
};