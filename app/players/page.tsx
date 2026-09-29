import Link from "next/link";
import { redirect } from "next/navigation";
import { searchPlayers } from "@/service/searchPlayers";

interface PageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function PlayersSearchPage({ searchParams }: PageProps) {
  const { q } = await searchParams;
  const query = q?.trim() || "";

  // Серверный экшен для отправки формы
  async function handleSearch(formData: FormData) {
    "use server";
    const rawInput = formData.get("search")?.toString().trim();
    if (!rawInput) return;

    // Если вбиты только цифры (SteamID3) — сразу кидаем в профиль
    if (/^\d+$/.test(rawInput)) {
      redirect(`/players/${rawInput}`);
    } else {
      // Если введен текстовый никнейм — идем на поисковую выдачу
      redirect(`/players?q=${encodeURIComponent(rawInput)}`);
    }
  }

  // Если в URL передан поисковый запрос, забираем результаты с сервера
  const players = query ? await searchPlayers(query) : [];

  return (
    <main className="container mx-auto px-4 py-12 max-w-4xl space-y-8 font-sans">
      {/* Заголовок и форма поиска */}
      <div className="text-center space-y-3">
        <h1 className="text-3xl font-black text-white tracking-wide">
          Поиск игрока
        </h1>
        <p className="text-neutral-400 text-sm max-w-md mx-auto">
          Введи никнейм Steam или точный Account ID для просмотра детальной статистики и истории матчей
        </p>

        <form action={handleSearch} className="flex gap-2 max-w-lg mx-auto pt-4">
          <input
            type="text"
            name="search"
            defaultValue={query}
            placeholder="Никнейм или ID (например, 67240896)..."
            required
            className="flex-1 px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-600 transition-colors"
          />
          <button
            type="submit"
            className="px-6 py-3 bg-white text-black font-bold rounded-xl hover:bg-neutral-200 transition-colors tracking-wide"
          >
            Найти
          </button>
        </form>
      </div>

      {/* Результаты поиска */}
      {query && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-neutral-400 font-mono px-1">
            <span>
              Результаты по запросу: <strong className="text-neutral-200">«{query}»</strong>
            </span>
            <span>Найдено: {players.length}</span>
          </div>

          {players.length === 0 ? (
            <div className="p-8 text-center bg-neutral-900/40 border border-neutral-800/80 rounded-2xl text-neutral-500 text-sm">
              Игроки с таким ником не найдены или не играли матчей за последние 30 дней.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {players.map((p) => (
                <Link
                  key={p.account_id}
                  href={`/players/${p.account_id}`}
                  className="flex items-center justify-between p-3.5 bg-neutral-900/60 border border-neutral-800/80 rounded-xl hover:bg-neutral-800/50 hover:border-neutral-700 transition-all group"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <img
                      src={p.avatarfull || p.avatar}
                      alt={p.personaname}
                      className="w-12 h-12 rounded-xl object-cover border border-neutral-800 bg-neutral-800 shrink-0"
                      loading="lazy"
                    />
                    <div className="min-w-0">
                      <div className="font-bold text-white text-sm truncate group-hover:text-amber-400 transition-colors">
                        {p.personaname}
                      </div>
                      <div className="text-xs text-neutral-500 font-mono">
                        ID: {p.account_id}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0 pl-2">
                    <span className="text-[11px] font-mono px-2 py-1 rounded bg-neutral-800/80 border border-neutral-700/50 text-neutral-300">
                      {p.matches_played_last_30d ?? 0} игр / 30д
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </main>
  );
}