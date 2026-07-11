import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import "@/lib/env";
import { Toaster } from "sonner";
import QueryProvider from "@/components/providers/QueryProvider";
import AppearanceProvider from "@/components/providers/AppearanceProvider";
import { AuthProvider } from "@/lib/auth-context";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "GymRat Hub — Train Smarter. Live Stronger.",
    template: "%s | GymRat Hub",
  },
  description:
    "GymRat Hub is your all-in-one fitness platform. Access 10,000+ workouts, track nutrition, connect with elite trainers, and join a community of 128K+ athletes.",
  manifest: "/manifest.json",
  keywords: [
    "gym",
    "workout",
    "fitness",
    "nutrition",
    "personal trainer",
    "weight loss",
    "muscle building",
  ],
  openGraph: {
    title: "GymRat Hub — Train Smarter. Live Stronger.",
    description: "Your all-in-one fitness platform with 10,000+ workouts and expert trainers.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable} dark`} suppressHydrationWarning>
      <body className="bg-[#0a0a0a] text-white font-sans antialiased" suppressHydrationWarning>
        <AuthProvider>
          <QueryProvider>
            <AppearanceProvider>
              {children}
            </AppearanceProvider>
            <Toaster
              theme="dark"
              position="bottom-right"
              toastOptions={{
                style: {
                  background: "#1c1c1c",
                  border: "1px solid #2a2a2a",
                  color: "#fff",
                },
              }}
            />
          </QueryProvider>
        </AuthProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(function(reg) {
                    console.log('ServiceWorker registration successful with scope: ', reg.scope);
                  }, function(err) {
                    console.log('ServiceWorker registration failed: ', err);
                  });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
