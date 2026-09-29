import Link from 'next/link'
import { Swords, Package, History, Search } from "lucide-react";

export function NavBar() {

    return(
    <header className='flex p-4 gap-6 bg-neutral-900 border-b border-neutral-700'>
        <span className='flex items-center'>🎮</span>
        <Link className='flex gap-1 hover:bg-neutral-600/50 rounded-md hover:text-white px-2 py-1.5 text-base  text-neutral-400 font-medium' href="/"><Swords/> Heroes</Link>
        {/* <Link className='flex gap-1 hover:bg-neutral-600/50 rounded-md hover:text-white px-2 py-1.5 text-base  text-neutral-400 font-medium' href="/"><Package/> Match items</Link> */}
        <Link className='flex gap-1 hover:bg-neutral-600/50 rounded-md hover:text-white px-2 py-1.5 text-base  text-neutral-400 font-medium' href="/matches"><History/>Match view</Link>
        <Link className='flex gap-1 hover:bg-neutral-600/50 rounded-md hover:text-white px-2 py-1.5 text-base  text-neutral-400 font-medium' href="/players"><Search/>Profile search</Link>

    </header>
)}