'use client'

import { useState } from "react";
import { useRouter } from "next/navigation";


export default function MatchesPage() {
  const [matchId, setMatchId] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault(); // Останавливаем стандартную перезагрузку страницы браузером
  

    const trimmedId = matchId.trim();
    if (!trimmedId) return;

    // Переходим на страницу конкретного матча
    router.push(`/matches/${trimmedId}`);
  };

  return (
    <main className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[60vh]">
      <div className="w-full max-w-md p-8 bg-neutral-900/80 border border-neutral-800 rounded-2xl shadow-xl text-center">
        <h1 className="text-2xl font-bold text-white mb-2">Поиск матча</h1>
        <p className="text-sm text-neutral-400 mb-6">
          Введите ID матча для просмотра подробной статистики и предметов
        </p>

        <form onSubmit={handleSearch} className="space-y-4">
          <input
            type="text"
            value={matchId}
            onChange={(e) => setMatchId(e.target.value)}
            placeholder="Например: 25198030"
            className="w-full px-4 py-3 bg-neutral-950 border border-neutral-800 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500 transition-colors font-mono text-center"
          />

          <button
            type="submit"
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-colors cursor-pointer"
          >
            Найти матч
          </button>
        </form>
      </div>
    </main>
  );
}