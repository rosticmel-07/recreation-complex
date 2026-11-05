import Hero from "@/components/Hero";
import TerritoryMap from "@/components/TerritoryMap";
import HousesShowcase from "@/components/HousesShowcase";
import AvailabilityStrip from "@/components/AvailabilityStrip";
import Territory from "@/components/Territory";
import Location from "@/components/Location";
import Faq from "@/components/Faq";
import DayStory from "@/components/DayStory";

export default function HomePage() {
  return (
    <>
      <Hero />
      <TerritoryMap />
      <HousesShowcase />
      <AvailabilityStrip />
      <Territory />
      <Location />
      <Faq />
      <DayStory />
    </>
  );
}
