import { Hero } from "@/components/home/hero";
import { WalkthroughSection } from "@/components/home/walkthrough-section";
import { PlatformOverview } from "@/components/home/platform-overview";

export default function HomePage() {
  return (
    <>
      <Hero />
      <WalkthroughSection />
      <PlatformOverview />
    </>
  );
}
