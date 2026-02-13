import React from 'react';
import { G, Circle, Path, Rect } from 'react-native-svg';
import { CONFIG } from '../../game/config';
import type { Eel } from '../../game/types';

interface EelsProps {
  eels: Eel[];
  cameraY: number;
  frameTime: number;
}

function EelItem({ eel, cameraY, frameTime }: { eel: Eel; cameraY: number; frameTime: number }) {
  if (eel.isCollected) return null;

  const screenY = eel.y - cameraY;
  if (screenY < -eel.size || screenY > CONFIG.CANVAS_HEIGHT + eel.size) return null;

  const centerX = eel.x + eel.size / 2;
  const centerY = screenY + eel.size / 2;
  const radius = eel.size / 2 - 4;

  // 体のパスを生成（円弧を線分で近似）
  const steps = 20;
  const startAngle = eel.rotation;
  const endAngle = eel.rotation + Math.PI * 1.7;

  let bodyD = '';
  for (let i = 0; i <= steps; i++) {
    const a = startAngle + (endAngle - startAngle) * (i / steps);
    const x = centerX + Math.cos(a) * radius;
    const y = centerY + Math.sin(a) * radius;
    bodyD += i === 0 ? `M${x},${y}` : ` L${x},${y}`;
  }

  let highlightD = '';
  const hlStart = eel.rotation + 0.2;
  const hlEnd = eel.rotation + Math.PI * 1.5;
  for (let i = 0; i <= steps; i++) {
    const a = hlStart + (hlEnd - hlStart) * (i / steps);
    const x = centerX + Math.cos(a) * radius;
    const y = centerY + Math.sin(a) * radius;
    highlightD += i === 0 ? `M${x},${y}` : ` L${x},${y}`;
  }

  const headX = centerX + Math.cos(startAngle) * radius;
  const headY = centerY + Math.sin(startAngle) * radius;

  const tailAngle = endAngle;
  const tailX = centerX + Math.cos(tailAngle) * radius;
  const tailY = centerY + Math.sin(tailAngle) * radius;
  const tailD = `M${tailX},${tailY} L${tailX - 8},${tailY + 4} L${tailX - 8},${tailY - 4} Z`;

  const sparkleOffset = Math.sin(frameTime * 0.01 + eel.x) * 3;

  return (
    <G>
      <Path d={bodyD} stroke={CONFIG.EEL.COLOR} strokeWidth={8} strokeLinecap="round" fill="none" />
      <Path d={highlightD} stroke={CONFIG.EEL.COLOR_LIGHT} strokeWidth={4} strokeLinecap="round" fill="none" />
      <Circle cx={headX} cy={headY} r={6} fill={CONFIG.EEL.COLOR} />
      <Circle cx={headX + 2} cy={headY - 2} r={2} fill="#FFFFFF" />
      <Circle cx={headX + 2.5} cy={headY - 1.5} r={1} fill="#000000" />
      <Path d={tailD} fill={CONFIG.EEL.COLOR} />
      <Rect x={eel.x + 4} y={screenY + 4 + sparkleOffset} width={2} height={2} fill="rgba(255,255,255,0.6)" />
      <Rect x={eel.x + eel.size - 6} y={screenY + eel.size - 8 - sparkleOffset} width={2} height={2} fill="rgba(255,255,255,0.6)" />
    </G>
  );
}

export function Eels({ eels, cameraY, frameTime }: EelsProps) {
  return (
    <G>
      {eels.map((eel, i) => (
        <EelItem key={i} eel={eel} cameraY={cameraY} frameTime={frameTime} />
      ))}
    </G>
  );
}
