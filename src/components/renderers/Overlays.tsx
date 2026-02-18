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
      <Rect x={30} y={230} width={CONFIG.CANVAS_WIDTH - 60} height={400} fill="rgba(0,0,0,0.8)" rx={8} />
      <SvgText x={CX} y={310} fill="#FFFFFF" fontSize={36} fontWeight="bold" fontFamily="Courier" textAnchor="middle">TAKO</SvgText>
      <SvgText x={CX} y={360} fill="#FFFFFF" fontSize={36} fontWeight="bold" fontFamily="Courier" textAnchor="middle">JUMP</SvgText>
      <SvgText x={CX} y={430} fill="#9B8AC4" fontSize={18} fontWeight="bold" fontFamily="Courier" textAnchor="middle">HIGH SCORE</SvgText>
      <SvgText x={CX} y={465} fill="#FFD93D" fontSize={28} fontWeight="bold" fontFamily="Courier" textAnchor="middle">{`${state.highScore}`}</SvgText>
      <SvgText x={CX} y={570} fill="#FFFFFF" fontSize={18} fontWeight="bold" fontFamily="Courier" textAnchor="middle">TAP SCREEN</SvgText>
      {__DEV__ && (
        <G>
          <Rect x={CONFIG.CANVAS_WIDTH - 70} y={10} width={60} height={28} rx={4} fill="#E8A87C" />
          <SvgText x={CONFIG.CANVAS_WIDTH - 40} y={29} fill="#2D2A5A" fontSize={12} fontWeight="bold" fontFamily="Courier" textAnchor="middle">DEV</SvgText>
        </G>
      )}
    </G>
  );
}

const ALL_CLEAR_COLORS = ['#FFD700', '#FF6B6B', '#00FFCC', '#FF69B4', '#87CEEB', '#FFFFFF'];

function ClearedOverlay({ state, frameTime }: { state: GameState; frameTime: number }) {
  const isAllClear = state.stage >= CONFIG.STAGES.length;
  const hsColor = Math.floor(frameTime / 200) % 2 === 0 ? '#FFD700' : '#FFFFFF';

  return (
    <G>
      <Rect x={30} y={180} width={CONFIG.CANVAS_WIDTH - 60} height={460} fill="rgba(0,0,0,0.8)" rx={8} />

      {isAllClear ? (
        <G>
          {/* ALL CLEAR - 虹色サイクル＋影＋大文字 */}
          <SvgText x={CX + 2} y={252} fill="#000000" fontSize={36} fontWeight="bold" fontFamily="Courier" textAnchor="middle" opacity={0.5}>ALL CLEAR!!</SvgText>
          <SvgText x={CX} y={250} fill={ALL_CLEAR_COLORS[Math.floor(frameTime / 120) % ALL_CLEAR_COLORS.length]} fontSize={36} fontWeight="bold" fontFamily="Courier" textAnchor="middle">ALL CLEAR!!</SvgText>
          {/* 装飾キラキラ */}
          {[0, 1, 2, 3, 4, 5].map(i => {
            const sparkleX = 60 + (i * 50) + Math.sin(frameTime * 0.005 + i) * 10;
            const sparkleY = 270 + Math.cos(frameTime * 0.004 + i * 2) * 8;
            const sparkleColor = ALL_CLEAR_COLORS[(Math.floor(frameTime / 100) + i) % ALL_CLEAR_COLORS.length];
            const size = 3 + Math.sin(frameTime * 0.008 + i) * 2;
            return (
              <G key={i}>
                <Rect x={sparkleX - size / 2} y={sparkleY - 1} width={size} height={2} fill={sparkleColor} />
                <Rect x={sparkleX - 1} y={sparkleY - size / 2} width={2} height={size} fill={sparkleColor} />
              </G>
            );
          })}
        </G>
      ) : (
        <SvgText x={CX} y={250} fill="#FFFFFF" fontSize={28} fontWeight="bold" fontFamily="Courier" textAnchor="middle">STAGE CLEAR!</SvgText>
      )}

      <SvgText x={CX} y={320} fill="#9B8AC4" fontSize={18} fontWeight="bold" fontFamily="Courier" textAnchor="middle">HIGH SCORE</SvgText>
      <SvgText x={CX} y={355} fill="#FFD93D" fontSize={28} fontWeight="bold" fontFamily="Courier" textAnchor="middle">{`${state.highScore}`}</SvgText>

      <SvgText x={CX} y={415} fill="#9B8AC4" fontSize={18} fontWeight="bold" fontFamily="Courier" textAnchor="middle">SCORE</SvgText>
      <SvgText x={CX} y={450} fill="#FFFFFF" fontSize={28} fontWeight="bold" fontFamily="Courier" textAnchor="middle">{`${state.score}`}</SvgText>

      {state.isHighScoreUpdated && (
        <G>
          <SvgText x={CX} y={505} fill={hsColor} fontSize={20} fontWeight="bold" fontFamily="Courier" textAnchor="middle">HIGH SCORE</SvgText>
          <SvgText x={CX} y={535} fill={hsColor} fontSize={20} fontWeight="bold" fontFamily="Courier" textAnchor="middle">UPDATED!!</SvgText>
        </G>
      )}

      <SvgText x={CX} y={600} fill="#FFFFFF" fontSize={18} fontWeight="bold" fontFamily="Courier" textAnchor="middle">TAP SCREEN</SvgText>
    </G>
  );
}

