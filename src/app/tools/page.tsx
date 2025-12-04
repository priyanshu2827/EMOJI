import EmojiEncodeClient from "@/components/app/tools-page-client";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Tools - INVISIFY",
    description: "Use steganography tools like EmojiEncode.",
};

export default function ToolsPage() {
    return <EmojiEncodeClient />;
}
