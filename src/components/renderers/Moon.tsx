import React from 'react';
import { G, Circle } from 'react-native-svg';
import { CONFIG } from '../../game/config';
import type { Moon as MoonType } from '../../game/types';

interface MoonProps {
  moon: MoonType;
  cameraY: number;
}

export function Moon({ moon, cameraY }: MoonProps) {
  const screenY = moon.y - cameraY;
  if (screenY < -moon.size || screenY > CONFIG.CANVAS_HEIGHT) return null;

  return (
    <G>
      <Circle
        cx={moon.x + moon.size / 2}
        cy={screenY + moon.size / 2}
        r={moon.size / 2}
        fill={CONFIG.COLORS.MOON}
      />
      <Circle
        cx={moon.x + moon.size / 2 + moon.size * 0.25}
        cy={screenY + moon.size / 2 - moon.size * 0.1}
        r={moon.size / 2.5}
        fill={CONFIG.COLORS.BACKGROUND}
      />
    </G>
  );
}
