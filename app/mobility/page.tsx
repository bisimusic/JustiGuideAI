"use client";

import dynamic from "next/dynamic";

const MobilityDashboard = dynamic(
  () => import("./MobilityDashboard"),
  { ssr: false }
);

export default function MobilityPage() {
  return <MobilityDashboard />;
}
