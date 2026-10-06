import type { Metadata } from "next";
import VenderClient from "./VenderClient";
import { rutaMetadata } from "@/lib/seo";

export const metadata: Metadata = rutaMetadata("/vender");

const Page = () => <VenderClient />;

export default Page;