function GameOverOverlay({ state, frameTime }: { state: GameState; frameTime: number }) {
  const hsColor = Math.floor(frameTime / 200) % 2 === 0 ? '#FFD700' : '#FFFFFF';

  return (
    <G>
      <Rect x={30} y={180} width={CONFIG.CANVAS_WIDTH - 60} height={460} fill="rgba(0,0,0,0.8)" rx={8} />
      <SvgText x={CX} y={250} fill="#FF6B6B" fontSize={28} fontWeight="bold" fontFamily="Courier" textAnchor="middle">GAME OVER</SvgText>

      <SvgText x={CX} y={320} fill="#9B8AC4" fontSize={18} fontWeight="bold" fontFamily="Courier" textAnchor="middle">HIGH SCORE</SvgText>
      <SvgText x={CX} y={355} fill="#FFD93D" fontSize={28} fontWeight="bold" fontFamily="Courier" textAnchor="middle">{`${state.highScore}`}</SvgText>

      <SvgText x={CX} y={415} fill="#9B8AC4" fontSize={18} fontWeight="bold" fontFamily="Courier" textAnchor="middle">SCORE</SvgText>
      <SvgText x={CX} y={450} fill="#FFFFFF" fontSize={28} fontWeight="bold" fontFamily="Courier" textAnchor="middle">{`${state.score}`}</SvgText>

      {state.isHighScoreUpdated && (
        <G>
          <SvgText x={CX} y={505} fill={hsColor} fontSize={20} fontWeight="bold" fontFamily="Courier" textAnchor="middle">HIGH SCORE</SvgText>
          <SvgText x={CX} y={535} fill={hsColor} fontSize={20} fontWeight="bold" fontFamily="Courier" textAnchor="middle">UPDATED!!</SvgText>
        </G>
      )}

      <SvgText x={CX} y={600} fill="#FFFFFF" fontSize={18} fontWeight="bold" fontFamily="Courier" textAnchor="middle">TAP SCREEN</SvgText>
    </G>
  );
}

function PausedOverlay() {
  const btnX = 80;
  const btnW = CONFIG.CANVAS_WIDTH - 160;
  const btnH = 44;
  return (
    <G>
      <Rect x={0} y={0} width={CONFIG.CANVAS_WIDTH} height={CONFIG.CANVAS_HEIGHT} fill="rgba(0,0,0,0.5)" />
      <Rect x={60} y={280} width={CONFIG.CANVAS_WIDTH - 120} height={350} fill="rgba(0,0,0,0.8)" rx={8} />
      <SvgText x={CX} y={330} fill="#FFFFFF" fontSize={20} fontWeight="bold" fontFamily="Courier" textAnchor="middle">PAUSED</SvgText>
      {/* CONTINUE ボタン */}
      <Rect x={btnX} y={370} width={btnW} height={btnH} rx={6} fill="#3D3A6A" stroke="#9B8AC4" strokeWidth={2} />
      <SvgText x={CX} y={398} fill="#FFFFFF" fontSize={16} fontWeight="bold" fontFamily="Courier" textAnchor="middle">CONTINUE</SvgText>
      {/* RESTART ボタン */}
      <Rect x={btnX} y={440} width={btnW} height={btnH} rx={6} fill="#3D3A6A" stroke="#E8A87C" strokeWidth={2} />
      <SvgText x={CX} y={468} fill="#E8A87C" fontSize={16} fontWeight="bold" fontFamily="Courier" textAnchor="middle">RESTART</SvgText>
      {/* TITLE ボタン */}
      <Rect x={btnX} y={510} width={btnW} height={btnH} rx={6} fill="#3D3A6A" stroke="#666666" strokeWidth={2} />
      <SvgText x={CX} y={538} fill="#AAAAAA" fontSize={16} fontWeight="bold" fontFamily="Courier" textAnchor="middle">TITLE</SvgText>
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
