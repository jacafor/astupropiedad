import type { Metadata } from "next";
import { rutaMetadata } from "@/lib/seo";
import Hero from "@/components/Hero";
import InvestmentSmarter from "@/components/InvestmentSmarter";
import FeaturedProperties from "@/components/FeaturedProperties";
import PersonalShopper from "@/components/PersonalShopper";
import PropertyZones from "@/components/PropertyZones";
import MortgageBasic from "@/components/MortgageBasic";
import PhilosophyAndTeam from "@/components/PhilosophyAndTeam";

export const metadata: Metadata = rutaMetadata("/");

export default function Home() {
  return (
    <div className="min-h-screen">
      <Hero />
      <InvestmentSmarter />
      <FeaturedProperties />
      <PersonalShopper />
      <PropertyZones />
      <MortgageBasic />
      <PhilosophyAndTeam />
    </div>
  );
}
