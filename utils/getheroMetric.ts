import { getHeroesAssets } from "@/service/getHeroesAssets";
import { getHeroStats } from "@/service/getHeroStats";

export async function getheroMetric() {
  const heroesAssets = await getHeroesAssets();
  const heroStats = await getHeroStats()
  const totalGames = heroStats.reduce((sum, s) => sum + s.matches, 0) / 12;

  const statsMap = Object.fromEntries(
  heroStats.map((stat) => [stat.hero_id, stat])
  );

const heroesForTable = heroesAssets
// Превращаем каждого героя в объект под интерфейс Hero
// задаем фильтры на доступных и включенных героев
  .filter((hero) => hero.player_selectable && !hero.disabled)
  .map((hero) => {
    const stat = statsMap[hero.id];
    const matches = stat?.matches || 0;
    const wins = stat?.wins || 0;

    return {
        id: hero.id,
        name: hero.name,
      image: hero.images?.icon_hero_card_webp || "/placeholder.png",
      matches: matches,
      // Считаем проценты и округляем до 1 знака после запятой:
      winrate: matches > 0 ? Number(((wins / matches) * 100).toFixed(1)) : 0,
      pickrate: totalGames > 0 ? Number(((matches / totalGames) * 100).toFixed(1)) : 0,
    };
  }); 
  return heroesForTable;
}