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
  title: "The Nest",
  description: "Cal State LA's social platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-4 bg-white px-8 text-center dark:bg-gray-950 md:hidden">
          <span className="text-5xl">🐦</span>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">The Nest</h1>
          <p className="text-gray-500 dark:text-gray-400">Mobile app coming soon.</p>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            In the meantime, visit us on a desktop or laptop browser.
          </p>
        </div>
      </body>
    </html>
  );
}
