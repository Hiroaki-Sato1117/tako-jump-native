import React, { useCallback, useRef, useState } from 'react';
import { View, StyleSheet, Text, LayoutChangeEvent } from 'react-native';

interface MobileControlsProps {
  onDirectionChange: (direction: { x: number; y: number }) => void;
  onJumpStart: () => void;
  onJumpEnd: () => void;
  isCharging: boolean;
}

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export function MobileControls({
  onDirectionChange,
  onJumpStart,
  onJumpEnd,
  isCharging,
}: MobileControlsProps) {
  const [isLeftPressed, setIsLeftPressed] = useState(false);
  const [isRightPressed, setIsRightPressed] = useState(false);
  const [isJumpPressed, setIsJumpPressed] = useState(false);

  const leftRect = useRef<Rect>({ x: 0, y: 0, w: 0, h: 0 });
  const rightRect = useRef<Rect>({ x: 0, y: 0, w: 0, h: 0 });
  const jumpRect = useRef<Rect>({ x: 0, y: 0, w: 0, h: 0 });

  const prevState = useRef({ left: false, right: false, jump: false });
  const activeTouches = useRef<Map<number, { px: number; py: number }>>(new Map());

  const isInside = (px: number, py: number, r: Rect) =>
    px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h;

  const onDirectionChangeRef = useRef(onDirectionChange);
  const onJumpStartRef = useRef(onJumpStart);
  const onJumpEndRef = useRef(onJumpEnd);
  onDirectionChangeRef.current = onDirectionChange;
  onJumpStartRef.current = onJumpStart;
  onJumpEndRef.current = onJumpEnd;

  const processAllTouches = useCallback(() => {
    let left = false, right = false, jump = false;

    activeTouches.current.forEach(({ px, py }) => {
      if (isInside(px, py, leftRect.current)) left = true;
      if (isInside(px, py, rightRect.current)) right = true;
      if (isInside(px, py, jumpRect.current)) jump = true;
    });

    const prev = prevState.current;

    if (left !== prev.left || right !== prev.right) {
      setIsLeftPressed(left);
      setIsRightPressed(right);
      let x = 0;
      if (left && !right) x = -1;
      else if (right && !left) x = 1;
      onDirectionChangeRef.current({ x, y: x !== 0 ? -1 : 0 });
    }

    if (jump !== prev.jump) {
      setIsJumpPressed(jump);
      if (jump) onJumpStartRef.current();
      else onJumpEndRef.current();
    }

    prevState.current = { left, right, jump };
  }, []);

  const handleTouchStart = useCallback((e: any) => {
    const { identifier, pageX, pageY } = e.nativeEvent;
    activeTouches.current.set(identifier, { px: pageX, py: pageY });
    processAllTouches();
  }, [processAllTouches]);

  const handleTouchMove = useCallback((e: any) => {
    const { identifier, pageX, pageY } = e.nativeEvent;
    activeTouches.current.set(identifier, { px: pageX, py: pageY });
    processAllTouches();
  }, [processAllTouches]);

  const handleTouchEnd = useCallback((e: any) => {
    const { identifier } = e.nativeEvent;
    activeTouches.current.delete(identifier);
    processAllTouches();
  }, [processAllTouches]);

  const handleTouchCancel = useCallback((e: any) => {
    const { identifier } = e.nativeEvent;
    activeTouches.current.delete(identifier);
    processAllTouches();
  }, [processAllTouches]);

  const measureButton = (ref: React.MutableRefObject<Rect>) => (_e: LayoutChangeEvent) => {
    // nativeEvent.target を使ってスクリーン座標を取得
    (_e.target as any).measureInWindow((x: number, y: number, w: number, h: number) => {
      ref.current = { x, y, w, h };
    });
  };

  const getButtonStyle = (pressed: boolean, active: boolean = false) => ({
    backgroundColor: pressed ? '#E8A87C' : (active ? '#FFD93D' : '#3D3A6A'),
    borderColor: pressed ? '#F0C8A8' : (active ? '#FFE066' : '#6B5B7A'),
  });

  const leftStyle = getButtonStyle(isLeftPressed);
  const rightStyle = getButtonStyle(isRightPressed);
  const jumpStyle = getButtonStyle(isJumpPressed, isCharging);
  const leftColor = isLeftPressed ? '#FFF' : '#9B8AC4';
  const rightColor = isRightPressed ? '#FFF' : '#9B8AC4';
  const jumpColor = (isJumpPressed || isCharging) ? '#FFF' : '#9B8AC4';

  return (
    <View
      style={styles.container}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchCancel}
    >
      <View style={styles.directionButtons}>
        <View
          onLayout={measureButton(leftRect)}
          style={[styles.dirButton, {
            backgroundColor: leftStyle.backgroundColor,
            borderColor: leftStyle.borderColor,
          }]}
        >
          <Text style={[styles.arrowText, { color: leftColor }]}>◀</Text>
        </View>

        <View
          onLayout={measureButton(rightRect)}
          style={[styles.dirButton, {
            backgroundColor: rightStyle.backgroundColor,
            borderColor: rightStyle.borderColor,
          }]}
        >
          <Text style={[styles.arrowText, { color: rightColor }]}>▶</Text>
        </View>
      </View>

      <View
        onLayout={measureButton(jumpRect)}
        style={[styles.jumpButton, {
          backgroundColor: jumpStyle.backgroundColor,
          borderColor: jumpStyle.borderColor,
        }]}
      >
        <Text style={[styles.jumpText, { color: jumpColor }]}>▲</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 24,
    paddingBottom: 60,
  },
  directionButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  dirButton: {
    width: 88,
    height: 88,
    borderWidth: 4,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  jumpButton: {
    width: 88,
    height: 88,
    borderWidth: 4,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowText: {
    fontSize: 28,
  },
  jumpText: {
    fontSize: 34,
  },
});
