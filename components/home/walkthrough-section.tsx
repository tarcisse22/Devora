import { Container } from "@/components/ui/container";
import { FadeIn } from "@/components/ui/fade-in";
import { WalkthroughVideo } from "@/components/video/walkthrough-video";

export function WalkthroughSection() {
  return (
    <section id="walkthrough" aria-labelledby="walkthrough-heading" className="relative pb-20 pt-6 sm:pb-28 sm:pt-10">
      <Container>
        <FadeIn inView className="mx-auto max-w-[680px] text-center">
          <p className="text-[13px] font-medium text-accent-300">Product walkthrough</p>
          <h2
            id="walkthrough-heading"
            className="mt-3 text-[clamp(1.9rem,3.6vw,2.6rem)] font-semibold leading-[1.1] tracking-[-0.03em] text-fg"
          >
            See how the pieces fit together
          </h2>
          <p className="mt-4 text-[16px] leading-relaxed text-fg-muted sm:text-[17px]">
            A guided tour of Devora — from reading a concept, to visualizing it, to writing and running the code
            yourself.
          </p>
        </FadeIn>
        <FadeIn inView delay={0.1} className="mx-auto mt-12 max-w-[1040px]">
          <WalkthroughVideo
            title="Devora product walkthrough"
            description="Lessons, visualizers, the playground, SQL Lab and practice challenges — and how they connect."
          />
        </FadeIn>
      </Container>
    </section>
  );
}
