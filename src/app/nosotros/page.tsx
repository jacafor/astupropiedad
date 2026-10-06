import type { Metadata } from "next";
import NosotrosClient from "./NosotrosClient";
import { rutaMetadata } from "@/lib/seo";

export const metadata: Metadata = rutaMetadata("/nosotros");

const Page = () => <NosotrosClient />;

export default Page;
