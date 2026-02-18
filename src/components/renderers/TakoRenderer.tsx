import React from 'react';
import { G, Image as SvgImage, Path } from 'react-native-svg';
import { CONFIG } from '../../game/config';
import type { Tako } from '../../game/types';

interface TakoRendererProps {
  tako: Tako;
  cameraY: number;
  frameTime: number;
}

const takoImages: { [key: string]: any } = {
  '0': require('../../../assets/images/tako-0.png'),
  '25': require('../../../assets/images/tako-25.png'),
  '50': require('../../../assets/images/tako-50.png'),
  '75': require('../../../assets/images/tako-75.png'),
  '100-orange': require('../../../assets/images/tako-100-orange.png'),
  '100-yellow': require('../../../assets/images/tako-100-yellow.png'),
  'dead-0': require('../../../assets/images/tako-dead-0.png'),
  'dead-1': require('../../../assets/images/tako-dead-1.png'),
  'dead-2': require('../../../assets/images/tako-dead-2.png'),
};

export function TakoRenderer({ tako, cameraY, frameTime }: TakoRendererProps) {
  const screenY = tako.position.y - cameraY;

  let imageName: string;
  if (tako.state === 'dead') {
    const deadElapsed = tako.deadTime ? frameTime - tako.deadTime : 0;
    if (deadElapsed < 300) imageName = 'dead-0';
    else if (deadElapsed < 600) imageName = 'dead-1';
    else imageName = 'dead-2';
  } else if (tako.chargeRatio >= 1) {
    imageName = Math.floor(frameTime / 100) % 2 === 0 ? '100-orange' : '100-yellow';
  } else if (tako.chargeRatio >= 0.75) imageName = '75';
  else if (tako.chargeRatio >= 0.5) imageName = '50';
  else if (tako.chargeRatio >= 0.25) imageName = '25';
  else imageName = '0';

  const shrinkRatio = 1 - tako.chargeRatio * 0.3;
  const drawHeight = CONFIG.TAKO.HEIGHT * shrinkRatio;
  const yOffset = CONFIG.TAKO.HEIGHT - drawHeight;
  const adjustedScreenY = screenY + yOffset;

  // 空中ジャンプのキラキラ
  const sparkles: React.ReactElement[] = [];
  if (tako.hasAirJump && tako.state !== 'dead') {
    const sparkleColors = ['#FF69B4', '#FFD700', '#00FFFF', '#FFFFFF'];
    for (let i = 0; i < 6; i++) {
      const angle = (frameTime * 0.003 + (i * Math.PI * 2) / 6) % (Math.PI * 2);
      const radius = 18 + Math.sin(frameTime * 0.005 + i) * 4;
      const sx = tako.position.x + CONFIG.TAKO.WIDTH / 2 + Math.cos(angle) * radius;
      const sy = screenY + CONFIG.TAKO.HEIGHT / 2 + Math.sin(angle) * radius * 0.6;
      const colorIndex = (Math.floor(frameTime * 0.01) + i) % sparkleColors.length;
      const size = 3 + Math.sin(frameTime * 0.008 + i) * 1.5;
      const alpha = 0.5 + Math.sin(frameTime * 0.01 + i * 2) * 0.3;

      const d1 = `M${sx},${sy - size} L${sx + size * 0.3},${sy} L${sx},${sy + size} L${sx - size * 0.3},${sy} Z`;
      const d2 = `M${sx - size},${sy} L${sx},${sy + size * 0.3} L${sx + size},${sy} L${sx},${sy - size * 0.3} Z`;

      sparkles.push(
        <G key={`s${i}`} opacity={alpha}>
          <Path d={d1} fill={sparkleColors[colorIndex]} />
          <Path d={d2} fill={sparkleColors[colorIndex]} />
        </G>
      );
    }
  }

  // 左右反転
  const flipX = !tako.facingRight;
  const imgX = flipX ? -(tako.position.x + CONFIG.TAKO.WIDTH) : tako.position.x;
  const scaleX = flipX ? -1 : 1;

  return (
    <G>
      <G transform={`scale(${scaleX}, 1)`}>
        <SvgImage
          href={takoImages[imageName]}
          x={imgX}
          y={adjustedScreenY}
          width={CONFIG.TAKO.WIDTH}
          height={drawHeight}
        />
      </G>
      {sparkles}
    </G>
  );
}
