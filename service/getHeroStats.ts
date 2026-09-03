import { fetchWithRetry } from "@/utils/api";

export interface HeroStats {
  hero_id: number;
  matches: number;
  wins: number;
  losses: number;
}

export async function getHeroStats(): Promise<HeroStats[]> {
  const response = await fetchWithRetry(
    'https://api.deadlock-api.com/v1/analytics/hero-stats',
    {
      next: { revalidate: 3600 }, // Кэш на 1 час (3600 секунд)
    }
  );
  return response;
}