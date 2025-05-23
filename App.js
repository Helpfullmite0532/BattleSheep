import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Image, Button } from 'react-native';
//Sorry cuz I document the code in english, but I am not a native speaker and yeah, some functions are in spanish. Just for fun:)

const BOARD_SIZE = 10;
const SHIPS = [
  { name: "Portaaviones", size: 5, color: '#FF5733' },
  { name: "Acorazado", size: 4, color: '#33FF57' },
  { name: "Crucero", size: 3, color: '#3357FF' },
  { name: "Submarino", size: 3, color: '#F033FF' },
  { name: "Destructor", size: 2, color: '#FF33F0' },
];


const WATER_IMAGE = require('./assets/img/agua.jpg');
const SHOT_IMAGE = require('./assets/img/shot.png');

/*
I duuno why these doesnt work
remote images since local images are not working for some reason, maybe the path is wrong or something like that */
//const WATER_IMAGE = { uri: 'https://eduuag-my.sharepoint.com/:i:/g/personal/roberto_gudino_edu_uag_mx/EfxJyvmMt1BMlxOFnjxoq7oBi7mF2EkIwJ7N0mBerp_QQg?e=Egoyhf' };
//const SHOT_IMAGE = { uri: 'https://eduuag-my.sharepoint.com/:i:/g/personal/roberto_gudino_edu_uag_mx/EVLFX5nnNuVBnCzXaVLI9EIBCCk_-yc-Q7egSGH3foYakA?e=9R1Adx' };

