import { fetchWithRetry } from "@/utils/api";

export interface HeroAsset {
  id: number;
  name: string;
  player_selectable: boolean;
  disabled?: boolean;
  images?: {
    icon_hero_card_webp?: string;
  };
}

export async function getHeroesAssets(): Promise<HeroAsset[]> {
  const response = await fetchWithRetry(
    'https://api.deadlock-api.com/v1/assets/heroes',
    {
      next: { revalidate: 3600 }, // Кэш на 1 час (3600 секунд)
    }
  );
  return response;
}