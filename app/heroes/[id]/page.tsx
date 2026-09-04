import { getHeroesAssets } from "@/service/gertHeroesAssets";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function HeroPage({ params }: PageProps) {
  const { id } = await params;
  const HeroAssets = await getHeroesAssets()
  const hero = HeroAssets.find((hero) => hero.id === Number(id));

  return (
    <main className="container mx-auto">
        <img src={hero?.images?.icon_hero_card_webp} alt="" />
        <h1 className="text-3xl font-bold text-white">{hero?.name}{id}</h1>
        <h2>{hero?.hideout_rich_presence}</h2>
        <h2>{hero?.description?.lore}</h2>
    </main>
  );
}