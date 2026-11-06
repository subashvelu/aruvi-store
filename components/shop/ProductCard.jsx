"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { formatCurrency } from "../../lib/formatters";
import { useStore } from "../../context/StoreContext";
import { ArrowRightIcon, ShoppingBagIcon } from "../shared/Icons";
import ProductVisual from "../shared/ProductVisual";

export default function ProductCard({ product, index = 0 }) {
  const { openCheckout } = useStore();
  const defaultOption = product.purchaseOptions?.[0];
  const hasMultipleFormats = product.purchaseOptions && product.purchaseOptions.length > 1;

  const scene = product.gallery?.[0] || {
    id: `${product.slug || "product"}-scene-1`,
    background: "linear-gradient(135deg, #111827 0%, #1f2937 100%)",
    eyebrow: "Featured",
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.55, delay: index * 0.06 }}
      className="group rounded-[2rem] border border-white/10 bg-white/[0.03] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.24)] backdrop-blur"
    >
      <Link href={`/shop/${product.slug}`} className="block">
        <ProductVisual product={product} scene={scene} compact />
      </Link>

      <div className="px-2 pb-2 pt-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-teal-300">{product.category}</p>
            <Link href={`/shop/${product.slug}`} className="mt-2 block text-2xl font-semibold text-white transition group-hover:text-teal-200">
              {product.name}
            </Link>
          </div>
          <span className="rounded-full border border-teal-400/30 bg-teal-400/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.28em] text-teal-200">
            {product.tag}
          </span>
        </div>

        <p className="mt-4 text-sm leading-7 text-white/62">{product.shortDescription}</p>

        <div className="mt-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/35">{hasMultipleFormats ? "Starts at" : "Price"}</p>
            <p className="mt-1 text-2xl font-semibold text-white">{formatCurrency(product.price)}</p>
            {hasMultipleFormats ? (
              <p className="mt-1 text-xs uppercase tracking-[0.24em] text-white/40">
                {product.purchaseOptions.map((option) => option.label).join(" / ")}
              </p>
            ) : null}
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={`/shop/${product.slug}`}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-3 text-sm font-medium text-white/80 transition hover:border-white/25 hover:text-white"
            >
              Details
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
            <button
              type="button"
              onClick={() => openCheckout(product, defaultOption?.id)}
              className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-teal-100"
            >
              <ShoppingBagIcon className="h-4 w-4" />
              Buy Now
            </button>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
