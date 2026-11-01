import type { Metadata } from "next";
import { rutaMetadata } from "@/lib/seo";
import Hero from "@/components/Hero";
import InvestmentSmarter from "@/components/InvestmentSmarter";
import FeaturedProperties from "@/components/FeaturedProperties";
import PersonalShopper from "@/components/PersonalShopper";
import PropertyZones from "@/components/PropertyZones";
import MortgageBasic from "@/components/MortgageBasic";
import { listarDisponibles } from "@/data/inventario";
import PhilosophyAndTeam from "@/components/PhilosophyAndTeam";

export const metadata: Metadata = rutaMetadata("/");

// El inventario se lee de Supabase en caché; /admin lo invalida al guardar.
export const revalidate = 3600;

export default async function Home() {
  const destacadas = (await listarDisponibles()).filter((p) => p.destacada).slice(0, 2);
  return (
    <div className="min-h-screen">
      <Hero />
      <InvestmentSmarter />
      <FeaturedProperties properties={destacadas} />
      <PersonalShopper />
      <PropertyZones />
      <MortgageBasic />
      <PhilosophyAndTeam />
    </div>
  );
}
