import type { Metadata } from "next";
import PropiedadesClient from "./PropiedadesClient";
import { rutaMetadata } from "@/lib/seo";
import { listarDisponibles } from "@/data/properties";

export const metadata: Metadata = rutaMetadata("/propiedades");

const Page = () => <PropiedadesClient propiedades={listarDisponibles()} />;

export default Page;
