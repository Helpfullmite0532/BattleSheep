import { useState } from 'react';
import { Alert } from 'react-native';
import { database } from '../firebaseConfig';
import { ref, set, get, update } from 'firebase/database';

export const useMultiplayerLobby = (navigation) => {
  const [loading, setLoading] = useState(false);
  const [roomIdInput, setRoomIdInput] = useState('');

  const generateRoomId = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';
    for (let i = 0; i < 4; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  };

  const createRoom = async () => {
    setLoading(true);
    try {
      const roomId = generateRoomId();
      await set(ref(database, `games/${roomId}`), {
        player1: { ready: false },
        gameStatus: 'waiting',
        createdAt: Date.now(),
      });
      navigation.navigate('Game', { roomId, player: 'player1' });
    } catch (error) {
      Alert.alert('Error', 'No se pudo crear la sala');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const joinRoom = async () => {
    if (!roomIdInput.trim()) {
      Alert.alert('Error', 'Ingresa un código de sala');
      return;
    }
    setLoading(true);
    try {
      const roomRef = ref(database, `games/${roomIdInput}`);
      const snapshot = await get(roomRef);

      if (!snapshot.exists()) {
        Alert.alert('Sala no encontrada', 'Verifica el código e intenta de nuevo');
        return;
      }

      const roomData = snapshot.val();

      if (roomData.player2) {
        Alert.alert('Sala llena', 'Ya hay dos jugadores en esta sala');
        return;
      }

      await update(ref(database, `games/${roomIdInput}`), {
        player2: { ready: false },
        gameStatus: 'setup'
      });

      navigation.navigate('Game', { roomId: roomIdInput, player: 'player2' });
    } catch (error) {
      Alert.alert('Error', 'No se pudo unir a la sala');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    roomIdInput,
    setRoomIdInput,
    createRoom,
    joinRoom,
  };
};
