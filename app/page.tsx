import { HeroTable } from "./components/HeroesTable";
import { getheroMetric } from "@/utils/getheroMetric";

export default async function Home() {
  const tableHeroes = await getheroMetric()
  
  return (
  <main className="container mx-auto p-4">
      
  <h1 className="mb-4 text-2xl font-bold">Герои Deadlock</h1>
  <HeroTable heroes={tableHeroes} />
  </main>
  );
}
