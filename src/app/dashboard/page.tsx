import DashboardPageClient from "@/components/app/dashboard-page-client";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Dashboard - StegoShield",
    description: "View and manage your scan history.",
};

export default function DashboardPage() {
    return <DashboardPageClient />;
}
