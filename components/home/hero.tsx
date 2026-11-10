import { ArrowRight, Compass } from "lucide-react";
import { Container } from "@/components/ui/container";
import { ButtonLink } from "@/components/ui/button";
import { Pill } from "@/components/ui/pill";
import { FadeIn } from "@/components/ui/fade-in";
import { HeroAtmosphere } from "@/components/layout/hero-atmosphere";
import { DijkstraPreview } from "@/components/visualizers/dijkstra-preview";
import { FeatureList } from "./feature-list";

const pillars = ["Learn", "Build", "Practice", "Master"];

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden pt-[72px] xl:pt-[84px]">
      <HeroAtmosphere />

      <Container className="relative grid items-center gap-14 pb-20 pt-12 sm:pt-16 lg:pb-24 lg:pt-16 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.04fr)] xl:gap-x-12 xl:gap-y-16 min-[1440px]:gap-x-14">
        {/* Copy */}
        <div className="max-w-[700px]">
          <FadeIn>
            <Pill>
              <span className="flex items-center gap-3">
                {pillars.map((p) => (
                  <span key={p}>{p}</span>
                ))}
              </span>
            </Pill>
          </FadeIn>

          <FadeIn delay={0.08}>
            <h1 className="mt-7 text-[clamp(2.4rem,5.4vw,3.6rem)] font-semibold leading-[1.06] tracking-[-0.035em] text-fg xl:text-[4rem]">
              A modern space to learn,{" "}
              <span className="text-gradient-accent">practice,</span> and master{" "}
              <span className="text-gradient-accent">Computer Science.</span>
            </h1>
          </FadeIn>

          <FadeIn delay={0.16}>
            <p className="mt-6 max-w-[560px] text-[17px] leading-relaxed text-fg-muted sm:text-lg">
              Learn by doing. Explore interactive visualizations, experiment with code, solve challenges, and build
              skills that translate into real-world development.
            </p>
          </FadeIn>

          <FadeIn delay={0.24}>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
              <ButtonLink href="/learn" size="lg" className="px-7">
                Start Learning
                <ArrowRight
                  className="size-4 transition-transform duration-200 group-hover/button:translate-x-0.5"
                  strokeWidth={2}
                />
              </ButtonLink>
              <ButtonLink href="#explore" variant="secondary" size="lg" className="px-7">
                <Compass className="size-4" strokeWidth={1.75} />
                Explore Devora
              </ButtonLink>
            </div>
          </FadeIn>
        </div>

        {/* Visualizer preview — spans both rows on desktop, sits after the CTAs on mobile */}
        <FadeIn delay={0.2} y={20} className="relative [perspective:2000px] xl:col-start-2 xl:row-span-2 xl:row-start-1 min-[1440px]:-mr-6">
          <div className="transition-transform duration-700 ease-[var(--ease-out-soft)] min-[1440px]:[transform:rotateY(-10deg)_rotateX(5deg)] min-[1440px]:hover:[transform:rotateY(-4deg)_rotateX(2deg)]">
            <DijkstraPreview />
          </div>
        </FadeIn>

        <FadeIn delay={0.32} className="xl:col-start-1 xl:row-start-2">
          <FeatureList className="max-w-[700px]" />
        </FadeIn>
      </Container>
    </section>
  );
}
