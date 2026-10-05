"use client";

import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import InvestmentSmarter from "@/components/InvestmentSmarter";
import FeaturedProperties from "@/components/FeaturedProperties";
import PersonalShopper from "@/components/PersonalShopper";
import PropertyZones from "@/components/PropertyZones";
import MortgageBasic from "@/components/MortgageBasic";
import PhilosophyAndTeam from "@/components/PhilosophyAndTeam";
import Footer from "@/components/Footer";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <InvestmentSmarter />
      <FeaturedProperties />
      <PersonalShopper />
      <PropertyZones />
      <MortgageBasic />
      <PhilosophyAndTeam />
      <Footer />
      <FloatingWhatsApp />
    </main>
  );
}
