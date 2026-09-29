import { fetchWithRetry } from "@/utils/api";

export interface HeroSynergies {
    hero_id1: number;
    hero_id2: number;
    matches_played: number;
    wins: number;
}

export async function getHeroSynergies(): Promise<HeroSynergies[]> {
    const response = await fetchWithRetry('https://api.deadlock-api.com/v1/analytics/hero-synergy-stats', {
        next: { revalidate: 3600 },
    }) 

    return response
}