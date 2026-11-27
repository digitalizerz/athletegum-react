import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AthleteGum",
  description: "Where athletes and brands connect. Create partnerships, manage the work, and get deals done.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-ag-background text-ag-text" suppressHydrationWarning>
        <style>{`
          :root {
            --ag-primary: #4B5CFF;
            --ag-primary-hover: #3547E8;
            --ag-primary-light: #B9C2FF;
            --ag-background: #0B101C;
            --ag-surface: #141B2B;
            --ag-surface-elevated: #1B2436;
            --ag-text: #F5F6FA;
            --ag-text-secondary: #B7BECE;
            --ag-border: #30394B;
            --ag-white: #FFFFFF;
          }
          .ag-btn,
          .ag-btn-outline {
            border-radius: 8px !important;
          }
        `}</style>
        {children}
      </body>
    </html>
  );
}
