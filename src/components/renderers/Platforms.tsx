import React from 'react';
import { G, Rect, Image as SvgImage, Defs, ClipPath, Polygon } from 'react-native-svg';
import { CONFIG } from '../../game/config';
import type { Platform } from '../../game/types';

const platformImages: Record<string, any> = {
  normal: require('../../../assets/images/platform_normal.png'),
  ice: require('../../../assets/images/platform_ice.png'),
  caterpillar: require('../../../assets/images/platform_caterpillar.png'),
  moving: require('../../../assets/images/platform_moving.png'),
};

const SPRITE_BLOCK_COUNT = 6;

interface PlatformsProps {
  platforms: Platform[];
  cameraY: number;
}

function GroundPlatform({ platform, cameraY }: { platform: Platform; cameraY: number }) {
  const screenY = platform.y - cameraY;
  if (screenY > CONFIG.CANVAS_HEIGHT) return null;

  const blockSize = CONFIG.PLATFORM.BLOCK_SIZE;
  const groundHeight = CONFIG.CANVAS_HEIGHT - screenY;
  if (groundHeight <= 0) return null;

  const gridLines: React.ReactElement[] = [];
  for (let x = 0; x < CONFIG.CANVAS_WIDTH; x += blockSize) {
    gridLines.push(
      <Rect key={`v${x}`} x={x} y={screenY} width={1} height={groundHeight} fill={CONFIG.COLORS.GROUND_LINE} />
    );
  }
  for (let y = screenY; y < CONFIG.CANVAS_HEIGHT; y += blockSize) {
    gridLines.push(
      <Rect key={`h${y}`} x={0} y={y} width={CONFIG.CANVAS_WIDTH} height={1} fill={CONFIG.COLORS.GROUND_LINE} />
    );
  }

  return (
    <G>
      <Rect x={0} y={screenY} width={CONFIG.CANVAS_WIDTH} height={groundHeight} fill={CONFIG.COLORS.GROUND} />
      {gridLines}
    </G>
  );
}

// キャタピラ足場のデザイン定数
const CAT_PITCH = 14;       // セグメント繰り返し間隔（= blockSize）
const CAT_CORNER = 4;       // 八角形の角カットサイズ
const CAT_BAND_Y = 4;       // バンドのY開始位置（上から）
const CAT_BAND_H = 6;       // バンドの高さ
const CAT_YELLOW_W = 3;     // 黄色セクション幅（片側）
const CAT_WHITE_W = 8;      // 白セクション幅（3+8+3=14）
const CAT_GRAY = '#9B9EB0';
const CAT_YELLOW = '#FFE833';
const CAT_WHITE = '#FFFFFF';

function CaterpillarPlatform({ platform, cameraY, platformIndex }: { platform: Platform; cameraY: number; platformIndex: number }) {
  const screenY = platform.y - cameraY;
  const pH = CONFIG.PLATFORM.HEIGHT;

  if (screenY < -pH - 10 || screenY > CONFIG.CANVAS_HEIGHT) return null;

  const platformWidth = platform.blockCount * CONFIG.PLATFORM.BLOCK_SIZE;
  const dir = platform.caterpillarDirection || 1;
  const offset = (platform.caterpillarOffset || 0) * dir;

  const clipId = `cat${platformIndex}`;
  const segCount = Math.ceil(platformWidth / CAT_PITCH) + 2;

  const elements: React.ReactElement[] = [];

  // 1. 八角形（灰色）を先に描画（下層）
  for (let i = -1; i <= segCount; i++) {
    const sx = platform.x + i * CAT_PITCH + offset;
    const sy = screenY;

    const points = [
      `${sx + CAT_CORNER},${sy}`,
      `${sx + CAT_PITCH - CAT_CORNER},${sy}`,
      `${sx + CAT_PITCH},${sy + CAT_CORNER}`,
      `${sx + CAT_PITCH},${sy + pH - CAT_CORNER}`,
      `${sx + CAT_PITCH - CAT_CORNER},${sy + pH}`,
      `${sx + CAT_CORNER},${sy + pH}`,
      `${sx},${sy + pH - CAT_CORNER}`,
      `${sx},${sy + CAT_CORNER}`,
    ].join(' ');

    elements.push(
      <Polygon key={`g${i}`} points={points} fill={CAT_GRAY} />
    );
  }

  // 2. 中央バンド（黄色-白-黄色）を上に描画（上層）
  for (let i = -1; i <= segCount; i++) {
    const sx = platform.x + i * CAT_PITCH + offset;
    const by = screenY + CAT_BAND_Y;

    elements.push(
      <Rect key={`yl${i}`} x={sx} y={by} width={CAT_YELLOW_W} height={CAT_BAND_H} fill={CAT_YELLOW} />
    );
    elements.push(
      <Rect key={`wh${i}`} x={sx + CAT_YELLOW_W} y={by} width={CAT_WHITE_W} height={CAT_BAND_H} fill={CAT_WHITE} />
    );
    elements.push(
      <Rect key={`yr${i}`} x={sx + CAT_YELLOW_W + CAT_WHITE_W} y={by} width={CAT_YELLOW_W} height={CAT_BAND_H} fill={CAT_YELLOW} />
    );
  }

  return (
    <G>
      <Defs>
        <ClipPath id={clipId}>
          <Rect x={platform.x} y={screenY} width={platformWidth} height={pH} />
        </ClipPath>
      </Defs>
      <G clipPath={`url(#${clipId})`}>
        {elements}
      </G>
    </G>
  );
}

