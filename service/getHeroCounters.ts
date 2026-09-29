import { fetchWithRetry } from "@/utils/api";

export interface HeroCounters {
    hero_id: number;
    enemy_hero_id: number;
    matches_played: number;
    wins: number;
}

export async function getHeroCounters(): Promise<HeroCounters[]> {
    const response = await fetchWithRetry('https://api.deadlock-api.com/v1/analytics/hero-counter-stats', {
        next: { revalidate: 3600 },
    }) 

    return response
}