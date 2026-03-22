import type { Metadata } from "next";
import { Bodoni_Moda, Inter_Tight } from "next/font/google";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import "./globals.css";

const bodoniModa = Bodoni_Moda({
  variable: "--font-bodoni-moda",
  subsets: ["latin"],
});

const interTight = Inter_Tight({
  variable: "--font-inter-tight",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Maia Comley - Creative Marketer",
  description: "Creative marketer blending strategy, content & design.",
  icons: "/favicon.png",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${bodoniModa.variable} ${interTight.variable} min-h-full antialiased`}
    >
      <body className="min-h-full flex flex-col items-center">
        <NuqsAdapter>{children}</NuqsAdapter>
      </body>
    </html>
  );
}
