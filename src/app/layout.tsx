import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthProvider";
import { ThemeProvider } from "@/context/ThemeProvider";

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
  themeColor: "#0E0D0B",
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://kantoprep.vercel.app'),
  title: "KantoPrep | Tokyo International School Study Network",
  description: "Student-governed platform connecting Tokyo international school students (A-JIS, BST, ASIJ, KIST) into syllabus-aligned study pods (IB, AP, IGCSE, SAT).",
  keywords: [
    "IB Diploma",
    "Aoba-Japan International School",
    "A-JIS",
    "Tokyo international school",
    "study pods",
    "past paper sprints",
    "AP exams",
    "IGCSE revision",
    "peer study groups",
  ],
  authors: [{ name: "Amgaa" }],
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/apple-icon.png",
  },
  openGraph: {
    title: "KantoPrep | Tokyo International School Study Network",
    description: "Never cram alone. Connect with verified Tokyo international high school peers (IB, AP, IGCSE, SAT) for past paper sprints at quiet libraries.",
    type: "website",
    locale: "en_US",
    siteName: "KantoPrep",
    images: [
      {
        url: "/logo.png",
        width: 512,
        height: 512,
        alt: "KantoPrep - Connect, Study, Succeed",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "KantoPrep | Tokyo International School Study Network",
    description: "Never cram alone. Connect with verified Tokyo international high school peers for syllabus-aligned study pods.",
    images: ["/logo.png"],
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
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var saved = localStorage.getItem('kantoprep_theme');
                if (saved === 'light') {
                  document.documentElement.classList.add('light');
                  document.documentElement.classList.remove('dark');
                } else {
                  document.documentElement.classList.add('dark');
                  document.documentElement.classList.remove('light');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#0E0D0B] text-[#EDEDEB] selection:bg-[#F5B942]/30 selection:text-white">
        <ThemeProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
