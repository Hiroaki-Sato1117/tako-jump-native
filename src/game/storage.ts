import AsyncStorage from '@react-native-async-storage/async-storage';

const HIGH_SCORE_KEY = 'tako-jump-high-score';

// メモリキャッシュ（同期アクセス用）
let cachedHighScore: number = 0;

// アプリ起動時にキャッシュをロード
export async function initStorage(): Promise<void> {
  try {
    const saved = await AsyncStorage.getItem(HIGH_SCORE_KEY);
    cachedHighScore = saved ? parseInt(saved, 10) : 0;
  } catch {
    cachedHighScore = 0;
  }
}

// 同期的にハイスコアを取得（キャッシュから）
export function loadHighScore(): number {
  return cachedHighScore;
}

// ハイスコアを保存（非同期で保存、キャッシュも更新）
export function saveHighScore(score: number): void {
  cachedHighScore = score;
  AsyncStorage.setItem(HIGH_SCORE_KEY, score.toString()).catch(() => {
    // ストレージアクセス失敗時は何もしない
  });
}
