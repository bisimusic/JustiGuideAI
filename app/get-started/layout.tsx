import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Get started - JustiGuide AI",
  description:
    "Watch our video to get started with JustiGuide and your immigration journey.",
};

export default function GetStartedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
