import type { Metadata } from "next";
import CommunityPageClient from "@/components/community/CommunityPage";

export const metadata: Metadata = { title: "Community" };

export default function Page() {
  return <CommunityPageClient />;
}
