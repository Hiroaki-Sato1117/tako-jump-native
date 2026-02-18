import React from 'react';
import { Rect } from 'react-native-svg';
import { CONFIG } from '../../game/config';

export function Background() {
  return (
    <Rect
      x={0}
      y={0}
      width={CONFIG.CANVAS_WIDTH}
      height={CONFIG.CANVAS_HEIGHT}
      fill={CONFIG.COLORS.BACKGROUND}
    />
  );
}
