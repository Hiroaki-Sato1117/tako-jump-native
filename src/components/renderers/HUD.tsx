import React from 'react';
import { G, Rect, Text as SvgText } from 'react-native-svg';
import { CONFIG } from '../../game/config';
import type { GameState } from '../../game/types';

interface HUDProps {
  state: GameState;
}

export function HUD({ state }: HUDProps) {
  const minutes = Math.floor(state.elapsedTime / 60);
  const seconds = Math.floor(state.elapsedTime % 60);
  const ms = Math.floor((state.elapsedTime % 1) * 100);
  const timeText = `${minutes}:${seconds.toString().padStart(2, '0')}:${ms.toString().padStart(2, '0')}`;

  const lives: React.ReactElement[] = [];
  for (let i = 0; i < CONFIG.LIVES; i++) {
    const color = i < state.lives ? '#FFFFFF' : '#666666';
    const eyeColor = i < state.lives ? '#000000' : '#444444';
    lives.push(
      <G key={`life${i}`}>
        <Rect x={10 + i * 28} y={85} width={20} height={24} fill={color} />
        <Rect x={13 + i * 28} y={92} width={5} height={6} fill={eyeColor} />
        <Rect x={22 + i * 28} y={92} width={5} height={6} fill={eyeColor} />
      </G>
    );
  }

  return (
    <G>
      {/* ポーズボタン */}
      <Rect x={10} y={10} width={40} height={40} fill="rgba(0,0,0,0.5)" />
      <Rect x={18} y={18} width={8} height={24} fill="#FFFFFF" />
      <Rect x={34} y={18} width={8} height={24} fill="#FFFFFF" />

      {/* ステージ */}
      <SvgText x={10} y={72} fill="#FFFFFF" fontSize={16} fontWeight="bold" fontFamily="Courier">
        {`STAGE ${state.stage}`}
      </SvgText>

      {/* スコア */}
      <SvgText x={CONFIG.CANVAS_WIDTH - 10} y={32} fill="#FFFFFF" fontSize={16} fontWeight="bold" fontFamily="Courier" textAnchor="end">
        {`${state.score}`}
      </SvgText>

      {/* ライフ */}
      {lives}

      {/* タイム */}
      <SvgText x={CONFIG.CANVAS_WIDTH - 10} y={56} fill="#FFFFFF" fontSize={16} fontWeight="bold" fontFamily="Courier" textAnchor="end">
        {timeText}
      </SvgText>

      {/* 操作説明 */}
      <SvgText x={10} y={CONFIG.CANVAS_HEIGHT - 10} fill="rgba(255,255,255,0.7)" fontSize={10} fontWeight="bold" fontFamily="Courier">
        BUTTON:CHARGE  ←→:DIR
      </SvgText>
    </G>
  );
}
