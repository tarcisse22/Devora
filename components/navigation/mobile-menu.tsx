"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Menu, Search, X } from "lucide-react";
import { mainNav } from "@/lib/site";
import { cn } from "@/lib/utils";
import { MobileAccountLinks } from "@/components/auth/user-menu";
import { useSearch } from "@/components/search/search-provider";
import { isActivePath } from "./nav-link";

const subscribe = () => () => {};

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const search = useSearch();
  // Portal target only exists on the client.
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);

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

  return (
    <div className="xl:hidden">
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
                className="fixed inset-0 z-40 overflow-y-auto bg-canvas/95 backdrop-blur-xl xl:hidden"
              >
                <motion.nav
                  aria-label="Mobile"
                  initial={{ y: -8, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -8, opacity: 0 }}
                  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                  className="mx-auto flex min-h-full max-w-[640px] flex-col px-5 pb-8 pt-[88px] sm:px-8"
                >
                  <button
                    type="button"
                    onClick={() => {
                      close();
                      search.open();
                    }}
                    className="mb-4 flex h-11 w-full items-center gap-3 rounded-[var(--radius-md)] border border-line-strong bg-white/[0.03] px-3.5 text-[15px] text-fg-muted transition-colors hover:bg-white/[0.06] hover:text-fg"
                  >
                    <Search className="size-[18px]" strokeWidth={1.75} aria-hidden />
                    Search Devora
                  </button>
                  <ul className="flex flex-col">
                    {mainNav.map((item) => {
                      const active = isActivePath(pathname, item.href);
                      return (
                        <li key={item.href} className="border-b border-line">
                          <Link
                            href={item.href}
                            onClick={close}
                            aria-current={active ? "page" : undefined}
                            className={cn(
                              "flex items-center justify-between py-3.5 text-lg font-medium transition-colors",
                              active ? "text-accent-200" : "text-fg/90 hover:text-fg",
                            )}
                          >
                            {item.label}
                            <ArrowUpRight className="size-4 text-fg-subtle" aria-hidden />
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                  <MobileAccountLinks onNavigate={close} />
                </motion.nav>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </div>
  );
}
