import React from 'react';
import { View, TouchableOpacity, Image, Text } from 'react-native';
import { sharedStyles } from '../styles/sharedStyles';
import { WATER_IMAGE, SHOT_IMAGE, BOARD_SIZE } from '../utils/gameUtils';

const Board = ({ board, shots, onCellPress, disabled, ships }) => {
  const renderCell = (row, col) => {
    const isSetupPhase = !shots;
    const cellValue = isSetupPhase ? board[row][col] : shots[row][col];
    const shipValue = board[row][col];

    if (isSetupPhase) {
      if (cellValue !== 0) {
        const ship = ships.find(s => s.name.charAt(0) === cellValue);
        return (
          <TouchableOpacity
            key={`${row}-${col}`}
            style={[sharedStyles.cell, { backgroundColor: ship?.color || '#FF5733', opacity: disabled ? 0.6 : 1 }]}
            onPress={() => onCellPress(row, col)}
            disabled={disabled}
          >
            <Text> </Text>
          </TouchableOpacity>
        );
      }
      return (
        <TouchableOpacity
          key={`${row}-${col}`}
          style={[sharedStyles.cell, { opacity: disabled ? 0.6 : 1 }]}
          onPress={() => onCellPress(row, col)}
          disabled={disabled}
        >
          <Text> </Text>
        </TouchableOpacity>
      );
    }

    if (cellValue === 'X') {
      return (
        <TouchableOpacity
          key={`${row}-${col}`}
          style={[sharedStyles.cell, shipValue !== 0 && { backgroundColor: ships.find(s => s.name.charAt(0) === shipValue)?.color || '#FF5733' }]}
          onPress={() => onCellPress(row, col)}
          disabled={disabled || cellValue !== ' '}
        >
          <Image source={SHOT_IMAGE} style={sharedStyles.cellImage} />
        </TouchableOpacity>
      );
    }

    if (cellValue === '·') {
      return (
        <TouchableOpacity
          key={`${row}-${col}`}
          style={sharedStyles.cell}
          onPress={() => onCellPress(row, col)}
          disabled={disabled || cellValue !== ' '}
        >
          <Image source={WATER_IMAGE} style={sharedStyles.cellImage} />
        </TouchableOpacity>
      );
    }

    if (shipValue !== 0 && !isSetupPhase) {
      const ship = ships.find(s => s.name.charAt(0) === shipValue);
      return (
        <TouchableOpacity
          key={`${row}-${col}`}
          style={[sharedStyles.cell, { backgroundColor: ship?.color || '#FF5733' }]}
          onPress={() => onCellPress(row, col)}
          disabled={disabled || cellValue !== ' '}
        >
          <Text> </Text>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        key={`${row}-${col}`}
        style={sharedStyles.cell}
        onPress={() => onCellPress(row, col)}
        disabled={disabled || cellValue !== ' '}
      >
        <Text> </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={sharedStyles.board}>
      {Array.from({ length: BOARD_SIZE }).map((_, row) => (
        <View key={`row-${row}`} style={sharedStyles.row}>
          {Array.from({ length: BOARD_SIZE }).map((_, col) => renderCell(row, col))}
        </View>
      ))}
    </View>
  );
};

export default Board;