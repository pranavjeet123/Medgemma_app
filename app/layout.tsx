import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Dental Analysis",
  description: "AI-powered dental image analysis using MedGemma 1.5 4b",
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
