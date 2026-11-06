"use client";

import { useState } from "react";
import SiteFooter from "../layout/SiteFooter";
import SiteHeader from "../layout/SiteHeader";
import ProductCard from "./ProductCard";
import { PRODUCT_CATEGORIES } from "../../lib/mock-data";
import { useStore } from "../../context/StoreContext";
import {
  BackpackIcon,
  BookIcon,
  BottleIcon,
  CalendarIcon,
  DumbbellIcon,
  SearchIcon,
  ShirtIcon,
} from "../shared/Icons";

const categoryIcons = {
  "E-books": BookIcon,
  "Desk Gear": DumbbellIcon,
  Stickers: BottleIcon,
  Planners: CalendarIcon,
  Bags: BackpackIcon,
  "Merch": ShirtIcon,
};

export default function ShopPageClient() {
  const { products, isProductsLoading } = useStore();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [query, setQuery] = useState("");

  const filteredProducts = products.filter((product) => {
    const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
    const matchesQuery =
      query.trim() === "" ||
      product.name.toLowerCase().includes(query.trim().toLowerCase()) ||
      product.shortDescription.toLowerCase().includes(query.trim().toLowerCase());

    return matchesCategory && matchesQuery;
  });

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <SiteHeader />

      <main className="mx-auto max-w-7xl px-5 py-14 sm:px-6 lg:px-8">
        <div className="rounded-[2.5rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.22),transparent_28%),rgba(255,255,255,0.03)] p-8">
          <p className="text-sm uppercase tracking-[0.35em] text-teal-300">Complete shop</p>
          <h1 className="mt-4 max-w-3xl text-5xl font-semibold leading-tight text-white">Every Aruvi study kit, organized for fast learning and clean discovery.</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-white/65">
            Filter by category, move into a detailed product view, and launch checkout from anywhere in the buying flow.
          </p>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[280px_1fr]">
          <aside className="h-fit rounded-[2rem] border border-white/10 bg-white/[0.03] p-5">
            <div className="relative">
              <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search products"
                className="w-full rounded-full border border-white/10 bg-black/25 py-3 pl-11 pr-4 text-sm text-white outline-none placeholder:text-white/30 focus:border-teal-300"
              />
            </div>

            <div className="mt-6">
              <p className="text-xs uppercase tracking-[0.35em] text-white/35">Categories</p>
              <div className="mt-4 space-y-2">
                {PRODUCT_CATEGORIES.map((category) => {
                  const Icon = categoryIcons[category];
                  const isActive = selectedCategory === category;

                  return (
                    <button
                      key={category}
                      type="button"
                      onClick={() => setSelectedCategory(category)}
                      className={`flex w-full items-center justify-between rounded-[1.25rem] border px-4 py-3 text-left transition ${
                        isActive
                          ? "border-teal-400/40 bg-teal-400/10 text-white"
                          : "border-white/8 bg-white/[0.02] text-white/62 hover:border-white/20 hover:text-white"
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        {Icon ? <Icon className="h-4 w-4" /> : null}
                        <span className="text-sm font-medium">{category}</span>
                      </span>
                      <span className="text-xs uppercase tracking-[0.28em]">
                        {isProductsLoading
                          ? "..."
                          : category === "All"
                            ? products.length
                            : products.filter((product) => product.category === category).length}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>

          <section>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.35em] text-teal-300">{selectedCategory === "All" ? "All categories" : selectedCategory}</p>
                <h2 className="mt-2 text-3xl font-semibold text-white">
                  {isProductsLoading ? "Loading products..." : `${filteredProducts.length} products ready to move.`}
                </h2>
              </div>
              <p className="max-w-md text-sm leading-7 text-white/58">Every card links to a detailed product page with gallery, features, shipping, and animated checkout.</p>
            </div>

            {isProductsLoading ? (
              <div className="mt-10 rounded-[2rem] border border-dashed border-teal-300/25 bg-white/[0.03] px-6 py-12 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-teal-300/25 bg-teal-400/10">
                  <span className="h-7 w-7 animate-spin rounded-full border-2 border-teal-200/25 border-t-teal-200" />
                </div>
                <p className="mt-5 text-lg font-medium text-white">Loading products...</p>
                <p className="mt-2 text-sm text-white/55">Your products are on the way. This can take a moment on the first load.</p>
                <div className="mx-auto mt-8 grid max-w-3xl gap-4 sm:grid-cols-2">
                  {[0, 1].map((item) => (
                    <div key={item} className="h-40 animate-pulse rounded-[1.5rem] border border-white/8 bg-white/[0.04]" />
                  ))}
                </div>
              </div>
            ) : (
              <div className="mt-8 grid gap-6 xl:grid-cols-2">
                {filteredProducts.map((product, index) => (
                  <ProductCard key={product.id} product={product} index={index} />
                ))}
              </div>
            )}

            {!isProductsLoading && filteredProducts.length === 0 ? (
              <div className="mt-10 rounded-[2rem] border border-dashed border-white/15 bg-white/[0.02] px-6 py-12 text-center">
                <p className="text-lg font-medium text-white">No products matched that filter.</p>
                <p className="mt-2 text-sm text-white/55">Try a different category or a broader keyword.</p>
              </div>
            ) : null}
          </section>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
