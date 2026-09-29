import { fetchWithRetry } from "@/utils/api";

export interface FoundPlayer {
  account_id: number;
  personaname: string;
  avatar: string;
  avatarfull: string;
  countrycode?: string;
  matches_played_last_30d?: number;
}

export async function searchPlayers(query: string): Promise<FoundPlayer[]> {
  if (!query || query.trim().length === 0) return [];

  try {
    const res = await fetchWithRetry(
      `https://api.deadlock-api.com/v1/players/steam-search?search_query=${encodeURIComponent(
        query.trim()
      )}&limit=20`,
      { next: { revalidate: 600 } } // Кэш на 5 минут
    );

    return Array.isArray(res) ? res : [];
  } catch (error) {
    console.error("Ошибка при поиске игроков:", error);
    return [];
  }
}