import type { Metadata, Viewport } from "next";
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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#f7faf8",
};

export const metadata: Metadata = {
  title: "KantoPrep | Tokyo International School Study Network",
  description: "Student-governed platform connecting Tokyo international school students (A-JIS, BST, ASIJ, KIST) into syllabus-aligned study pods (IB, AP, IGCSE, SAT).",
  keywords: [
    "IB Diploma",
    "Aoba-Japan International School",
    "A-JIS",
    "Tokyo international school",
    "study pods",
    "CAS hours",
    "past paper sprints",
    "AP exams",
  ],
  authors: [{ name: "Amgaa Gantulga" }],
  openGraph: {
    title: "KantoPrep | Tokyo International School Study Network",
    description: "Syllabus-aligned study pods, live Pomodoro sprints, and verified CAS hours for Tokyo students.",
    type: "website",
    locale: "en_US",
    siteName: "KantoPrep",
  },
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
      <body className="min-h-full flex flex-col selection:bg-emerald-500/20 selection:text-emerald-900">
        {children}
      </body>
    </html>
  );
}
