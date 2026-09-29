import { notFound } from "next/navigation";
import { getMatchData, MatchPlayer } from "@/service/getMatchData";
import { getProfileData, SteamProfile } from "@/service/getProfileData";
import { getHeroesAssets } from "@/service/getHeroesAssets";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function MatchPage({ params }: PageProps) {
  const { id } = await params;
  const match = await getMatchData(id);

  if (!match) {
    notFound();
  }

  // Забираем ID всех игроков матча для одного пакетного запроса
  const accountIds = match.players.map((p) => p.account_id);

  // Параллельно забираем профили Steam и справочник героев
  const [profilesMap, heroesData] = await Promise.all([
    getProfileData(accountIds),
    getHeroesAssets(),
  ]);

  // Собираем словарь героев по hero_id
  const heroesMap: Record<number, any> = {};
  if (Array.isArray(heroesData)) {
    heroesData.forEach((hero: any) => {
      heroesMap[hero.id] = hero;
    });
  } else if (heroesData && typeof heroesData === "object") {
    Object.assign(heroesMap, heroesData);
  }

  // В реальном клиенте team: 0 — Amber, 1 — Sapphire
  const amberPlayers = match.players.filter((p) => (p.team ?? (p.player_slot < 6 ? 0 : 1)) === 0);
  const sapphirePlayers = match.players.filter((p) => (p.team ?? (p.player_slot < 6 ? 0 : 1)) === 1);

  const amberKills = amberPlayers.reduce((acc, p) => acc + p.kills, 0);
  const sapphireKills = sapphirePlayers.reduce((acc, p) => acc + p.kills, 0);

  const amberNetworth = amberPlayers.reduce((acc, p) => acc + p.net_worth, 0);
  const sapphireNetworth = sapphirePlayers.reduce((acc, p) => acc + p.net_worth, 0);

  const minutes = Math.floor(match.duration_s / 60);
  const seconds = (match.duration_s % 60).toString().padStart(2, "0");

  return (
    <main className="container mx-auto px-4 py-8 max-w-6xl space-y-4 font-sans">
      {/* Шапка матча */}
      <div className="flex items-center justify-between px-6 py-4 bg-neutral-900/80 border border-neutral-800 rounded-xl">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-white tracking-wide">
            Матч #{match.match_id}
          </h1>
          <span className="text-[11px] px-2 py-0.5 rounded bg-neutral-800 text-neutral-400 font-mono border border-neutral-700/60">
            6 vs 6
          </span>
        </div>

        <div className="flex items-center gap-6 text-sm">
          <div>
            <span className="text-neutral-500 text-xs mr-2">Длительность</span>
            <span className="text-neutral-200 font-mono font-medium">{minutes}:{seconds}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-neutral-500 text-xs">Победитель:</span>
            <span
              className={`font-bold text-xs uppercase tracking-wider px-2.5 py-0.5 rounded border ${
                match.winning_team === 0
                  ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                  : "bg-cyan-500/10 text-cyan-400 border-cyan-500/30"
              }`}
            >
              {match.winning_team === 0 ? "The Amber Hand" : "The Sapphire Flame"}
            </span>
          </div>
        </div>
      </div>

      {/* Табло матча */}
      <div className="rounded-xl border border-neutral-800/80 bg-neutral-900/40 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-neutral-950/80 text-neutral-400 text-[11px] uppercase tracking-wider font-semibold border-b border-neutral-800">
              <tr>
                <th className="px-5 py-3">Игрок / Герой</th>
                <th className="px-3 py-3 text-center">Ур.</th>
                <th className="px-4 py-3 text-right">Души</th>
                <th className="px-4 py-3 text-center">У / С / П</th>
                <th className="px-4 py-3 text-right">Урон игрокам</th>
                <th className="px-4 py-3 text-right">Урон целям</th>
                <th className="px-5 py-3 text-right">Крипы (LH/DN)</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-neutral-800/40">
              {/* Команда AMBER */}
              <tr className="bg-amber-500/[0.08] border-b border-amber-500/20">
                <td colSpan={7} className="px-5 py-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="text-amber-400 font-bold uppercase text-xs tracking-wider">
                        The Amber Hand
                      </span>
                      {match.winning_team === 0 && (
                        <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          Победа
                        </span>
                      )}
                    </div>
                    <div className="flex gap-4 text-xs font-mono">
                      <span className="text-neutral-400">
                        Фраги: <strong className="text-white">{amberKills}</strong>
                      </span>
                      <span className="text-neutral-400">
                        Души: <strong className="text-amber-400 font-semibold">{(amberNetworth / 1000).toFixed(0)}k</strong>
                      </span>
                    </div>
                  </div>
                </td>
              </tr>

              {amberPlayers.map((player) => (
                <PlayerRow
                  key={player.account_id}
                  player={player}
                  profile={profilesMap[player.account_id]}
                  hero={heroesMap[player.hero_id]}
                  team="amber"
                />
              ))}

              {/* Разделитель между командами */}
              <tr className="bg-neutral-950 border-y border-neutral-800">
                <td colSpan={7} className="px-6 py-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 font-mono font-bold">
                      <span className="text-amber-400 text-lg">{amberKills}</span>
                      <span className="text-neutral-600 text-xs font-sans uppercase">vs</span>
                      <span className="text-cyan-400 text-lg">{sapphireKills}</span>
                    </div>

                    <div className="text-xs text-neutral-400 font-mono">
                      Разница душ:{" "}
                      <span className={amberNetworth >= sapphireNetworth ? "text-amber-400 font-medium" : "text-cyan-400 font-medium"}>
                        {amberNetworth >= sapphireNetworth ? "+" : "-"}
                        {Math.abs(Math.round((amberNetworth - sapphireNetworth) / 1000))}k
                      </span>
                    </div>
                  </div>
                </td>
              </tr>

              {/* Команда SAPPHIRE */}
              <tr className="bg-cyan-500/[0.08] border-b border-cyan-500/20">
                <td colSpan={7} className="px-5 py-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="text-cyan-400 font-bold uppercase text-xs tracking-wider">
                        The Sapphire Flame
                      </span>
                      {match.winning_team === 1 && (
                        <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                          Победа
                        </span>
                      )}
                    </div>
                    <div className="flex gap-4 text-xs font-mono">
                      <span className="text-neutral-400">
                        Фраги: <strong className="text-white">{sapphireKills}</strong>
                      </span>
                      <span className="text-neutral-400">
                        Души: <strong className="text-cyan-400 font-semibold">{(sapphireNetworth / 1000).toFixed(0)}k</strong>
                      </span>
                    </div>
                  </div>
                </td>
              </tr>

              {sapphirePlayers.map((player) => (
                <PlayerRow
                  key={player.account_id}
                  player={player}
                  profile={profilesMap[player.account_id]}
                  hero={heroesMap[player.hero_id]}
                  team="sapphire"
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}

// -------------------------------------------------------------
// Строка игрока с ником, аватаркой и именем героя
// -------------------------------------------------------------

interface PlayerRowProps {
  player: MatchPlayer;
  profile?: SteamProfile;
  hero?: any;
  team: "amber" | "sapphire";
}

function PlayerRow({ player, profile, hero, team }: PlayerRowProps) {
  const lastStat = player.stats?.[player.stats.length - 1];
  const playerDamage = lastStat?.player_damage ?? 0;
  const bossDamage = lastStat?.boss_damage ?? 0;

  const nickName = profile?.personaname || `Игрок #${player.account_id}`;
  const heroName = hero?.name || `Герой #${player.hero_id}`;
  const avatarUrl = profile?.avatarmedium || profile?.avatar;

  const hoverClass =
    team === "amber" ? "hover:bg-amber-500/[0.04]" : "hover:bg-cyan-500/[0.04]";

  return (
    <tr className={`transition-colors ${hoverClass} font-mono text-xs tabular-nums`}>
      {/* Аватарка Steam, никнейм и герой */}
      <td className="px-5 py-2.5 font-sans">
        <div className="flex items-center gap-3.5">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={nickName}
              className="w-10 h-10 rounded-xl object-cover border border-neutral-700/80 bg-neutral-800 shrink-0 shadow-sm"
              loading="lazy"
            />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-neutral-800 border border-neutral-700 flex items-center justify-center font-mono text-xs text-neutral-400 shrink-0">
              ?
            </div>
          )}

          <div className="min-w-0">
            <div className="font-bold text-white text-sm leading-tight truncate hover:text-amber-300 transition-colors">
              {nickName}
            </div>
            <div className="text-xs text-neutral-400 font-medium leading-normal flex items-center gap-1.5 mt-0.5">
              <span className="text-neutral-300">{heroName}</span>
              <span className="text-[10px] text-neutral-600 font-mono">({player.account_id})</span>
            </div>
          </div>
        </div>
      </td>

      {/* Уровень */}
      <td className="px-3 py-2.5 text-center text-neutral-400">
        <span className="px-1.5 py-0.5 rounded bg-neutral-800/80 border border-neutral-700/50 text-[11px]">
          {player.level}
        </span>
      </td>

      {/* Души */}
      <td className="px-4 py-2.5 text-right font-medium text-amber-300/90 text-sm">
        {(player.net_worth / 1000).toFixed(1)}k
      </td>

      {/* K / D / A */}
      <td className="px-4 py-2.5 text-center text-sm">
        <span className="text-emerald-400 font-semibold">{player.kills}</span>
        <span className="text-neutral-600 mx-1">/</span>
        <span className="text-rose-400 font-semibold">{player.deaths}</span>
        <span className="text-neutral-600 mx-1">/</span>
        <span className="text-amber-400 font-semibold">{player.assists}</span>
      </td>

      {/* Урон игрокам */}
      <td className="px-4 py-2.5 text-right font-medium text-neutral-200 text-sm">
        {playerDamage > 0 ? `${(playerDamage / 1000).toFixed(1)}k` : "0k"}
      </td>

      {/* Урон целям */}
      <td className="px-4 py-2.5 text-right font-medium text-neutral-400 text-sm">
        {bossDamage > 0 ? `${(bossDamage / 1000).toFixed(1)}k` : "0k"}
      </td>

      {/* Крипы */}
      <td className="px-5 py-2.5 text-right text-neutral-400 text-xs">
        <span className="text-neutral-300">{player.last_hits}</span>
        <span className="text-neutral-600 mx-1">/</span>
        <span className="text-neutral-500">{player.denies}</span>
      </td>
    </tr>
  );
}