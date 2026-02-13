import React from 'react';
import { G, Rect, Circle, Path } from 'react-native-svg';
import { CONFIG } from '../../game/config';
import type { Star } from '../../game/types';

interface StarsProps {
  stars: Star[];
  cameraY: number;
}

function StarItem({ star, cameraY }: { star: Star; cameraY: number }) {
  const screenY = star.y - cameraY;
  if (screenY < -20 || screenY > CONFIG.CANVAS_HEIGHT + 20) return null;

  const color = star.type === 'sparkle' ? CONFIG.COLORS.STAR_BRIGHT : CONFIG.COLORS.STAR;

  switch (star.type) {
    case 'dot':
      return <Rect x={star.x} y={screenY} width={star.size} height={star.size} fill={color} />;

    case 'cross': {
      const h = star.size / 2;
      return (
        <G>
          <Rect x={star.x - h} y={screenY - 1} width={star.size} height={2} fill={color} />
          <Rect x={star.x - 1} y={screenY - h} width={2} height={star.size} fill={color} />
        </G>
      );
    }

    case 'crescent':
      return (
        <G>
          <Circle cx={star.x} cy={screenY} r={star.size / 2} fill={CONFIG.COLORS.CRESCENT} />
          <Circle cx={star.x + 3} cy={screenY - 2} r={star.size / 2.5} fill={CONFIG.COLORS.BACKGROUND} />
        </G>
      );

    case 'sparkle': {
      const s = star.size;
      const d1 = `M${star.x},${screenY - s / 2} L${star.x + s / 4},${screenY} L${star.x},${screenY + s / 2} L${star.x - s / 4},${screenY} Z`;
      const d2 = `M${star.x - s / 2},${screenY} L${star.x},${screenY + s / 4} L${star.x + s / 2},${screenY} L${star.x},${screenY - s / 4} Z`;
      return (
        <G>
          <Path d={d1} fill={color} />
          <Path d={d2} fill={color} />
        </G>
      );
    }

    default:
      return null;
  }
}

export function Stars({ stars, cameraY }: StarsProps) {
  return (
    <G>
      {stars.map((star, i) => (
        <StarItem key={i} star={star} cameraY={cameraY} />
      ))}
    </G>
  );
}
