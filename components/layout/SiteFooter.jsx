import Link from "next/link";
import BrandLogo from "../shared/BrandLogo";

const footerLinks = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/admin", label: "Admin" },
];

export default function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-[#050505]">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-5 py-10 sm:px-6 lg:flex-row lg:items-end lg:justify-between lg:px-8">
        <div className="max-w-lg">
          <BrandLogo href="/" size="sm" className="mb-4" />
          <p className="text-sm uppercase tracking-[0.35em] text-teal-300">Aruvi Study Kits</p>
          <h2 className="mt-3 text-2xl font-semibold text-white">Built for learners who want to ship real cloud projects.</h2>
          <p className="mt-3 text-sm leading-7 text-white/60">
            Aruvi brings cheat sheets, templates, and study guides for cloud and DevOps into one simple storefront.
          </p>
        </div>

        <div className="flex flex-col gap-4 lg:items-end">
          <div className="flex flex-wrap gap-3">
            {footerLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full border border-white/10 px-4 py-2 text-sm text-white/70 transition hover:border-teal-400/50 hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </div>
          <p className="text-xs uppercase tracking-[0.28em] text-white/35">Aruvi © 2026. Keep learning, keep shipping.</p>
        </div>
      </div>
    </footer>
  );
}
