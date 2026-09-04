import type { Metadata } from "next";
import { Inter, Fraunces } from "next/font/google";
import "./globals.css";

/**
 * Webfonts. We rely on `next/font/google` so fonts are downloaded at
 * build time, self-hosted, and served from the same origin (no FOUT,
 * no third-party request in production). Both fonts are configured
 * with system-level fallbacks so the UI is usable even if the build
 * environment has Google Fonts blocked.
 */
const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  fallback: ["system-ui", "Segoe UI", "Helvetica", "Arial", "sans-serif"],
});

const editorial = Fraunces({
  subsets: ["latin"],
  variable: "--font-editorial",
  display: "swap",
  axes: ["opsz"],
  fallback: ["Georgia", "Cambria", "Times New Roman", "serif"],
});

export const metadata: Metadata = {
  metadataBase: new URL("http://localhost:3000"),
  title: {
    default: "Vestaply — Sourcing B2B para moda",
    template: "%s — Vestaply",
  },
  description:
    "Plataforma B2B para captação e qualificação de demandas de compra no atacado de moda. Compradores descrevem o que precisam, a equipe Vestaply qualifica e encaminha para fornecedores compatíveis.",
  applicationName: "Vestaply",
  robots: { index: true, follow: true },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/logo.png",
  },
  openGraph: {
    title: "Vestaply — Sourcing B2B para moda",
    description:
      "Plataforma B2B para captação e qualificação de demandas de compra no atacado de moda.",
    type: "website",
    locale: "pt_BR",
    siteName: "Vestaply",
    images: "/logo.png",
  },
  twitter: {
    card: "summary",
    title: "Vestaply — Sourcing B2B para moda",
    description:
      "Plataforma B2B para captação e qualificação de demandas de compra no atacado de moda.",
    images: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${sans.variable} ${editorial.variable}`}>
      <body className="min-h-screen bg-ivory-50 font-sans text-charcoal-900 antialiased">
        <a
          href="#conteudo"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-green-800 focus:px-4 focus:py-2 focus:text-white"
        >
          Pular para o conteúdo
        </a>
        {children}
      </body>
    </html>
  );
}