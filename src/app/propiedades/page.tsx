import type { Metadata } from "next";
import PropiedadesClient from "./PropiedadesClient";
import { rutaMetadata } from "@/lib/seo";
import { listarDisponibles } from "@/data/inventario";

export const metadata: Metadata = rutaMetadata("/propiedades");

export const revalidate = 3600;

const Page = async () => <PropiedadesClient propiedades={await listarDisponibles()} />;

export default Page;
