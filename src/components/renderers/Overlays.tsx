import React from 'react';
import { G, Rect, Text as SvgText } from 'react-native-svg';
import { CONFIG } from '../../game/config';
import type { GameState } from '../../game/types';

interface OverlayProps {
  state: GameState;
  frameTime: number;
}

const CX = CONFIG.CANVAS_WIDTH / 2;

function TitleOverlay({ state }: { state: GameState }) {
  return (
    <G>
      <Rect x={40} y={250} width={CONFIG.CANVAS_WIDTH - 80} height={350} fill="rgba(0,0,0,0.8)" />
      <SvgText x={CX} y={320} fill="#FFFFFF" fontSize={24} fontWeight="bold" fontFamily="Courier" textAnchor="middle">TAKO</SvgText>
      <SvgText x={CX} y={360} fill="#FFFFFF" fontSize={24} fontWeight="bold" fontFamily="Courier" textAnchor="middle">JUMP</SvgText>
      <SvgText x={CX} y={420} fill="#FFFFFF" fontSize={12} fontWeight="bold" fontFamily="Courier" textAnchor="middle">HIGH SCORE</SvgText>
      <SvgText x={CX} y={450} fill="#FFFFFF" fontSize={12} fontWeight="bold" fontFamily="Courier" textAnchor="middle">{`${state.highScore}`}</SvgText>
      <SvgText x={CX} y={540} fill="#FFFFFF" fontSize={12} fontWeight="bold" fontFamily="Courier" textAnchor="middle">TAP BUTTON</SvgText>
    </G>
  );
}

function ClearedOverlay({ state, frameTime }: { state: GameState; frameTime: number }) {
  const isAllClear = state.stage >= CONFIG.STAGES.length;
  const clearText = isAllClear ? 'ALL CLEAR!!' : 'STAGE CLEAR!';
  const clearColor = isAllClear
    ? (Math.floor(frameTime / 200) % 2 === 0 ? '#FFD700' : '#FFFFFF')
    : '#FFFFFF';
  const hsColor = Math.floor(frameTime / 200) % 2 === 0 ? '#FFD700' : '#FFFFFF';

  return (
    <G>
      <Rect x={40} y={200} width={CONFIG.CANVAS_WIDTH - 80} height={400} fill="rgba(0,0,0,0.8)" />
      <SvgText x={CX} y={260} fill={clearColor} fontSize={16} fontWeight="bold" fontFamily="Courier" textAnchor="middle">{clearText}</SvgText>
      <SvgText x={CX} y={320} fill="#FFFFFF" fontSize={12} fontWeight="bold" fontFamily="Courier" textAnchor="middle">HIGH SCORE</SvgText>
      <SvgText x={CX} y={350} fill="#FFFFFF" fontSize={12} fontWeight="bold" fontFamily="Courier" textAnchor="middle">{`${state.highScore}`}</SvgText>
      <SvgText x={CX} y={400} fill="#FFFFFF" fontSize={12} fontWeight="bold" fontFamily="Courier" textAnchor="middle">SCORE</SvgText>
      <SvgText x={CX} y={430} fill="#FFFFFF" fontSize={12} fontWeight="bold" fontFamily="Courier" textAnchor="middle">{`${state.score}`}</SvgText>
      {state.isHighScoreUpdated && (
        <G>
          <SvgText x={CX} y={480} fill={hsColor} fontSize={12} fontWeight="bold" fontFamily="Courier" textAnchor="middle">HIGH SCORE</SvgText>
          <SvgText x={CX} y={510} fill={hsColor} fontSize={12} fontWeight="bold" fontFamily="Courier" textAnchor="middle">UPDATED!!</SvgText>
        </G>
      )}
      <SvgText x={CX} y={560} fill="#FFFFFF" fontSize={12} fontWeight="bold" fontFamily="Courier" textAnchor="middle">TAP BUTTON</SvgText>
    </G>
  );
}

function GameOverOverlay({ state, frameTime }: { state: GameState; frameTime: number }) {
  const hsColor = Math.floor(frameTime / 200) % 2 === 0 ? '#FFD700' : '#FFFFFF';

  return (
    <G>
      <Rect x={40} y={200} width={CONFIG.CANVAS_WIDTH - 80} height={400} fill="rgba(0,0,0,0.8)" />
      <SvgText x={CX} y={260} fill="#FFFFFF" fontSize={16} fontWeight="bold" fontFamily="Courier" textAnchor="middle">GAME OVER</SvgText>
      <SvgText x={CX} y={320} fill="#FFFFFF" fontSize={12} fontWeight="bold" fontFamily="Courier" textAnchor="middle">HIGH SCORE</SvgText>
      <SvgText x={CX} y={350} fill="#FFFFFF" fontSize={12} fontWeight="bold" fontFamily="Courier" textAnchor="middle">{`${state.highScore}`}</SvgText>
      <SvgText x={CX} y={400} fill="#FFFFFF" fontSize={12} fontWeight="bold" fontFamily="Courier" textAnchor="middle">SCORE</SvgText>
      <SvgText x={CX} y={430} fill="#FFFFFF" fontSize={12} fontWeight="bold" fontFamily="Courier" textAnchor="middle">{`${state.score}`}</SvgText>
      {state.isHighScoreUpdated && (
        <G>
          <SvgText x={CX} y={480} fill={hsColor} fontSize={12} fontWeight="bold" fontFamily="Courier" textAnchor="middle">HIGH SCORE</SvgText>
          <SvgText x={CX} y={510} fill={hsColor} fontSize={12} fontWeight="bold" fontFamily="Courier" textAnchor="middle">UPDATED!!</SvgText>
        </G>
      )}
      <SvgText x={CX} y={560} fill="#FFFFFF" fontSize={12} fontWeight="bold" fontFamily="Courier" textAnchor="middle">TAP BUTTON</SvgText>
    </G>
  );
}

function PausedOverlay() {
  return (
    <G>
      <Rect x={0} y={0} width={CONFIG.CANVAS_WIDTH} height={CONFIG.CANVAS_HEIGHT} fill="rgba(0,0,0,0.5)" />
      <Rect x={60} y={280} width={CONFIG.CANVAS_WIDTH - 120} height={280} fill="rgba(0,0,0,0.8)" />
      <SvgText x={CX} y={330} fill="#FFFFFF" fontSize={16} fontWeight="bold" fontFamily="Courier" textAnchor="middle">PAUSED</SvgText>
      <SvgText x={CX} y={410} fill="#FFFFFF" fontSize={12} fontWeight="bold" fontFamily="Courier" textAnchor="middle">CONTINUE</SvgText>
      <SvgText x={CX} y={480} fill="#FFFFFF" fontSize={12} fontWeight="bold" fontFamily="Courier" textAnchor="middle">RESTART</SvgText>
      <SvgText x={CX} y={530} fill="#AAAAAA" fontSize={10} fontWeight="bold" fontFamily="Courier" textAnchor="middle">TAP TO SELECT</SvgText>
    </G>
  );
}

export function Overlays({ state, frameTime }: OverlayProps) {
  switch (state.screen) {
    case 'title': return <TitleOverlay state={state} />;
    case 'cleared': return <ClearedOverlay state={state} frameTime={frameTime} />;
    case 'gameover': return <GameOverOverlay state={state} frameTime={frameTime} />;
    case 'paused': return <PausedOverlay />;
    default: return null;
  }
}
