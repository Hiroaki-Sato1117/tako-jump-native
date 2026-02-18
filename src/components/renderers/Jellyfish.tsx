import React from 'react';
import { G, Circle, Path, Image as SvgImage } from 'react-native-svg';
import { CONFIG } from '../../game/config';
import type { Jellyfish as JellyfishType } from '../../game/types';

const jellyfishImg = require('../../../assets/images/jellyfish.png');

interface JellyfishProps {
  jellyfish: JellyfishType[];
  cameraY: number;
  frameTime: number;
}

function JellyfishItem({ jf, cameraY, frameTime }: { jf: JellyfishType; cameraY: number; frameTime: number }) {
  if (jf.isCollected) return null;

  const screenY = jf.y - cameraY;
  if (screenY < -jf.size || screenY > CONFIG.CANVAS_HEIGHT + jf.size) return null;

  const sparkles: React.ReactElement[] = [];
  const sparkleCount = 5;
  const sparkleColors = ['#FFFFFF', '#FFD700', '#FF69B4', '#00FFFF'];

  for (let i = 0; i < sparkleCount; i++) {
    const sparklePhase = (frameTime * 0.01 + jf.floatOffset + i * 1.3) % 2;
    const sparkleAlpha = sparklePhase < 1 ? sparklePhase : 2 - sparklePhase;

    if (sparkleAlpha > 0.3) {
      const sparkleAngle = (i * Math.PI * 2 / sparkleCount) + jf.floatOffset;
      const sparkleRadius = jf.size * 0.4 + Math.sin(frameTime * 0.003 + i) * 4;
      const sx = jf.x + jf.size / 2 + Math.cos(sparkleAngle) * sparkleRadius;
      const sy = screenY + jf.size / 2 + Math.sin(sparkleAngle) * sparkleRadius * 0.7;
      const size = 2 + sparkleAlpha * 2;

      const d1 = `M${sx},${sy - size} L${sx + size * 0.3},${sy} L${sx},${sy + size} L${sx - size * 0.3},${sy} Z`;
      const d2 = `M${sx - size},${sy} L${sx},${sy + size * 0.3} L${sx + size},${sy} L${sx},${sy - size * 0.3} Z`;

      sparkles.push(
        <G key={`sp${i}`} opacity={sparkleAlpha * 0.8}>
          <Path d={d1} fill={sparkleColors[i % sparkleColors.length]} />
          <Path d={d2} fill={sparkleColors[i % sparkleColors.length]} />
        </G>
      );
    }
  }

  const alphaFlicker = 0.85 + Math.sin(frameTime * 0.008 + jf.floatOffset) * 0.15;

  return (
    <G>
      <G opacity={alphaFlicker}>
        <SvgImage
          href={jellyfishImg}
          x={jf.x}
          y={screenY}
          width={jf.size}
          height={jf.size}
        />
      </G>
      {sparkles}
    </G>
  );
}

export function JellyfishRenderer({ jellyfish, cameraY, frameTime }: JellyfishProps) {
  return (
    <G>
      {jellyfish.map((jf, i) => (
        <JellyfishItem key={i} jf={jf} cameraY={cameraY} frameTime={frameTime} />
      ))}
    </G>
  );
}