function FloatingPlatform({ platform, cameraY, platformIndex }: { platform: Platform; cameraY: number; platformIndex: number }) {
  // キャタピラ足場は専用レンダラーを使用
  if (platform.type === 'caterpillar') {
    return <CaterpillarPlatform platform={platform} cameraY={cameraY} platformIndex={platformIndex} />;
  }

  const screenY = platform.y - cameraY;
  const blockSize = CONFIG.PLATFORM.BLOCK_SIZE;

  if (screenY < -CONFIG.PLATFORM.HEIGHT - 10 || screenY > CONFIG.CANVAS_HEIGHT) return null;

  const platformType = platform.type || 'normal';
  const img = platformImages[platformType];

  const blocks: React.ReactElement[] = [];

  if (img) {
    // 足場全体を1つのClipPathでクリップし、スプライトシートをタイル配置
    const spriteWidth = blockSize * SPRITE_BLOCK_COUNT;
    const platformWidth = platform.blockCount * blockSize;
    const clipId = `pc${platformIndex}`;
    const tileCount = Math.ceil(platform.blockCount / SPRITE_BLOCK_COUNT);

    const tiles: React.ReactElement[] = [];
    for (let t = 0; t < tileCount; t++) {
      tiles.push(
        <SvgImage
          key={t}
          href={img}
          x={platform.x + t * spriteWidth}
          y={screenY}
          width={spriteWidth}
          height={CONFIG.PLATFORM.HEIGHT}
          preserveAspectRatio="none"
        />
      );
    }

    blocks.push(
      <G key="sprite">
        <Defs>
          <ClipPath id={clipId}>
            <Rect x={platform.x} y={screenY} width={platformWidth} height={CONFIG.PLATFORM.HEIGHT} />
          </ClipPath>
        </Defs>
        <G clipPath={`url(#${clipId})`}>
          {tiles}
        </G>
      </G>
    );
  } else {
    // フォールバック
    let mainColor: string = CONFIG.COLORS.PLATFORM;
    let lightColor: string = CONFIG.COLORS.PLATFORM_LIGHT;
    if (platform.type === 'ice') {
      mainColor = CONFIG.ICE.COLOR;
      lightColor = CONFIG.ICE.COLOR_LIGHT;
    }

    for (let i = 0; i < platform.blockCount; i++) {
      const blockX = platform.x + i * blockSize;
      blocks.push(
        <G key={i}>
          <Rect x={blockX} y={screenY} width={blockSize} height={CONFIG.PLATFORM.HEIGHT} fill={mainColor} />
          <Rect x={blockX} y={screenY} width={blockSize} height={2} fill={lightColor} />
          <Rect x={blockX + blockSize - 1} y={screenY} width={1} height={CONFIG.PLATFORM.HEIGHT} fill={CONFIG.COLORS.BACKGROUND} />
        </G>
      );
    }
  }

  // 動く足場の方向矢印
  let arrow: React.ReactElement | null = null;
  if (platform.type === 'moving') {
    const direction = platform.movingDirection || 1;
    const arrowColor = '#87CEEB';
    const arrowX = platform.x + platform.width / 2;
    const arrowY = screenY + CONFIG.PLATFORM.HEIGHT / 2;

    if (direction > 0) {
      arrow = (
        <G>
          <Rect x={arrowX + 2} y={arrowY} width={6} height={3} fill={arrowColor} />
          <Rect x={arrowX + 6} y={arrowY - 2} width={3} height={2} fill={arrowColor} />
          <Rect x={arrowX + 6} y={arrowY + 3} width={3} height={2} fill={arrowColor} />
        </G>
      );
    } else {
      arrow = (
        <G>
          <Rect x={arrowX - 8} y={arrowY} width={6} height={3} fill={arrowColor} />
          <Rect x={arrowX - 9} y={arrowY - 2} width={3} height={2} fill={arrowColor} />
          <Rect x={arrowX - 9} y={arrowY + 3} width={3} height={2} fill={arrowColor} />
        </G>
      );
    }
  }

  return (
    <G>
      {blocks}
      {arrow}
    </G>
  );
}

export function Platforms({ platforms, cameraY }: PlatformsProps) {
  return (
    <G>
      {platforms.map((platform, index) => {
        if (index === 0) {
          return <GroundPlatform key={index} platform={platform} cameraY={cameraY} />;
        }
        return <FloatingPlatform key={index} platform={platform} cameraY={cameraY} platformIndex={index} />;
      })}
    </G>
  );
}
