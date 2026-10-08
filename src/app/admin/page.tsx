import type { Metadata } from "next";
import AdminApp from "@/components/admin/AdminApp";
import { seedCatalog } from "@/data/seed";
import "./admin.css";

export const metadata: Metadata = {
  title: "Admin panel — Nazokat Lady Shop",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return <AdminApp seed={seedCatalog()} />;
}
