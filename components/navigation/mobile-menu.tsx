"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { mainNav } from "@/lib/site";
import { ButtonLink } from "@/components/ui/button";

export function MobileMenu() {
  const [open, setOpen] = useState(false);

  // Lock scroll and allow Escape to close while the menu is open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const close = () => setOpen(false);
  // Portal target only exists on the client.
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-controls="mobile-menu"
        onClick={() => setOpen((v) => !v)}
        className="relative flex size-10 items-center justify-center rounded-[var(--radius-md)] border border-line-strong bg-white/[0.03] text-fg transition-colors hover:bg-white/[0.07]"
      >
        {open ? <X className="size-5" strokeWidth={1.75} /> : <Menu className="size-5" strokeWidth={1.75} />}
      </button>

      {mounted &&
        createPortal(
          <AnimatePresence>
            {open && (
              <motion.div
                id="mobile-menu"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-40 bg-canvas/95 backdrop-blur-xl lg:hidden"
              >
                <motion.nav
                  aria-label="Mobile"
                  initial={{ y: -8, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -8, opacity: 0 }}
                  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                  className="flex h-full flex-col px-5 pb-8 pt-24 sm:px-8"
                >
                  <ul className="flex flex-col">
                    {mainNav.map((item) => (
                      <li key={item.href} className="border-b border-line">
                        <Link
                          href={item.href}
                          onClick={close}
                          className="flex items-center justify-between py-4 text-xl font-medium text-fg/90 transition-colors hover:text-fg"
                        >
                          {item.label}
                          <ArrowUpRight className="size-4 text-fg-subtle" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-auto grid grid-cols-2 gap-3">
                    <ButtonLink href="#sign-in" onClick={close} variant="secondary" size="lg">
                      Sign In
                    </ButtonLink>
                    <ButtonLink href="#get-started" onClick={close} variant="primary" size="lg">
                      Get Started
                    </ButtonLink>
                  </div>
                </motion.nav>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </div>
  );
}
