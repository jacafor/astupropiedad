import type { Metadata } from "next";
import ServiciosClient from "./ServiciosClient";
import { rutaMetadata } from "@/lib/seo";

export const metadata: Metadata = rutaMetadata("/servicios");

const Page = () => <ServiciosClient />;

export default Page;
