import type { Metadata } from "next";
import PropiedadesClient from "./PropiedadesClient";
import { rutaMetadata } from "@/lib/seo";

export const metadata: Metadata = rutaMetadata("/propiedades");

const Page = () => <PropiedadesClient />;

export default Page;
