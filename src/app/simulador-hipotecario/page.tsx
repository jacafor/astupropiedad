import type { Metadata } from "next";
import SimuladorHipotecarioClient from "./SimuladorHipotecarioClient";
import { rutaMetadata } from "@/lib/seo";

export const metadata: Metadata = rutaMetadata("/simulador-hipotecario");

const Page = () => <SimuladorHipotecarioClient />;

export default Page;
