'use client';
import { useState } from 'react';
import Link from 'next/link'

export interface Hero {
  id: number;
  name: string;
  image: string;
  winrate: number;
  pickrate: number;
  matches: number;
}

type SortField = 'winrate' | 'pickrate' | 'matches' | 'name';

export function HeroTable({ heroes }: { heroes: Hero[]}) {

    const [sortField, setSortField] = useState<SortField>('winrate');
    const [sortDirection, setSortDirection] = useState('desc')

        function handleSort(field: SortField) {
    if (sortField === field) {
        setSortDirection(sortDirection === 'desc' ? 'asc' : 'desc');
    } else {
        setSortField(field);
        setSortDirection('desc');
    }
    }
    const sortedHeroes = [...heroes].sort((a, b) => {
    if (sortField === 'name') {
        return sortDirection === 'asc'
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    }

    // Для числовых полей:
    return sortDirection === 'asc'
        ? a[sortField] - b[sortField]
        : b[sortField] - a[sortField]; 
    });
    
return (
    <div className='overflow-x-auto rounded-xl border border-neutral-800 bg-neutral-900/60 p-2 '>
        <table className='w-full text-left text-sm '>
        <thead className="border-b border-neutral-800 text-xs uppercase text-neutral-400">
            <tr>
                <th className="p-3 w-12 text-center">#</th>
                <th 
                onClick={() => handleSort('name')} 
                className="p-3 cursor-pointer select-none hover:text-white transition-colors"
                >
                Имя {sortField === 'name' && (sortDirection === 'asc' ? '▲' : '▼')}
                </th>
                <th 
                onClick={() => handleSort('winrate')} 
                className="p-3 cursor-pointer select-none hover:text-white transition-colors"
                >
                WR {sortField === 'winrate' && (sortDirection === 'asc' ? '▲' : '▼')}
                </th>
                <th 
                onClick={() => handleSort('pickrate')} 
                className="p-3 cursor-pointer select-none hover:text-white transition-colors"
                >
                PR {sortField === 'pickrate' && (sortDirection === 'asc' ? '▲' : '▼')}
                </th>
                <th 
                // onClick={() => handleSort('meta-points')} добавить мета поинта по соотношению пикрейта и винрейта
                className="p-3 cursor-pointer select-none hover:text-white transition-colors"
                >
                points {sortField === 'matches' && (sortDirection === 'asc' ? '▲' : '▼')}
                </th>
            </tr>
        </thead>
        <tbody className='divide-y divide-neutral-800/60'>
            {sortedHeroes.map((hero, index) => (
                <tr className='hover:bg-neutral-800/40 transition-colors' key={hero.id}>
                    <td className='p-3 text-center font-mono text-neutral-500'>{index + 1}</td>
                    <td className="p-2"> 
                        <div className='flex items-center gap-3'>
                            <img 
                                src={hero.image} 
                                alt={hero.name} 
                                className="w-12 h-12 rounded-lg object-cover bg-neutral-800/50"
                            />
                            <span className="font-medium text-white"><Link href={`/heroes/${hero.id}`}>{hero.name}</Link></span>
                        </div>
                    </td>
                    <td className="p-3 font-mono">
                    <span className={hero.winrate >= 50 ? "text-emerald-400 font-semibold" : "text-rose-400 font-semibold"}>
                        {hero.winrate}%
                    </span>
                    </td>

                    <td className="p-3 font-mono text-neutral-300">
                    {hero.pickrate}%
                    </td>
                    <td>placeHolder</td>
                </tr>
            ))}
        </tbody>
        </table>
    </div>
)
}