import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import GameScreenMenu from './screens/GameScreenMenu';
import MultiplayerScreen from './screens/MultiplayerScreen';
import GameScreen from './screens/GameScreen';
import SinglePlayerScreenAI from './screens/SinglePlayerScreenAI';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Menu">
        <Stack.Screen name="Menu" component={GameScreenMenu} options={{ title: 'BattleShip' }} />
        <Stack.Screen name="SinglePlayerAI" component={SinglePlayerScreenAI} options={{ title: 'Un Jugador (vs IA)' }} />
        <Stack.Screen name="Multiplayer" component={MultiplayerScreen} options={{ title: 'Multijugador' }} />
        <Stack.Screen name="Game" component={GameScreen} options={{ title: 'Partida' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
