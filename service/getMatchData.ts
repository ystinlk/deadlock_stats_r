import { fetchWithRetry } from "@/utils/api";

export interface MatchPlayer {
  account_id: number;
  hero_id: number;
  team: number; // 0 — Amber, 1 — Sapphire
  player_slot: number;
  kills: number;
  deaths: number;
  assists: number;
  net_worth: number;
  last_hits: number;
  denies: number;
  level: number;
  ability_points: number;
  assigned_lane: number;
  mvp_rank?: number;
  hero_damage?: number;
  player_damage?: number;
  objective_damage?: number;
  healing?: number;
  items?: Array<{
    item_id: number;
    upgrade_id?: number;
    sold_time_s?: number;
  }>;
  stats?: any;
}

export interface MatchDetails {
  match_id: number;
  not_scored: boolean;
  duration_s: number;     // Длительность катки в секундах
  winning_team: number;   // Кто победил: 0 или 1
  start_time: number;     // Unix-время старта
  mid_boss: Record<string, any>[];
  players: MatchPlayer[];
}


export async function getMatchData(matchId: string): Promise<MatchDetails | null> {
  try {
    const response = await fetchWithRetry(`https://api.deadlock-api.com/v1/matches/${matchId}/metadata`, {
      next: { revalidate: 3600 },
    });

    // Если матч не найден или API вернуло ошибку
    if (!response || !response.match_info) {
      return null;
    }

    // Возвращаем именно чистые данные матча
    return response.match_info;
  } catch (error) {
    console.error("Ошибка при получении матча:", error);
    return null;
  }
}