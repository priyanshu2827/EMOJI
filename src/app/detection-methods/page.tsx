import DetectionMethodsClient from "@/components/app/detection-methods-client";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Detection Methods - INVISIFY",
    description: "Learn how INVISIFY detects hidden content, steganography, and Unicode-based threats.",
};

export default function DetectionMethodsPage() {
    return <DetectionMethodsClient />;
}
