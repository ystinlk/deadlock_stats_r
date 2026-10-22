import { getHeroesAssets } from "@/service/getHeroesAssets";
import { getheroMetric } from "@/utils/getheroMetric";
import { getHeroCounters } from "@/service/getHeroCounters";
import { getHeroSynergies } from "@/service/getHeroSynergies";
import Link from 'next/link'

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function HeroPage({ params }: PageProps) {

  // получаем все данные разом 
  const [HeroAssets, heroesMetric, countersData, synergiesData] = await Promise.all([
      getHeroesAssets(),
      getheroMetric(), 
      getHeroCounters(),
      getHeroSynergies()
    ]) 
  // Айди героя на которого нажали чтобы попасть на эту страницу
  const { id } = await params;

  // 1. Базовые данные и общая статистика
  const hero = HeroAssets.find((hero) => hero.id === Number(id));
  const oneHeroStats = heroesMetric.find((s) => s?.id === Number(id));
  const pickRate = oneHeroStats?.pickrate;
  const winrate = oneHeroStats?.winrate ?? 50;

  // Карта общих винрейтов всех героев для вычисления ожидаемого исхода (Expected WR)
  const heroWinrates = new Map<number, number>(
    heroesMetric.map((s) => [s.id, s.winrate])
  );

  // 2. Худшие матчапы (Контр-пики) с поправкой на Advantage
  const bestCounterPicks = countersData
    .filter((d) => d.hero_id === Number(id) && d.matches_played > 100)
    .map((item) => {
      const matchWr = (item.wins / item.matches_played) * 100;
      const enemyWr = heroWinrates.get(item.enemy_hero_id) ?? 50;
      // Ожидаемый процент побед против этого оппонента
      const expectedWr = winrate - (enemyWr - 50);
      // Чем ниже Advantage, тем сильнее оппонент ломает игру нашему герою
      const advantage = matchWr - expectedWr;

      return {
        ...item,
        matchWr,
        advantage,
      };
    })
    .sort((a, b) => a.advantage - b.advantage)
    .slice(0, 5);

  // 3. Лучшие напарники (Синергия) с поправкой на Advantage
  const bestSynergiesPicks = synergiesData
    .filter((d) => (d.hero_id1 === Number(id) || d.hero_id2 === Number(id)) && d.matches_played > 100)
    .map((item) => {
      const allyId = item.hero_id1 === Number(id) ? item.hero_id2 : item.hero_id1;
      const matchWr = (item.wins / item.matches_played) * 100;
      const allyWr = heroWinrates.get(allyId) ?? 50;
      // Ожидаемый процент побед в паре с этим напарником
      const expectedWr = winrate + allyWr - 50;
      // Чем выше Synergy, тем продуктивнее напарники играют вместе относительно своей нормы
      const synergyAdvantage = matchWr - expectedWr;

      return {
        ...item,
        allyId,
        matchWr,
        synergyAdvantage,
      };
    })
    .sort((a, b) => b.synergyAdvantage - a.synergyAdvantage)
    .slice(0, 5);

  return (
    <main className="container mx-auto">
      <div className="max-w-4xl mx-auto p-6 bg-neutral-900/70 border border-neutral-800 rounded-2xl space-y-6">
        {/* Карточка героя */}
        <div className="flex gap-6">
          <img 
            src={hero?.images?.icon_hero_card_webp} 
            alt={hero?.name} 
            className="w-52 h-auto rounded-xl object-cover flex-shrink-0"
          />

          <div className="flex flex-col flex-1">
            <span className="text-5xl font-black text-white">{hero?.name}</span>
            <span className="text-lg italic text-neutral-400 mt-1">
              {hero?.hideout_rich_presence}
            </span>

            {/* Теги */}
            <div className="flex flex-wrap gap-2 mt-3">
              {hero?.tags?.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 text-xs font-semibold uppercase rounded-md bg-neutral-800 border border-neutral-700/60 text-neutral-300"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Лор */}
            {hero?.description?.lore && (
              <p className="mt-4 text-sm leading-relaxed text-neutral-300/80 font-light border-t border-neutral-800/50 pt-3">
                {hero.description.lore}
              </p>
            )}
          </div>
        </div>

        {/* Блок базовой статистики */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="p-4 bg-neutral-950/60 border border-neutral-800 rounded-xl flex flex-col items-center text-xl">
            <span className="text-neutral-400">Винрейт:</span>
            <span className="text-emerald-400">{winrate}%</span>
          </div>

          <div className="p-4 bg-neutral-950/60 border border-neutral-800 rounded-xl flex flex-col items-center text-xl">
            <span className="text-neutral-400">Пикрейт:</span>
            <span className="text-indigo-400">{pickRate}%</span>
          </div>

          <div className="p-4 bg-neutral-950/60 border border-neutral-800 rounded-xl md:col-span-2">
            <div className="flex justify-between items-center py-1 border-b border-neutral-800/40 text-sm">
              <span className="text-xs text-neutral-400 uppercase font-semibold">Скорость передвижения</span>
              <span className="font-semibold text-neutral-100">{hero?.starting_stats?.max_move_speed?.value ?? "—"}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-neutral-800/40 text-sm">
              <span className="text-xs text-neutral-400 uppercase font-semibold">Стамина</span>
              <span className="font-semibold text-neutral-100">{hero?.starting_stats?.stamina?.value ?? "—"}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-neutral-800/40 text-sm">
              <span className="text-xs text-neutral-400 uppercase font-semibold">Базовое здоровье</span>
              <span className="font-semibold text-neutral-100">{hero?.starting_stats?.max_health?.value ?? "—"}</span>
            </div>  
          </div> 
        </div>

        {/* Контр-пики и синергии */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">        
          {/* Левая колонка: Худшие противники */}
          <div className="p-4 bg-neutral-950/60 border border-neutral-800 rounded-xl">
            <span className="block text-center text-xs text-neutral-400 uppercase font-semibold pb-2 border-b border-neutral-800/40">
              Худшие матчапы (Контр-пики)
            </span>
            <div className="space-y-2 mt-3">
              {bestCounterPicks.map((item) => {
                const enemy = HeroAssets.find((h) => h.id === item.enemy_hero_id);
                const enemyWinRate = item.matchWr.toFixed(1);
                const diff = item.advantage.toFixed(1);

                return (
                  <div key={item.enemy_hero_id} className="flex items-center justify-between py-1.5 border-b border-neutral-800/30 last:border-0">
                    <div className="flex items-center gap-2.5">
                      <img 
                        src={enemy?.images?.icon_hero_card_webp} 
                        alt={enemy?.name} 
                        className="w-8 h-8 rounded-full object-cover border border-neutral-700 bg-neutral-800"
                      />
                      <span className="text-sm font-medium text-neutral-200">
                        <Link href={`/heroes/${enemy?.id}`}>{enemy?.name ?? "Неизвестный"}</Link>
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-semibold text-rose-400">
                        {enemyWinRate}%
                      </span>
                      <span className="text-xs text-neutral-500 ml-1.5 font-mono">
                        ({item.advantage > 0 ? `+${diff}` : diff}%)
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Правая колонка: Лучшие напарники */}
          <div className="p-4 bg-neutral-950/60 border border-neutral-800 rounded-xl">
            <span className="block text-center text-xs text-neutral-400 uppercase font-semibold pb-2 border-b border-neutral-800/40">
              Лучшие напарники (Синергия)
            </span>
            <div className="space-y-2 mt-3">
              {bestSynergiesPicks.map((item) => {
                const ally = HeroAssets.find((h) => h.id === item.allyId);
                const allyWinRate = item.matchWr.toFixed(1);
                const diff = item.synergyAdvantage.toFixed(1);

                return (
                  <div key={item.allyId} className="flex items-center justify-between py-1.5 border-b border-neutral-800/30 last:border-0">
                    <div className="flex items-center gap-2.5">
                      <img 
                        src={ally?.images?.icon_hero_card_webp} 
                        alt={ally?.name} 
                        className="w-8 h-8 rounded-full object-cover border border-neutral-700 bg-neutral-800"
                      />
                      <span className="text-sm font-medium text-neutral-200">
                        <Link href={`/heroes/${ally?.id}`}>{ally?.name ?? "Неизвестный"}</Link>
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-semibold text-emerald-400">
                        {allyWinRate}%
                      </span>
                      <span className="text-xs text-neutral-500 ml-1.5 font-mono">
                        ({item.synergyAdvantage > 0 ? `+${diff}` : diff}%)
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}