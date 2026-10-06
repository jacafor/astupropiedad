import type { Metadata } from "next";
import SimuladorInversionClient from "./SimuladorInversionClient";
import { rutaMetadata } from "@/lib/seo";

export const metadata: Metadata = rutaMetadata("/simulador-inversion");

const Page = () => <SimuladorInversionClient />;

export default Page;
