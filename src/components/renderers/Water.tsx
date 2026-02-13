import React from 'react';
import { G, Image as SvgImage } from 'react-native-svg';
import { CONFIG } from '../../game/config';
import type { Water as WaterType } from '../../game/types';

const waterImg = require('../../../assets/images/water.png');

const TILE_W = CONFIG.CANVAS_WIDTH; // 390
const TILE_H = Math.ceil(TILE_W * (1329 / 1146)); // ≈ 452

interface WaterProps {
  water: WaterType;
  cameraY: number;
}

export function Water({ water, cameraY }: WaterProps) {
  const screenY = water.y - cameraY;
  if (screenY > CONFIG.CANVAS_HEIGHT) return null;

  const y = Math.max(0, Math.floor(screenY));
  if (y >= CONFIG.CANVAS_HEIGHT) return null;

  // 横スクロール
  const scrollOffset = ((water.waveOffset * 0.3) % TILE_W + TILE_W) % TILE_W;

  // 固定2枚で横スクロール（安定したキーを使用）
  const x0 = -scrollOffset;
  const x1 = x0 + TILE_W;

  return (
    <G>
      <SvgImage key="w0" href={waterImg} x={x0} y={y} width={TILE_W} height={TILE_H} />
      <SvgImage key="w1" href={waterImg} x={x1} y={y} width={TILE_W} height={TILE_H} />
      {y + TILE_H < CONFIG.CANVAS_HEIGHT && (
        <>
          <SvgImage key="w2" href={waterImg} x={x0} y={y + TILE_H} width={TILE_W} height={TILE_H} />
          <SvgImage key="w3" href={waterImg} x={x1} y={y + TILE_H} width={TILE_W} height={TILE_H} />
        </>
      )}
    </G>
  );
}
