import React, { useRef, useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Dimensions, Pressable, Text, ScrollView } from 'react-native';
import Svg from 'react-native-svg';
import {
  CONFIG,
  applyGravity,
  updatePosition,
  checkPlatformCollision,
  wrapScreen,
  checkMoonCollision,
  checkWaterCollision,
  generatePlatforms,
  generateMoon,
  generateStars,
  generateEels,
  generateJellyfish,
  setRandomSeed,
  initWater,
  calculateScore,
  applyIceFriction,
  applyCaterpillarMovement,
  applyMovingPlatformMovement,
  checkEelCollision,
  checkJellyfishCollision,
  updateMovingPlatforms,
  checkFallenOffPlatform,
  clampHorizontalVelocity,
  loadHighScore,
  saveHighScore,
} from '../game';
import type { Platform, GameState } from '../game';
import { useGameLoop } from '../hooks';
import { MobileControls } from './MobileControls';
import {
  Background,
  Stars,
  Moon,
  Platforms,
  TakoRenderer,
  Water,
  Eels,
  JellyfishRenderer,
  HUD,
  Overlays,
} from './renderers';

// ジャンプ計算（キーボード版を移植、モバイルでは方向ボタン）
function calculateMobileJump(
  chargeRatio: number,
  direction: { x: number; y: number },
  slidingVelocity: number = 0
): { vx: number; vy: number; facingRight: boolean } {
  let angle = Math.PI / 2;

  if (direction.x !== 0) {
    if (direction.x < 0) {
      angle = Math.PI * 0.556;
    } else {
      angle = Math.PI * 0.444;
    }
  }

  const power = CONFIG.JUMP.MIN_VELOCITY +
    (CONFIG.JUMP.MAX_VELOCITY - CONFIG.JUMP.MIN_VELOCITY) * chargeRatio;

  const baseVx = power * Math.cos(angle) * CONFIG.HORIZONTAL_FACTOR;
  const vx = baseVx + slidingVelocity;

  return {
    vx,
    vy: -power * Math.sin(angle),
    facingRight: slidingVelocity !== 0 ? slidingVelocity > 0 : direction.x >= 0,
  };
}

const createInitialState = (stage: number = 1, score: number = 0, lives: number = CONFIG.LIVES): GameState => {
  const stageConfig = CONFIG.STAGES[stage - 1];
  setRandomSeed(stage);
  const platforms = generatePlatforms(stageConfig);
  const moon = generateMoon(platforms);
  const eels = generateEels(stageConfig, platforms);
  const jellyfish = generateJellyfish(stageConfig, platforms);
  const totalHeight = stageConfig.totalHeight * CONFIG.CANVAS_HEIGHT;

  return {
    screen: 'title',
    stage,
    score,
    highScore: loadHighScore(),
    lives,
    stageStartTime: 0,
    elapsedTime: 0,
    tako: {
      position: { x: platforms[0].x + 50, y: platforms[0].y - CONFIG.TAKO.HEIGHT },
      velocity: { x: 0, y: 0 },
      state: 'idle',
      chargeStartTime: null,
      chargeRatio: 0,
      isGrounded: true,
      facingRight: true,
      airChargeLockedVelocityX: null,
      deadTime: null,
      hasAirJump: false,
    },
    platforms,
    eels,
    jellyfish,
    moon,
    water: initWater(stageConfig),
    camera: {
      y: platforms[0].y - CONFIG.CANVAS_HEIGHT + 200,
      targetY: platforms[0].y - CONFIG.CANVAS_HEIGHT + 200,
    },
    stars: generateStars(totalHeight),
    isHighScoreUpdated: false,
  };
};

const now = () => Date.now();

