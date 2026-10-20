import "./globals.css";
import { RootProvider } from "fumadocs-ui/provider/next";
import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import type { ReactNode } from "react";
import { SiteNotifier } from "@/modules/notifier/components/site-notifier";
import { DocsSearchDialog } from "@/modules/search/components/search-dialog";
import { searchTags } from "@/modules/search/server/sections";
import { site } from "@/shared/config/site";
import { IconMotion } from "@/shared/icons/icon-motion";

const sans = Geist({ subsets: ["latin"], variable: "--font-sans" });
const mono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" });
const toastFont = Inter({ subsets: ["latin"], variable: "--font-toast" });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { template: `%s | ${site.name}`, default: site.name },
  description: site.description,
  applicationName: site.name,
  keywords: site.keywords,
  authors: [site.author],
  creator: site.author.name,
  openGraph: {
    type: "website",
    siteName: site.name,
    title: site.name,
    description: site.description,
    url: "/",
  },
  twitter: { card: "summary", title: site.name, description: site.description },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${sans.variable} ${mono.variable} ${toastFont.variable} antialiased`}
      suppressHydrationWarning
    >
      <body className="font-sans">
        <RootProvider search={{ SearchDialog: DocsSearchDialog, options: { tags: searchTags() } }}>
          {children}
          <SiteNotifier />
        </RootProvider>
        <IconMotion />
      </body>
    </html>
  );
}
