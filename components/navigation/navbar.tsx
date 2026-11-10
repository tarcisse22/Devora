"use client";

import { useEffect, useState } from "react";
import { mainNav } from "@/lib/site";
import { cn } from "@/lib/utils";
import { Container } from "@/components/ui/container";
import { Logo } from "@/components/ui/logo";
import { ButtonLink } from "@/components/ui/button";
import { NavLink } from "./nav-link";
import { MobileMenu } from "./mobile-menu";
import { SearchButton } from "./search-button";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 border-b transition-[background-color,border-color,backdrop-filter] duration-300",
        scrolled
          ? "border-line bg-canvas/75 backdrop-blur-xl backdrop-saturate-150"
          : "border-transparent bg-transparent",
      )}
    >
      <Container className="flex h-[72px] items-center justify-between gap-4 xl:h-[84px]">
        <Logo />

        <nav aria-label="Primary" className="hidden xl:block">
          <ul className="flex items-center">
            {mainNav.map((item) => (
              <li key={item.href}>
                <NavLink href={item.href}>{item.label}</NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-3">
          <SearchButton />
          <ButtonLink href="/sign-in" variant="secondary" size="md" className="hidden sm:inline-flex">
            Sign In
          </ButtonLink>
          <ButtonLink href="/get-started" variant="primary" size="md" className="hidden sm:inline-flex">
            Get Started
          </ButtonLink>
          <MobileMenu />
        </div>
      </Container>
    </header>
  );
}
