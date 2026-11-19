import type { Metadata } from "next";
import { MotionConfig } from "motion/react";
import { Onest } from "next/font/google";
import "./globals.css";
import "leaflet/dist/leaflet.css";

const onest = Onest({
  variable: "--font-onest",
  weight: ["400", "500", "600"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RivinityADS | Advertising, made clearer",
  description: "Explore advertiser campaign and publisher website workflows in the RivinityADS frontend prototype.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${onest.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <MotionConfig reducedMotion="user">{children}</MotionConfig>
      </body>
    </html>
  );
}