export default function App() {

  const [isStarted, setIsStarted] = useState(false);

  return (
    isStarted ? <GameComponent /> :
    <View style={styles.menuContainer}>

       <Text style={styles.menuTitle}>BATTLESHIP</Text>
        
        <TouchableOpacity style={styles.menuButton} onPress={ () => setIsStarted(true) }>
          <Text style={styles.menuButtonText}>Un Jugador</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.menuButton} onPress={() => Alert.alert("Próximamente", "El modo multijugador estará disponible pronto!")}>
          <Text style={styles.menuButtonText}>Multijugador</Text>
        </TouchableOpacity>
    </View>
  )
}

 function GameComponent() {
  //Menu CATCHED FROM A YT CHANNEL IN RUSSHIAN LOL
  const [gameState, setGameState] = useState('menu'); // 'menu', 'singlePlayer', 'multiPlayer'
  const [board, setBoard] = useState(() => Array(BOARD_SIZE).fill().map(() => Array(BOARD_SIZE).fill(0)));
  const [playerBoard, setPlayerBoard] = useState(() => Array(BOARD_SIZE).fill().map(() => Array(BOARD_SIZE).fill(' ')));
  const [shipsRemaining, setShipsRemaining] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [setupPhase, setSetupPhase] = useState(true);
  const [currentShipIndex, setCurrentShipIndex] = useState(0);
  const [orientation, setOrientation] = useState('horizontal');

  // Initialize game (for single player)
  useEffect(() => {
    initGame();
  }, []);

  const initGame = () => {
  const newBoard = Array(BOARD_SIZE).fill().map(() => Array(BOARD_SIZE).fill(0));
  const newPlayerBoard = Array(BOARD_SIZE).fill().map(() => Array(BOARD_SIZE).fill(' '));
    
  setBoard(newBoard);
  setPlayerBoard(newPlayerBoard);
  setShipsRemaining(SHIPS.reduce((sum, ship) => sum + ship.size, 0));
  setGameOver(false);
  setSetupPhase(true);
  setCurrentShipIndex(0);
  setOrientation('horizontal');
  setGameState('singlePlayer');
  };

  // Toggle ship orientation
  const toggleOrientation = () => {
    setOrientation(prev => prev === 'horizontal' ? 'vertical' : 'horizontal');
  };

  const placeShipsRandomly = () => {
    const newBoard = Array(BOARD_SIZE).fill().map(() => Array(BOARD_SIZE).fill(0));
    
    for (const ship of SHIPS) {
      let placed = false;
      
      while (!placed) {
        const randomOrientation = Math.floor(Math.random() * 2);
        let row, col;
        
        if (randomOrientation === 0) { // Horizontal
          row = Math.floor(Math.random() * BOARD_SIZE);
          col = Math.floor(Math.random() * (BOARD_SIZE - ship.size + 1));
          
          let canPlace = true;
          for (let i = 0; i < ship.size; i++) {
            if (newBoard[row][col + i] !== 0) {
              canPlace = false;
              break;
            }
          }
          
          if (canPlace) {
            for (let i = 0; i < ship.size; i++) {
              newBoard[row][col + i] = ship.name.charAt(0);
            }
            placed = true;
          }
        } else { // Vertical
          row = Math.floor(Math.random() * (BOARD_SIZE - ship.size + 1));
          col = Math.floor(Math.random() * BOARD_SIZE);
          
          let canPlace = true;
          for (let i = 0; i < ship.size; i++) {
            if (newBoard[row + i][col] !== 0) {
              canPlace = false;
              break;
            }
          }
          
          if (canPlace) {
            for (let i = 0; i < ship.size; i++) {
              newBoard[row + i][col] = ship.name.charAt(0);
            }
            placed = true;
          }
        }
      }
    }
    
    setBoard(newBoard);
    setCurrentShipIndex(SHIPS.length); // Mark all ships as placed
    Alert.alert("Barcos colocados", "Todos los barcos han sido colocados aleatoriamente");
  };

  const handleSetupCellPress = (row, col) => {
    if (!setupPhase || currentShipIndex >= SHIPS.length) return;

    const ship = SHIPS[currentShipIndex];
    const newBoard = board.map(arr => [...arr]);

    let canPlace = true;
    if (orientation === 'horizontal') {
      if (col + ship.size > BOARD_SIZE) {
        canPlace = false;
      } else {
        for (let i = 0; i < ship.size; i++) {
          if (newBoard[row][col + i] !== 0) {
            canPlace = false;
            break;
          }
        }
      }
    } else { // vertical
      if (row + ship.size > BOARD_SIZE) {
        canPlace = false;
      } else {
        for (let i = 0; i < ship.size; i++) {
          if (newBoard[row + i][col] !== 0) {
            canPlace = false;
            break;
          }
        }
      }
    }

    if (!canPlace) {
      Alert.alert("Posición inválida", "No se puede colocar el barco aquí");
      return;
    }

    const shipInitial = ship.name.charAt(0);
    if (orientation === 'horizontal') {
      for (let i = 0; i < ship.size; i++) {
        newBoard[row][col + i] = shipInitial;
      }
    } else {
      for (let i = 0; i < ship.size; i++) {
        newBoard[row + i][col] = shipInitial;
      }
    }

    setBoard(newBoard);
    
    if (currentShipIndex < SHIPS.length - 1) {
      setCurrentShipIndex(currentShipIndex + 1);
    } else {
      setSetupPhase(false);
    }
  };

  const handleCellPress = (row, col) => {
    if (gameOver || playerBoard[row][col] !== ' ') return;
    
    const newPlayerBoard = playerBoard.map(arr => [...arr]);
    
    if (board[row][col] === 0) {
      newPlayerBoard[row][col] = '·';
    } else {
      const shipInitial = board[row][col];
      newPlayerBoard[row][col] = 'X';
      
      if (isShipSunk(shipInitial, newPlayerBoard)) {
        const shipName = SHIPS.find(s => s.name.charAt(0) === shipInitial)?.name || 'Barco';
        Alert.alert("¡Hundido!", `¡Has hundido el ${shipName}!`);
      }
      
      setShipsRemaining(prev => prev - 1);
    }
    
    setPlayerBoard(newPlayerBoard);
    
    if (shipsRemaining - 1 === 0) {
      setGameOver(true);
      Alert.alert(
        "¡Felicidades!", 
        "¡Has hundido toda la flota enemiga!",
        [
          { text: "Jugar de nuevo", onPress: initGame }
        ]
      );
    }
  };

  const isShipSunk = (shipInitial, currentPlayerBoard) => {
    if (!board) return false;
    
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        if (board[r][c] === shipInitial && currentPlayerBoard[r][c] !== 'X') {
          return false;
        }
      }
    }
    return true;
  };

  const renderCell = (row, col) => {
    if (!playerBoard || !playerBoard[row]) return null;
    
    const cellValue = setupPhase ? board[row][col] : playerBoard[row][col];
    let cellContent = null;

    if (setupPhase) {
      // Setup phase - show colored squares for ships   it should work, im tired:)
      if (cellValue !== 0) {
        const ship = SHIPS.find(s => s.name.charAt(0) === cellValue);
        return (
          <TouchableOpacity
            key={`${row}-${col}`}
            style={[styles.cell, { backgroundColor: ship?.color || '#FF5733' }]}
            onPress={() => setupPhase ? handleSetupCellPress(row, col) : handleCellPress(row, col)}
          >
            <Text style={styles.cellText}> </Text>
          </TouchableOpacity>
        );
      }
    } else {
      // Game phase - show images for water and hits
      if (cellValue === '·') {
        return (
          <TouchableOpacity
            key={`${row}-${col}`}
            style={styles.cell}
            onPress={() => handleCellPress(row, col)}
          >
            <Image source={WATER_IMAGE} style={styles.cellImage} />
          </TouchableOpacity>
        );
      } else if (cellValue === 'X') {
        return (
          <TouchableOpacity
            key={`${row}-${col}`}
            style={styles.cell}
            onPress={() => handleCellPress(row, col)}
          >
            <Image source={SHOT_IMAGE} style={styles.cellImage} />
          </TouchableOpacity>
        );
      }
    }

    return (
      <TouchableOpacity
        key={`${row}-${col}`}
        style={styles.cell}
        onPress={() => setupPhase ? handleSetupCellPress(row, col) : handleCellPress(row, col)}
      >
        <Text style={styles.cellText}> </Text>
      </TouchableOpacity>
    );
  };

  const startGame = () => {
    if (currentShipIndex < SHIPS.length - 1) {
      Alert.alert("Barcos pendientes", "Debes colocar todos los barcos antes de comenzar");
      return;
    }
    setSetupPhase(false);
  };

  return (
    <View style={styles.container}>
        <>
          <Text style={styles.title}>BATTLESHIP</Text>
          
          {setupPhase ? (
            <>
              <Text style={styles.subtitle}>Coloca tus barcos</Text>
              <Text style={styles.shipInfo}>
                Barco actual: {SHIPS[currentShipIndex]?.name} ({SHIPS[currentShipIndex]?.size} casillas)
              </Text>
              <TouchableOpacity style={styles.orientationButton} onPress={toggleOrientation}>
                <Text style={styles.orientationButtonText}>
                  Orientación: {orientation === 'horizontal' ? 'Horizontal' : 'Vertical'}
                </Text>
              </TouchableOpacity>
              
              <View style={styles.buttonRow}>
                <TouchableOpacity style={styles.randomButton} onPress={placeShipsRandomly}>
                  <Text style={styles.randomButtonText}>Colocar Aleatoriamente</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              <Text style={styles.subtitle}>Barcos restantes: {shipsRemaining}</Text>
              {gameOver && (
                <TouchableOpacity style={styles.restartButton} onPress={() => setGameState('menu')}>
                  <Text style={styles.restartButtonText}>Volver al Menú</Text>
                </TouchableOpacity>
              )}
            </>
          )}
          
          <View style={styles.board}>
            {Array(BOARD_SIZE).fill().map((_, row) => (
              <View key={`row-${row}`} style={styles.row}>
                {Array(BOARD_SIZE).fill().map((_, col) => renderCell(row, col))}
              </View>
            ))}
          </View>
          
          {setupPhase && (
            <TouchableOpacity style={styles.startButton} onPress={startGame}>
              <Text style={styles.startButtonText}>Comenzar Juego</Text>
            </TouchableOpacity>
          )}
        </>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  menuContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  menuTitle: {
    fontSize: 40,
    fontWeight: 'bold',
    marginBottom: 50,
    color: '#333',
  },
  menuButton: {
    width: '80%',
    padding: 20,
    backgroundColor: '#2196F3',
    borderRadius: 10,
    marginVertical: 10,
    alignItems: 'center',
  },
  menuButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 20,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 20,
    color: '#555',
  },
  shipInfo: {
    fontSize: 16,
    marginBottom: 10,
    color: '#333',
    fontWeight: 'bold',
  },
  board: {
    borderWidth: 1,
    borderColor: '#999',
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    width: 30,
    height: 30,
    borderWidth: 1,
    borderColor: '#999',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden', // Important for image cells i think not enough documentation on the web site
  },
  cellImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  cellText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonRow: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  orientationButton: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#4CAF50',
    borderRadius: 5,
  },
  orientationButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  randomButton: {
    padding: 10,
    backgroundColor: '#9C27B0',
    borderRadius: 5,
    marginRight: 10,
  },
  randomButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  startButton: {
    marginTop: 10,
    padding: 15,
    backgroundColor: '#2196F3',
    borderRadius: 5,
  },
  startButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
  restartButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#4CAF50',
    borderRadius: 5,
  },
  restartButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});