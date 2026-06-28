import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Insightly — Product Analytics",
  description:
    "A product-analytics SaaS (mini PostHog): event ingestion, funnels, retention, time-series and top events.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
