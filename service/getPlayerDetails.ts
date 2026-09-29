import { fetchWithRetry } from "@/utils/api";
import { SteamProfile } from "./getProfileData";

export interface HeroStat {
  account_id: number;
  hero_id: number;
  matches: number;
  wins: number;
  losses: number;
  kills: number;
  deaths: number;
  assists: number;
  net_worth?: number;
  damage?: number;
}

export interface PlayerMatchHistoryItem {
  match_id: number;
  hero_id: number;
  match_result: number; // 1 — Победа, 0 — Поражение (или по слоту)
  player_kills?: number;
  player_deaths?: number;
  player_assists?: number;
  net_worth?: number;
  duration_s?: number;
  start_time?: number;
  player_slot?: number;
}

export interface RankPrediction {
  badge?: number;
  raw_score?: number;
  matches_used?: number;
}

export interface FullPlayerProfile {
  steamProfile: SteamProfile | null;
  heroStats: HeroStat[];
  matchHistory: PlayerMatchHistoryItem[];
  rankPrediction: RankPrediction | null;
}

export async function getPlayerFullData(accountId: string): Promise<FullPlayerProfile> {
  const [steamRes, heroStatsRes, historyRes, rankRes] = await Promise.allSettled([
    // 1. Профиль Steam
    fetchWithRetry(`https://api.deadlock-api.com/v1/players/steam?account_ids=${accountId}`, {
      next: { revalidate: 3600 },
    }),
    // 2. Статистика по героям
    fetchWithRetry(`https://api.deadlock-api.com/v1/players/hero-stats?account_ids=${accountId}`, {
      next: { revalidate: 1800 },
    }),
    // 3. История матчей
    fetchWithRetry(`https://api.deadlock-api.com/v1/players/${accountId}/match-history`, {
      next: { revalidate: 600 },
    }),
    // 4. Предсказанный ранг
    fetchWithRetry(`https://api.deadlock-api.com/v1/players/${accountId}/rank-predict`, {
      next: { revalidate: 3600 },
    }),
  ]);

  const steamData = steamRes.status === "fulfilled" && Array.isArray(steamRes.value) ? steamRes.value[0] : null;
  const heroStats = heroStatsRes.status === "fulfilled" && Array.isArray(heroStatsRes.value) ? heroStatsRes.value : [];
  const matchHistory = historyRes.status === "fulfilled" && Array.isArray(historyRes.value) ? historyRes.value : [];
  const rankPrediction = rankRes.status === "fulfilled" ? rankRes.value : null;

  return {
    steamProfile: steamData || null,
    heroStats,
    matchHistory,
    rankPrediction,
  };
} 