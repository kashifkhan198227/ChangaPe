import React from 'react';
import { View, StyleSheet } from 'react-native';

interface CrossMarkProps {
  size: number;
  color: string;
  opacity?: number;
  thickness?: number;
}

export default function CrossMark({ size, color, opacity = 1, thickness = 2.5 }: CrossMarkProps) {
  const diagonal = Math.sqrt(size * size + size * size);

  return (
    <View style={[styles.container, { width: size, height: size }]} pointerEvents="none">
      {/* top-left to bottom-right */}
      <View
        style={[
          styles.line,
          {
            width: diagonal,
            height: thickness,
            backgroundColor: color,
            opacity,
            transform: [{ rotate: '45deg' }],
          },
        ]}
      />
      {/* top-right to bottom-left */}
      <View
        style={[
          styles.line,
          {
            width: diagonal,
            height: thickness,
            backgroundColor: color,
            opacity,
            transform: [{ rotate: '-45deg' }],
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  line: {
    position: 'absolute',
    borderRadius: 1,
  },
});
