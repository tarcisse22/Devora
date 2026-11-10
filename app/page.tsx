import { Hero } from "@/components/home/hero";
import { LiveDemoSection } from "@/components/home/live-demo-section";
import { PlatformOverview } from "@/components/home/platform-overview";

export default function HomePage() {
  return (
    <>
      <Hero />
      <LiveDemoSection />
      <PlatformOverview />
    </>
  );
}