export function Game() {
  const [state, setState] = useState<GameState>(createInitialState);
  const [frameTime, setFrameTime] = useState(now());
  const [showDevPanel, setShowDevPanel] = useState(false);

  // タッチ入力状態
  const touchInputRef = useRef({
    direction: { x: 0, y: 0 },
    isJumpPressed: false,
    jumpJustReleased: false,
  });

  const jumpDirectionRef = useRef({ x: 0, y: -1 });
  const waterDelayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentPlatformRef = useRef<Platform | null>(null);

  // タッチコントロールのハンドラー
  const handleDirectionChange = useCallback((direction: { x: number; y: number }) => {
    touchInputRef.current.direction = direction;
  }, []);

  const handleJumpStart = useCallback(() => {
    touchInputRef.current.isJumpPressed = true;
    touchInputRef.current.jumpJustReleased = false;
  }, []);

  const handleJumpEnd = useCallback(() => {
    touchInputRef.current.isJumpPressed = false;
    touchInputRef.current.jumpJustReleased = true;
  }, []);

  // ゲームを開始
  const startGame = useCallback(() => {
    const newState = createInitialState();
    newState.screen = 'playing';
    newState.stageStartTime = now();

    const stageConfig = CONFIG.STAGES[0];
    waterDelayTimerRef.current = setTimeout(() => {
      setState(prev => ({
        ...prev,
        water: { ...prev.water, isRising: true },
      }));
    }, stageConfig.waterDelay);

    setState(newState);
  }, []);

  // 開発モード：指定ステージから開始
  const startGameAtStage = useCallback((stageNum: number) => {
    const newState = createInitialState(stageNum);
    newState.screen = 'playing';
    newState.stageStartTime = now();

    const stageConfig = CONFIG.STAGES[stageNum - 1];
    if (waterDelayTimerRef.current) clearTimeout(waterDelayTimerRef.current);
    waterDelayTimerRef.current = setTimeout(() => {
      setState(prev => ({
        ...prev,
        water: { ...prev.water, isRising: true },
      }));
    }, stageConfig.waterDelay);

    setState(newState);
    setShowDevPanel(false);
  }, []);

  // 次のステージへ
  const nextStage = useCallback(() => {
    setState(prev => {
      const nextStageNum = prev.stage + 1;
      if (nextStageNum > CONFIG.STAGES.length) {
        return createInitialState(1, 0, CONFIG.LIVES);
      }

      const stageConfig = CONFIG.STAGES[nextStageNum - 1];
      setRandomSeed(nextStageNum);
      const platforms = generatePlatforms(stageConfig);
      const moon = generateMoon(platforms);
      const eels = generateEels(stageConfig, platforms);
      const jellyfish = generateJellyfish(stageConfig, platforms);
      const totalHeight = stageConfig.totalHeight * CONFIG.CANVAS_HEIGHT;

      if (waterDelayTimerRef.current) clearTimeout(waterDelayTimerRef.current);
      waterDelayTimerRef.current = setTimeout(() => {
        setState(p => ({
          ...p,
          water: { ...p.water, isRising: true },
        }));
      }, stageConfig.waterDelay);

      return {
        ...prev,
        screen: 'playing',
        stage: nextStageNum,
        stageStartTime: now(),
        elapsedTime: 0,
        tako: {
          position: { x: platforms[0].x + 50, y: platforms[0].y - CONFIG.TAKO.HEIGHT },
          velocity: { x: 0, y: 0 },
          state: 'idle',
          chargeStartTime: null,
          chargeRatio: 0,
          isGrounded: true,
          facingRight: true,
          airChargeLockedVelocityX: null,
          deadTime: null,
          hasAirJump: false,
        },
        platforms,
        eels,
        jellyfish,
        moon,
        water: initWater(stageConfig),
        camera: {
          y: platforms[0].y - CONFIG.CANVAS_HEIGHT + 200,
          targetY: platforms[0].y - CONFIG.CANVAS_HEIGHT + 200,
        },
        stars: generateStars(totalHeight),
      };
    });
  }, []);

  // タイトルに戻る
  const returnToTitle = useCallback(() => {
    if (waterDelayTimerRef.current) clearTimeout(waterDelayTimerRef.current);
    setState(createInitialState());
  }, []);

  // ポーズ
  const pauseGame = useCallback(() => {
    if (waterDelayTimerRef.current) clearTimeout(waterDelayTimerRef.current);
    setState(prev => prev.screen === 'playing' ? { ...prev, screen: 'paused' } : prev);
  }, []);

  const resumeGame = useCallback(() => {
    setState(prev => {
      if (prev.screen !== 'paused') return prev;
      const stageConfig = CONFIG.STAGES[prev.stage - 1];
      if (!prev.water.isRising) {
        waterDelayTimerRef.current = setTimeout(() => {
          setState(p => ({ ...p, water: { ...p.water, isRising: true } }));
        }, stageConfig.waterDelay);
      }
      return { ...prev, screen: 'playing' };
    });
  }, []);

  const restartFromBeginning = useCallback(() => {
    if (waterDelayTimerRef.current) clearTimeout(waterDelayTimerRef.current);
    const newState = createInitialState();
    newState.screen = 'playing';
    newState.stageStartTime = now();
    setState(newState);

    const stageConfig = CONFIG.STAGES[0];
    waterDelayTimerRef.current = setTimeout(() => {
      setState(prev => ({ ...prev, water: { ...prev.water, isRising: true } }));
    }, stageConfig.waterDelay);
  }, []);

  // ゲームループ
  const updateGame = useCallback((deltaTime: number) => {
    const touchInput = touchInputRef.current;
    const isJumpPressed = touchInput.isJumpPressed;
    const jumpJustReleased = touchInput.jumpJustReleased;
    const arrowDirection = touchInput.direction;

    if (touchInput.jumpJustReleased) {
      touchInput.jumpJustReleased = false;
    }

    setFrameTime(now());

    setState(prev => {
      if (prev.screen !== 'playing') return prev;

      let newState = { ...prev };
      let tako = { ...newState.tako };

      newState.elapsedTime = (now() - newState.stageStartTime) / 1000;

      const onIcePlatform = currentPlatformRef.current?.type === 'ice' && tako.isGrounded;

      // チャージ処理
      if (isJumpPressed && tako.state !== 'dead') {
        if (tako.chargeStartTime === null) {
          tako.chargeStartTime = now();
          tako.state = 'charging';
          if (!tako.isGrounded) {
            tako.airChargeLockedVelocityX = tako.velocity.x;
          }
        }
        tako.chargeRatio = Math.min(
          (now() - tako.chargeStartTime) / CONFIG.JUMP.MAX_CHARGE_TIME,
          1
        );
        if (tako.isGrounded && !onIcePlatform && (arrowDirection.x !== 0 || arrowDirection.y !== 0)) {
          jumpDirectionRef.current = { x: arrowDirection.x, y: arrowDirection.y };
        }
        if (!tako.isGrounded && arrowDirection.x !== 0) {
          tako.velocity.x += arrowDirection.x * CONFIG.TAKO.AIR_CONTROL_CHARGING * CONFIG.HORIZONTAL_FACTOR * deltaTime * 60;
        }
      }

      // ジャンプ発動（wasCharging不要：1フレーム内のpress+releaseでも反応する）
      const wasCharging = tako.chargeStartTime !== null;
      const isOnIce = currentPlatformRef.current?.type === 'ice';
      if (jumpJustReleased && tako.state !== 'dead') {
        const chargeRatio = wasCharging ? tako.chargeRatio : 0;
        const jumpDir = wasCharging
          ? jumpDirectionRef.current
          : (arrowDirection.x !== 0 ? { x: arrowDirection.x, y: arrowDirection.y } : { x: 0, y: -1 });

        if (!tako.isGrounded) {
          if (tako.hasAirJump) {
            const { vx, vy, facingRight } = calculateMobileJump(
              chargeRatio, jumpDir, 0
            );
            tako.velocity = { x: vx, y: vy };
            tako.state = 'jumping';
            tako.facingRight = facingRight;
            tako.hasAirJump = false;
          }
          tako.chargeStartTime = null;
          tako.chargeRatio = 0;
          tako.airChargeLockedVelocityX = null;
        } else {
          const slidingVelocity = isOnIce ? tako.velocity.x : 0;
          const { vx, vy, facingRight } = calculateMobileJump(
            chargeRatio, jumpDir, slidingVelocity
          );
          tako.velocity = { x: vx, y: vy };
          tako.state = 'jumping';
          tako.isGrounded = false;
          tako.facingRight = facingRight;
          tako.chargeStartTime = null;
          tako.chargeRatio = 0;
        }
        jumpDirectionRef.current = { x: 0, y: -1 };
      }

      // 空中微調整
      if (!tako.isGrounded && tako.state !== 'dead' && tako.airChargeLockedVelocityX === null) {
        if (arrowDirection.x !== 0) {
          tako.velocity.x += arrowDirection.x * CONFIG.TAKO.AIR_CONTROL * CONFIG.HORIZONTAL_FACTOR * deltaTime * 60;
        }
      }

      // 空中摩擦（横速度を毎フレーム減衰）
      if (!tako.isGrounded && tako.state !== 'dead') {
        tako.velocity.x *= Math.pow(CONFIG.TAKO.AIR_FRICTION, deltaTime * 60);
      }

      // 物理演算
      if (tako.state !== 'dead') {
        tako = applyGravity(tako);
        tako = updatePosition(tako);

        const collision = checkPlatformCollision(tako, newState.platforms, newState.camera.y);
        tako = collision.tako;

        if (collision.landed && collision.landedPlatform) {
          currentPlatformRef.current = collision.landedPlatform;
        }
        if (!tako.isGrounded) {
          currentPlatformRef.current = null;
        }

        tako = applyIceFriction(tako, currentPlatformRef.current);
        tako = checkFallenOffPlatform(tako, currentPlatformRef.current);
        tako = applyCaterpillarMovement(tako, currentPlatformRef.current);
        tako = applyMovingPlatformMovement(tako, currentPlatformRef.current);
        tako = clampHorizontalVelocity(tako);
        tako = wrapScreen(tako);

        const eelResult = checkEelCollision(tako, newState.eels);
        tako = eelResult.tako;
        newState.eels = eelResult.eels;

        const jellyfishResult = checkJellyfishCollision(tako, newState.jellyfish);
        tako = jellyfishResult.tako;
        newState.jellyfish = jellyfishResult.jellyfish;
      }

      newState.tako = tako;

      // うなぎの回転
      newState.eels = newState.eels.map(eel => ({
        ...eel,
        rotation: eel.rotation + CONFIG.EEL.ROTATION_SPEED,
      }));

      // キャタピラのアニメーション（速度 = タコの運搬速度と一致）
      newState.platforms = newState.platforms.map(platform => {
        if (platform.type === 'caterpillar') {
          return {
            ...platform,
            caterpillarOffset: ((platform.caterpillarOffset || 0) + CONFIG.CATERPILLAR.SPEED) % (CONFIG.CATERPILLAR.SEGMENT_WIDTH * 2),
          };
        }
        return platform;
      });

      // 動く足場の更新
      newState.platforms = updateMovingPlatforms(newState.platforms);

      // 月との衝突（クリア）
      if (checkMoonCollision(tako, newState.moon) && tako.state !== 'dead') {
        const clearTime = newState.elapsedTime;
        const stageConfig = CONFIG.STAGES[newState.stage - 1];
        const stageScore = calculateScore(newState.stage, clearTime, stageConfig);
        const newScore = newState.score + stageScore;

        let isHighScoreUpdated = false;
        if (newScore > newState.highScore) {
          saveHighScore(newScore);
          isHighScoreUpdated = true;
        }

        if (waterDelayTimerRef.current) clearTimeout(waterDelayTimerRef.current);

        return {
          ...newState,
          screen: 'cleared',
          score: newScore,
          highScore: Math.max(newScore, newState.highScore),
          isHighScoreUpdated,
        };
      }

      // 水との衝突
      if (checkWaterCollision(tako, newState.water) && tako.state !== 'dead') {
        tako.state = 'dead';
        tako.velocity = { x: 0, y: 0 };
        tako.deadTime = now();
        newState.tako = tako;
        newState.lives--;

        if (newState.lives <= 0) {
          if (waterDelayTimerRef.current) clearTimeout(waterDelayTimerRef.current);

          let isHighScoreUpdated = false;
          if (newState.score > newState.highScore) {
            saveHighScore(newState.score);
            isHighScoreUpdated = true;
          }

          setTimeout(() => {
            setState(p => ({
              ...p,
              screen: 'gameover',
              highScore: Math.max(p.score, p.highScore),
              isHighScoreUpdated,
            }));
          }, 1000);
        } else {
          const stageConfig = CONFIG.STAGES[newState.stage - 1];
          if (waterDelayTimerRef.current) clearTimeout(waterDelayTimerRef.current);

          setTimeout(() => {
            setState(p => {
              const startPlatform = p.platforms[0];
              const resetEels = p.eels.map(eel => ({ ...eel, isCollected: false }));
              const resetJellyfish = p.jellyfish.map(jf => ({ ...jf, isCollected: false }));
              return {
                ...p,
                tako: {
                  position: { x: startPlatform.x + 50, y: startPlatform.y - CONFIG.TAKO.HEIGHT },
                  velocity: { x: 0, y: 0 },
                  state: 'idle',
                  chargeStartTime: null,
                  chargeRatio: 0,
                  isGrounded: true,
                  facingRight: true,
                  airChargeLockedVelocityX: null,
                  deadTime: null,
                  hasAirJump: false,
                },
                eels: resetEels,
                jellyfish: resetJellyfish,
                camera: {
                  y: startPlatform.y - CONFIG.CANVAS_HEIGHT + 200,
                  targetY: startPlatform.y - CONFIG.CANVAS_HEIGHT + 200,
                },
                water: initWater(stageConfig),
              };
            });

            waterDelayTimerRef.current = setTimeout(() => {
              setState(p => ({ ...p, water: { ...p.water, isRising: true } }));
            }, stageConfig.waterDelay);
          }, 1000);
        }
      }

      // 水の上昇
      if (newState.water.isRising) {
        newState.water = {
          ...newState.water,
          y: newState.water.y - newState.water.speed,
          waveOffset: newState.water.waveOffset + CONFIG.WATER.WAVE_SPEED * 60,
        };
      }

      // カメラ追従
      const targetCameraY = tako.position.y - CONFIG.CANVAS_HEIGHT * 0.6;
      newState.camera = {
        ...newState.camera,
        targetY: targetCameraY,
        y: newState.camera.y + (targetCameraY - newState.camera.y) * 0.1,
      };

      return newState;
    });
  }, []);

  useGameLoop(updateGame, state.screen === 'playing');

  // Canvas上のタップ処理（画面遷移、ポーズボタン、ポーズメニュー）
  const handleCanvasPress = useCallback((event: any) => {
    const { locationX, locationY } = event.nativeEvent;

    // スケールを考慮して座標変換
    const { width: screenWidth } = Dimensions.get('window');
    const scale = screenWidth / CONFIG.CANVAS_WIDTH;
    const x = locationX / scale;
    const y = locationY / scale;

    // DEVボタン（タイトル画面右上）
    if (__DEV__ && state.screen === 'title') {
      if (x >= CONFIG.CANVAS_WIDTH - 70 && x <= CONFIG.CANVAS_WIDTH - 10 && y >= 10 && y <= 38) {
        setShowDevPanel(true);
        return;
      }
    }

    // 非プレイ画面：どこをタップしてもゲーム開始/遷移
    if (state.screen === 'title') { startGame(); return; }
    if (state.screen === 'cleared') { nextStage(); return; }
    if (state.screen === 'gameover') { returnToTitle(); return; }

    if (state.screen === 'playing') {
      if (x >= 10 && x <= 50 && y >= 10 && y <= 50) {
        pauseGame();
      }
    }

    if (state.screen === 'paused') {
      if (x >= 80 && x <= CONFIG.CANVAS_WIDTH - 80 && y >= 370 && y <= 414) {
        resumeGame();
      }
      if (x >= 80 && x <= CONFIG.CANVAS_WIDTH - 80 && y >= 440 && y <= 484) {
        restartFromBeginning();
      }
      if (x >= 80 && x <= CONFIG.CANVAS_WIDTH - 80 && y >= 510 && y <= 554) {
        returnToTitle();
      }
    }
  }, [state.screen, startGame, nextStage, pauseGame, resumeGame, restartFromBeginning, returnToTitle]);

  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
  const canvasScale = Math.min(
    screenWidth / CONFIG.CANVAS_WIDTH,
    screenHeight / CONFIG.CANVAS_HEIGHT
  );
  const canvasWidth = CONFIG.CANVAS_WIDTH * canvasScale;
  const canvasHeight = CONFIG.CANVAS_HEIGHT * canvasScale;

  const isPlayScreen = state.screen === 'playing' || state.screen === 'paused';

  return (
    <View style={styles.container}>
      <Pressable onPress={handleCanvasPress} style={!isPlayScreen ? StyleSheet.absoluteFill : undefined}>
        <Svg
          width={canvasWidth}
          height={canvasHeight}
          viewBox={`0 0 ${CONFIG.CANVAS_WIDTH} ${CONFIG.CANVAS_HEIGHT}`}
        >
          <Background />
          <Stars stars={state.stars} cameraY={state.camera.y} />
          <Moon moon={state.moon} cameraY={state.camera.y} />
          <Platforms platforms={state.platforms} cameraY={state.camera.y} />
          <Eels eels={state.eels} cameraY={state.camera.y} frameTime={frameTime} />
          <JellyfishRenderer jellyfish={state.jellyfish} cameraY={state.camera.y} frameTime={frameTime} />
          <Water water={state.water} cameraY={state.camera.y} />
          <TakoRenderer tako={state.tako} cameraY={state.camera.y} frameTime={frameTime} />
          {isPlayScreen && <HUD state={state} />}
          <Overlays state={state} frameTime={frameTime} />
        </Svg>
      </Pressable>

      {/* モバイルコントロール（プレイ中のみ表示） */}
      {state.screen === 'playing' && (
        <MobileControls
          onDirectionChange={handleDirectionChange}
          onJumpStart={handleJumpStart}
          onJumpEnd={handleJumpEnd}
          isCharging={state.tako.chargeStartTime !== null}
        />
      )}

      {/* 開発者モード：ステージ選択パネル */}
      {showDevPanel && (
        <View style={styles.devOverlay}>
          <View style={styles.devPanel}>
            <Text style={styles.devTitle}>DEV MODE</Text>
            <Text style={styles.devSubtitle}>SELECT STAGE</Text>
            <ScrollView contentContainerStyle={styles.devStageGrid}>
              {CONFIG.STAGES.map((_, i) => (
                <Pressable
                  key={i}
                  style={styles.devStageButton}
                  onPress={() => startGameAtStage(i + 1)}
                >
                  <Text style={styles.devStageText}>{i + 1}</Text>
                </Pressable>
              ))}
            </ScrollView>
            <Pressable
              style={styles.devCloseButton}
              onPress={() => setShowDevPanel(false)}
            >
              <Text style={styles.devCloseText}>CLOSE</Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2D2A5A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  devOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  devPanel: {
    width: '85%',
    maxHeight: '70%',
    backgroundColor: '#1E1B3A',
    borderRadius: 12,
    padding: 20,
    borderWidth: 2,
    borderColor: '#E8A87C',
  },
  devTitle: {
    color: '#E8A87C',
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'Courier',
    textAlign: 'center',
    marginBottom: 4,
  },
  devSubtitle: {
    color: '#9B8AC4',
    fontSize: 12,
    fontFamily: 'Courier',
    textAlign: 'center',
    marginBottom: 16,
  },
  devStageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    paddingBottom: 16,
  },
  devStageButton: {
    width: 52,
    height: 52,
    backgroundColor: '#3D3A6A',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#9B8AC4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  devStageText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Courier',
  },
  devCloseButton: {
    backgroundColor: '#3D3A6A',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#9B8AC4',
  },
  devCloseText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'Courier',
  },
});
