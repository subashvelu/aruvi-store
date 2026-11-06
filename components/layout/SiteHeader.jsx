"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import BrandLogo from "../shared/BrandLogo";
import { CloseIcon, MenuIcon } from "../shared/Icons";

const navigation = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
];

function NavLink({ href, label, pathname, onClick }) {
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`rounded-full px-5 py-2 text-base font-semibold transition ${
        isActive ? "bg-white text-zinc-950" : "text-white/72 hover:text-white"
      }`}
    >
      {label}
    </Link>
  );
}

export default function SiteHeader() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#050505]/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-1 sm:px-5 lg:px-8">
        <div className="flex items-center gap-1.5">
          <BrandLogo href="/" priority size="xxs" />
          <div className="hidden xl:block">
            <p className="text-[0.58rem] uppercase tracking-[0.32em] text-white/35">Cloud &amp; DevOps Study Kits</p>
          </div>
        </div>

        <nav className="hidden items-center gap-1 rounded-full border border-white/10 bg-white/5 p-1.5 lg:flex">
          {navigation.map((item) => (
            <NavLink key={item.href} {...item} pathname={pathname} />
          ))}
        </nav>

        <button
          type="button"
          onClick={() => setIsOpen((current) => !current)}
          className="inline-flex h-8.5 w-8.5 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white lg:hidden"
        >
          {isOpen ? <CloseIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
        </button>
      </div>

      <AnimatePresence>
        {isOpen ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-t border-white/10 bg-[#080808] lg:hidden"
          >
            <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-5">
              {navigation.map((item) => (
                <NavLink key={item.href} {...item} pathname={pathname} onClick={() => setIsOpen(false)} />
              ))}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
