import React from 'react';
import { G, Rect, Defs, ClipPath, Image as SvgImage } from 'react-native-svg';
import { CONFIG } from '../../game/config';
import type { Platform } from '../../game/types';

const platformImages: Record<string, any> = {
  normal: require('../../../assets/images/platform_normal.png'),
  ice: require('../../../assets/images/platform_ice.png'),
  caterpillar: require('../../../assets/images/platform_caterpillar.png'),
  moving: require('../../../assets/images/platform_moving.png'),
};

// スプライトシートの情報（ソース画像のブロック数）
const SPRITE_INFO: Record<string, { blockCount: number }> = {
  normal: { blockCount: 6 },
  ice: { blockCount: 6 },
  caterpillar: { blockCount: 6 },
  moving: { blockCount: 6 },
};

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

function FloatingPlatform({ platform, cameraY, platformIndex }: { platform: Platform; cameraY: number; platformIndex: number }) {
  const screenY = platform.y - cameraY;
  const blockSize = CONFIG.PLATFORM.BLOCK_SIZE;

  if (screenY < -CONFIG.PLATFORM.HEIGHT - 10 || screenY > CONFIG.CANVAS_HEIGHT) return null;

  const platformType = platform.type || 'normal';
  const img = platformImages[platformType];
  const spriteInfo = SPRITE_INFO[platformType];

  // 画像でブロックを描画
  const blocks: React.ReactElement[] = [];
  if (img && spriteInfo) {
    // スプライトシートの1ブロック分の幅（表示上）
    const spriteBlockWidth = blockSize;
    const totalSpriteWidth = spriteBlockWidth * spriteInfo.blockCount;
    const clipId = `pclip-${platformIndex}`;

    blocks.push(
      <Defs key="defs">
        <ClipPath id={clipId}>
          <Rect x={platform.x} y={screenY} width={platform.width} height={CONFIG.PLATFORM.HEIGHT} />
        </ClipPath>
      </Defs>
    );

    // スプライトシートをブロックサイズ×ブロック数の幅で描画し、繰り返す
    for (let offset = 0; offset < platform.width; offset += totalSpriteWidth) {
      blocks.push(
        <SvgImage
          key={`img${offset}`}
          href={img}
          x={platform.x + offset}
          y={screenY}
          width={totalSpriteWidth}
          height={CONFIG.PLATFORM.HEIGHT}
          preserveAspectRatio="none"
          clipPath={`url(#${clipId})`}
        />
      );
    }
  } else {
    // フォールバック：画像がない場合は色で描画
    let mainColor: string = CONFIG.COLORS.PLATFORM;
    let lightColor: string = CONFIG.COLORS.PLATFORM_LIGHT;

    if (platform.type === 'ice') {
      mainColor = CONFIG.ICE.COLOR;
      lightColor = CONFIG.ICE.COLOR_LIGHT;
    } else if (platform.type === 'caterpillar') {
      mainColor = CONFIG.CATERPILLAR.COLOR_DARK;
      lightColor = CONFIG.CATERPILLAR.COLOR_LIGHT;
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

  // 動く足場・キャタピラの方向矢印
  let arrow: React.ReactElement | null = null;
  if (platform.type === 'moving' || platform.type === 'caterpillar') {
    const direction = platform.type === 'moving' ? (platform.movingDirection || 1) : (platform.caterpillarDirection || 1);
    const arrowColor = platform.type === 'moving' ? '#87CEEB' : '#FFFFFF';
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
