import type { Metadata } from "next";
import { Afacad } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const afacad = Afacad({
  variable: "--font-afacad",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ComSci StudySpot",
  description: "Online Learning Platform for CS@KU",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.getItem('theme') === 'dark' || (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (_) {}
            `,
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
          window.env = ${JSON.stringify({
            API_URL:
              process.env.IS_PROXIED === "true" ? "" : process.env.API_URL,
            IS_PROXIED: process.env.IS_PROXIED || "false",
          })};
          `,
          }}
        />
      </head>
      <body
        suppressHydrationWarning
        className={`${afacad.className} antialiased`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
