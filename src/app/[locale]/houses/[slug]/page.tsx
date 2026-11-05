import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { houseBySlug, houses } from "@/data/houses";
import { isLocale, locales } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import HouseHero from "@/components/house/HouseHero";
import HouseAbout from "@/components/house/HouseAbout";
import HouseGallery from "@/components/house/HouseGallery";
import BookingSection from "@/components/house/BookingSection";
import OtherHouses from "@/components/house/OtherHouses";
import MobileBookBar from "@/components/house/MobileBookBar";

export function generateStaticParams() {
  return locales.flatMap((locale) => houses.map((h) => ({ locale, slug: h.slug })));
}

export async function generateMetadata({ params }: PageProps<"/[locale]/houses/[slug]">): Promise<Metadata> {
  const { locale, slug } = await params;
  const house = houseBySlug(slug);
  if (!house || !isLocale(locale)) return {};
  const t = getDictionary(locale);
  return {
    title: `${house.name[locale]} — ${t.brand}`,
    description: house.tagline[locale],
    openGraph: { images: [`${house.cover}?w=1200&q=70&auto=format`] },
  };
}

export default async function HousePage({ params }: PageProps<"/[locale]/houses/[slug]">) {
  const { slug } = await params;
  const house = houseBySlug(slug);
  if (!house) notFound();

  return (
    <>
      <HouseHero slug={house.slug} />
      <HouseAbout slug={house.slug} />
      <HouseGallery slug={house.slug} />
      <Suspense>
        <BookingSection slug={house.slug} />
      </Suspense>
      <OtherHouses slug={house.slug} />
      <MobileBookBar slug={house.slug} />
    </>
  );
}
