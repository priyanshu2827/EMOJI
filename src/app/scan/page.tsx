import ScanPageClient from "@/components/app/scan-page-client";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Scan - INVISIFY",
    description: "Analyze content for hidden steganography.",
};

export default function ScanPage() {
  return <ScanPageClient />;
}
