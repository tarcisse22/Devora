import Link from "next/link";
import { features } from "@/lib/features";
import { Container } from "@/components/ui/container";
import { Logo } from "@/components/ui/logo";

const columns = [
  {
    title: "Learn",
    links: [features.learn, features.practice, features.projects, features.community].map((f) => ({
      label: f.name,
      href: f.href,
    })),
  },
  {
    title: "Tools",
    links: [features.playground, features.visualize, features["code-tracer"], features["sql-lab"]].map((f) => ({
      label: f.name,
      href: f.href,
    })),
  },
  {
    title: "Devora",
    links: [
      { label: "Home", href: "/" },
      { label: "Get Started", href: "/get-started" },
      { label: "Sign In", href: "/sign-in" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="relative border-t border-line bg-canvas">
      <Container className="grid grid-cols-3 gap-x-6 gap-y-10 py-14 md:grid-cols-[1.3fr_repeat(3,minmax(0,1fr))] md:gap-8 lg:py-16">
        <div className="col-span-3 max-w-[320px] md:col-span-1">
          <Logo />
          <p className="mt-4 text-[14px] leading-relaxed text-fg-muted">
            A modern space to learn, practice and master Computer Science — by interacting with it.
          </p>
        </div>
        {columns.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <h2 className="text-[13px] font-medium text-fg">{col.title}</h2>
            <ul className="mt-4 space-y-2.5">
              {col.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-[14px] text-fg-muted transition-colors hover:text-fg">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </Container>
      <Container className="flex flex-col gap-2 border-t border-line py-6 text-[12.5px] text-fg-subtle sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} Devora</p>
        <p>Devora is in early development. Features marked “In development” are not available yet.</p>
      </Container>
    </footer>
  );
}
