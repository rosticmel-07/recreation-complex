import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { Onest, Unbounded } from "next/font/google";
import { isLocale, locales } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { I18nProvider } from "@/i18n/client";
import SmoothScroll from "@/components/SmoothScroll";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LangCurtain from "@/components/LangCurtain";
import { curtainBootScript } from "@/lib/curtain";
import "../globals.css";

const unbounded = Unbounded({
  subsets: ["latin", "cyrillic"],
  weight: ["300", "400", "500"],
  variable: "--font-unbounded",
  display: "swap",
});

const onest = Onest({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500"],
  variable: "--font-onest",
  display: "swap",
});

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getDictionary(locale);
  return {
    title: t.meta.title,
    description: t.meta.description,
    alternates: { languages: { uk: "/uk", en: "/en" } },
  };
}

export const viewport: Viewport = {
  themeColor: "#13201b",
};

export default async function LocaleLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return (
    <html
      lang={locale === "uk" ? "uk" : "en"}
      className={`${unbounded.variable} ${onest.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: curtainBootScript }} />
      </head>
      <body>
        <I18nProvider locale={locale}>
          <LangCurtain />
          <SmoothScroll />
          <Header />
          <main>{children}</main>
          <Footer />
        </I18nProvider>
      </body>
    </html>
  );
}
