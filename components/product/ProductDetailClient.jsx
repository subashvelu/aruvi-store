"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";
import { useStore } from "../../context/StoreContext";
import { formatCurrency } from "../../lib/formatters";
import SiteFooter from "../layout/SiteFooter";
import SiteHeader from "../layout/SiteHeader";
import { ArrowRightIcon, CheckCircleIcon, ShieldIcon, TruckIcon } from "../shared/Icons";
import ProductVisual from "../shared/ProductVisual";

export default function ProductDetailClient({ slug }) {
  const { products, openCheckout } = useStore();
  const product = products.find((item) => item.slug === slug);
  const [activeImage, setActiveImage] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState("digital");

  if (!product) {
    return (
      <div className="min-h-screen bg-[#050505] text-white">
        <SiteHeader />
        <main className="mx-auto flex max-w-4xl flex-col items-center px-5 py-24 text-center sm:px-6 lg:px-8">
          <p className="text-sm uppercase tracking-[0.35em] text-teal-300">Product not found</p>
          <h1 className="mt-4 text-4xl font-semibold text-white">This product is not in the current Aruvi catalog.</h1>
          <p className="mt-4 max-w-xl text-sm leading-7 text-white/60">If it was newly added from the admin panel, revisit the shop and open it again from there.</p>
          <Link href="/shop" className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-zinc-950">
            Back to Shop
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </main>
        <SiteFooter />
      </div>
    );
  }

  const purchaseOptions = product.purchaseOptions || [];
  const selectedOption =
    purchaseOptions.find((option) => option.id === selectedOptionId) ||
    purchaseOptions[0];

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <SiteHeader />

      <main className="mx-auto max-w-7xl px-5 py-14 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-wrap items-center gap-3 text-sm text-white/45">
          <Link href="/" className="transition hover:text-white">Home</Link>
          <span>/</span>
          <Link href="/shop" className="transition hover:text-white">Shop</Link>
          <span>/</span>
          <span className="text-white">{product.name}</span>
        </div>

        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <motion.section initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
            <ProductVisual product={product} scene={product.gallery[activeImage]} />

            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              {product.gallery.map((scene, index) => (
                <button
                  key={scene.id}
                  type="button"
                  onClick={() => setActiveImage(index)}
                  className={`rounded-[1.5rem] border p-2 transition ${
                    activeImage === index ? "border-teal-400/50 bg-teal-400/10" : "border-white/10 bg-white/[0.03]"
                  }`}
                >
                  <ProductVisual product={product} scene={scene} compact className="min-h-[140px]" />
                </button>
              ))}
            </div>
          </motion.section>

          <motion.section initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.08 }}>
            <div className="rounded-[2.5rem] border border-white/10 bg-white/[0.03] p-8">
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full border border-teal-400/30 bg-teal-400/10 px-4 py-2 text-xs uppercase tracking-[0.3em] text-teal-200">
                  {product.category}
                </span>
                <span className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs uppercase tracking-[0.3em] text-white/60">
                  {product.tag}
                </span>
              </div>

              <h1 className="mt-6 text-5xl font-semibold leading-tight text-white">{product.name}</h1>
              <p className="mt-4 text-lg leading-8 text-white/65">{product.description}</p>

              {purchaseOptions.length > 1 ? (
                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                  {purchaseOptions.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setSelectedOptionId(option.id)}
                      className={`rounded-[1.5rem] border p-5 text-left transition ${
                        selectedOption?.id === option.id
                          ? "border-teal-400/50 bg-teal-400/10"
                          : "border-white/10 bg-white/[0.03]"
                      }`}
                    >
                      <p className="text-xs uppercase tracking-[0.3em] text-teal-200">{option.label}</p>
                      <p className="mt-3 text-3xl font-semibold text-white">{formatCurrency(option.price)}</p>
                      <p className="mt-3 text-sm leading-7 text-white/62">{option.deliveryType === "digital" ? "Digital copy shared by Google Drive." : "Physical copy delivered to the shipping address."}</p>
                    </button>
                  ))}
                </div>
              ) : null}

              <div className="mt-8 flex items-center justify-between rounded-[2rem] border border-white/10 bg-black/25 px-6 py-5">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-white/35">Price</p>
                  <p className="mt-2 text-4xl font-semibold text-white">{formatCurrency(selectedOption?.price || product.price)}</p>
                </div>
                <div className="rounded-full border border-emerald-400/25 bg-emerald-400/10 px-4 py-2 text-xs uppercase tracking-[0.28em] text-emerald-200">
                  {selectedOption?.deliveryLabel || product.shippingLabel}
                </div>
              </div>

              <div className="mt-8 grid gap-4">
                {product.features.map((feature) => (
                  <div key={feature} className="flex items-start gap-3 rounded-[1.5rem] border border-white/10 bg-white/[0.03] px-5 py-4">
                    <CheckCircleIcon className="mt-0.5 h-5 w-5 text-teal-200" />
                    <p className="text-sm leading-7 text-white/72">{feature}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-5">
                  <div className="flex items-center gap-3 text-teal-200">
                    <TruckIcon className="h-5 w-5" />
                    <p className="text-sm font-medium text-white">Shipping & delivery</p>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-white/62">{selectedOption?.note || product.deliveryNote}</p>
                </div>
                <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-5">
                  <div className="flex items-center gap-3 text-teal-200">
                    <ShieldIcon className="h-5 w-5" />
                    <p className="text-sm font-medium text-white">Secure checkout</p>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-white/62">Customer details are reviewed before payment and Razorpay is triggered from the final confirmation step.</p>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => openCheckout(product, selectedOption?.id)}
                className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-6 py-4 text-sm font-semibold text-zinc-950 transition hover:bg-teal-100"
              >
                Buy Now
                <ArrowRightIcon className="h-4 w-4" />
              </motion.button>
            </div>
          </motion.section>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
