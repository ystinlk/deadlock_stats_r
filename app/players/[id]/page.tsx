import Link from "next/link";
import { getPlayerFullData } from "@/service/getPlayerDetails";
import { getHeroesAssets } from "@/service/getHeroesAssets";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PlayerProfilePage({ params }: PageProps) {
  const { id } = await params;

  // Параллельно забираем профиль игрока и справочник героев
  const [playerData, heroesData] = await Promise.all([
    getPlayerFullData(id),
    getHeroesAssets(),
  ]);

  const { steamProfile, heroStats, matchHistory, rankPrediction } = playerData;

  // Собираем справочник героев { [id]: hero }
  const heroesMap: Record<number, any> = {};
  if (Array.isArray(heroesData)) {
    heroesData.forEach((h: any) => {
      heroesMap[h.id] = h;
    });
  }

  // Хелпер: безопасно достаем число матчей героя
  const getHeroMatchesCount = (h: any) => {
    if (Array.isArray(h.matches)) return h.matches.length;
    if (typeof h.matches === "number") return h.matches;
    return 0;
  };

  // 1. Считаем общее число матчей
  const totalMatches = heroStats.reduce((sum, h) => sum + getHeroMatchesCount(h), 0);

  // 2. Считаем победы (если wins — число, берем его, если массив — длину)
  const totalWins = heroStats.reduce((sum, h) => {
    const winsCount = Array.isArray(h.wins) ? h.wins.length : Number(h.wins) || 0;
    return sum + winsCount;
  }, 0);

  const totalLosses = Math.max(0, totalMatches - totalWins);
  const winRate = totalMatches > 0 ? ((totalWins / totalMatches) * 100).toFixed(1) : "0.0";

  // 3. Фраги и KDA
  const totalKills = heroStats.reduce((sum, h) => sum + (Number(h.kills) || 0), 0);
  const totalDeaths = heroStats.reduce((sum, h) => sum + (Number(h.deaths) || 0), 0);
  const totalAssists = heroStats.reduce((sum, h) => sum + (Number(h.assists) || 0), 0);
  const kdaRatio = totalDeaths > 0 ? ((totalKills + totalAssists) / totalDeaths).toFixed(2) : "0.00";

  // 4. Сортируем топ-героев по реальному числу игр
  const topHeroes = [...heroStats]
    .sort((a, b) => getHeroMatchesCount(b) - getHeroMatchesCount(a))
    .slice(0, 6);

  const nickName = steamProfile?.personaname || `Игрок #${id}`;
  const avatarUrl = steamProfile?.avatarfull || steamProfile?.avatar;

  return (
    <main className="container mx-auto px-4 py-8 max-w-6xl space-y-6 font-sans">
      {/* Шапка профиля */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 p-6 bg-neutral-900/80 border border-neutral-800 rounded-2xl">
        <div className="flex items-center gap-5">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={nickName}
              className="w-20 h-20 rounded-2xl object-cover border-2 border-neutral-700 bg-neutral-800 shadow-xl"
            />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-neutral-800 border-2 border-neutral-700 flex items-center justify-center text-xl text-neutral-400 font-mono">
              ?
            </div>
          )}

          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-wide">
              {nickName}
            </h1>
            <div className="flex items-center gap-3 text-xs text-neutral-400 font-mono mt-1">
              <span>Account ID: {id}</span>
              {steamProfile?.profileurl && (
                <a
                  href={steamProfile.profileurl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-neutral-500 hover:text-neutral-300 transition-colors"
                >
                  Steam Profile ↗
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Бейдж ранга (если есть) */}
        {rankPrediction?.raw_score && (
          <div className="text-left sm:text-right px-4 py-2 rounded-xl bg-neutral-800/60 border border-neutral-700/60">
            <span className="text-[11px] uppercase tracking-wider text-neutral-400 font-mono block">
              Рейтинг MMR
            </span>
            <span className="text-xl font-bold font-mono text-amber-400">
              {Math.round(rankPrediction.raw_score)}
            </span>
          </div>
        )}
      </div>

      {/* Карточки ключевых показателей */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-neutral-900/50 border border-neutral-800/80 rounded-xl">
          <span className="text-xs text-neutral-400 uppercase font-mono block mb-1">Матчей</span>
          <span className="text-2xl font-black text-white font-mono">{totalMatches}</span>
        </div>

        <div className="p-4 bg-neutral-900/50 border border-neutral-800/80 rounded-xl">
          <span className="text-xs text-neutral-400 uppercase font-mono block mb-1">Винрейт</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-white font-mono">{winRate}%</span>
            <span className="text-xs text-neutral-500 font-mono">
              ({totalWins}В - {totalLosses}П)
            </span>
          </div>
        </div>

        <div className="p-4 bg-neutral-900/50 border border-neutral-800/80 rounded-xl">
          <span className="text-xs text-neutral-400 uppercase font-mono block mb-1">KDA Ratio</span>
          <span className="text-2xl font-black text-emerald-400 font-mono">{kdaRatio}</span>
        </div>

        <div className="p-4 bg-neutral-900/50 border border-neutral-800/80 rounded-xl">
          <span className="text-xs text-neutral-400 uppercase font-mono block mb-1">Фраги всего</span>
          <span className="text-2xl font-black text-amber-400 font-mono">{totalKills}</span>
        </div>
      </div>

      {/* Две колонки: Топ герои и История матчей */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Колонка 1: Топ героев */}
        <div className="lg:col-span-1 space-y-3">
          <h2 className="text-lg font-bold text-white tracking-wide">Любимые герои</h2>

          <div className="bg-neutral-900/50 border border-neutral-800/80 rounded-xl p-3 space-y-2.5">
            {topHeroes.length === 0 ? (
              <p className="text-xs text-neutral-500 p-2">Нет данных по героям</p>
            ) : (
              topHeroes.map((h) => {
                const hero = heroesMap[h.hero_id];
                const heroName = hero?.name || `Герой #${h.hero_id}`;

                const heroMatches = Array.isArray(h.matches)
                  ? h.matches.length
                  : Number(h.matches) || 0;

                const winsCount = Array.isArray(h.wins)
                  ? h.wins.length
                  : Number(h.wins) || 0;

                const lossesCount = Array.isArray(h.losses)
                  ? h.losses.length
                  : h.losses !== undefined
                  ? Number(h.losses)
                  : Math.max(0, heroMatches - winsCount);

                const heroWinRate =
                  heroMatches > 0
                    ? ((winsCount / heroMatches) * 100).toFixed(0)
                    : "0";

                return (
                  <div
                    key={h.hero_id}
                    className="flex items-center justify-between p-2 rounded-lg bg-neutral-950/40 border border-neutral-800/50 hover:border-neutral-700/80 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-neutral-800 border border-neutral-700 flex items-center justify-center font-mono text-xs text-neutral-300 font-bold shrink-0">
                        {h.hero_id}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-neutral-200 truncate">
                          {heroName}
                        </div>
                        <div className="text-[11px] text-neutral-500 font-mono">
                          {heroMatches} игр
                        </div>
                      </div>
                    </div>

                    <div className="text-right font-mono">
                      <div
                        className={`text-xs font-bold ${
                          Number(heroWinRate) >= 50
                            ? "text-emerald-400"
                            : "text-rose-400"
                        }`}
                      >
                        {heroWinRate}%
                      </div>
                      <div className="text-[10px] text-neutral-500">
                        {winsCount}В / {lossesCount}П
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Колонка 2: История последних матчей */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white tracking-wide">Последние матчи</h2>
            <span className="text-xs text-neutral-500 font-mono">
              Показано: {matchHistory.slice(0, 10).length}
            </span>
          </div>

          <div className="bg-neutral-900/50 border border-neutral-800/80 rounded-xl overflow-hidden">
            {matchHistory.length === 0 ? (
              <p className="text-xs text-neutral-500 p-6 text-center">
                История матчей пуста или закрыта настройками приватности
              </p>
            ) : (
              <div className="divide-y divide-neutral-800/60">
                {matchHistory.slice(0, 10).map((m) => {
                  const hero = heroesMap[m.hero_id];
                  const heroName = hero?.name || `Герой #${m.hero_id}`;
                  const isWin = m.match_result === 1;

                  return (
                    <Link
                      key={m.match_id}
                      href={`/matches/${m.match_id}`}
                      className="flex items-center justify-between p-3.5 hover:bg-neutral-800/40 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-2 h-10 rounded-full ${
                            isWin ? "bg-emerald-500" : "bg-rose-500"
                          }`}
                        />

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-neutral-200 group-hover:text-amber-300 transition-colors">
                              {heroName}
                            </span>
                            <span
                              className={`text-[10px] font-bold uppercase px-1.5 py-0.2 rounded font-mono ${
                                isWin
                                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                                  : "bg-rose-500/15 text-rose-400 border border-rose-500/20"
                              }`}
                            >
                              {isWin ? "Победа" : "Поражение"}
                            </span>
                          </div>
                          <span className="text-[11px] text-neutral-500 font-mono block mt-0.5">
                            Матч #{m.match_id}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-6 text-right font-mono">
                        {(m.player_kills !== undefined || m.player_deaths !== undefined) && (
                          <div className="text-xs">
                            <span className="text-neutral-400">KDA: </span>
                            <span className="text-emerald-400 font-bold">{m.player_kills ?? 0}</span>
                            <span className="text-neutral-600">/</span>
                            <span className="text-rose-400 font-bold">{m.player_deaths ?? 0}</span>
                            <span className="text-neutral-600">/</span>
                            <span className="text-amber-400 font-bold">{m.player_assists ?? 0}</span>
                          </div>
                        )}

                        <span className="text-xs text-neutral-600 group-hover:text-neutral-300 transition-colors">
                          →
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}