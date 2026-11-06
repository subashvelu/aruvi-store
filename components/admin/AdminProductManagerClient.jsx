"use client";

import Link from "next/link";
import { useState } from "react";
import { logoutAdmin } from "../../app/admin/actions";
import { useStore } from "../../context/StoreContext";
import { PRODUCT_CATEGORIES } from "../../lib/mock-data";
import { formatCurrency } from "../../lib/formatters";
import { ArrowRightIcon, LogOutIcon } from "../shared/Icons";

const initialForm = {
  name: "",
  category: "E-books",
  price: "",
  tag: "",
  shortDescription: "",
  description: "",
  features: "",
  shippingLabel: "",
  deliveryNote: "",
  featured: true,
  isDigitalProduct: true,
  digitalLabel: "E-book",
  digitalPrice: "49",
  digitalAccessLink: "",
  enablePhysicalVersion: true,
  physicalLabel: "Paperback",
  physicalPrice: "499",
  imageUrls: ["", "", ""],
};

export default function AdminProductManagerClient() {
  const { products, addProduct, updateProduct, removeProduct } = useStore();
  const [formState, setFormState] = useState(initialForm);
  const [message, setMessage] = useState("");
  const [editingProductId, setEditingProductId] = useState(null);
  const isEbook = formState.category === "E-books";
  const isDigitalCategory = formState.category === "E-books" || formState.category === "Bundles";

  function updateField(field, value) {
    setFormState((current) => {
      if (field === "category" && value === "E-books") {
        return {
          ...current,
          category: value,
          isDigitalProduct: true,
          enablePhysicalVersion: true,
        };
      }

      if (field === "category" && value === "Bundles") {
        return {
          ...current,
          category: value,
          isDigitalProduct: true,
          enablePhysicalVersion: false,
          physicalLabel: "",
          physicalPrice: "",
        };
      }

      if (field === "category") {
        return {
          ...current,
          category: value,
          isDigitalProduct: false,
          digitalLabel: "",
          digitalPrice: "",
          digitalAccessLink: "",
          enablePhysicalVersion: false,
          physicalLabel: "",
          physicalPrice: "",
        };
      }

      return {
        ...current,
        [field]: value,
      };
    });
  }

  function updateImageData(index, value) {
    setFormState((current) => {
      const nextImages = [...current.imageUrls];
      nextImages[index] = value;
      return {
        ...current,
        imageUrls: nextImages,
      };
    });
  }

  function updateImageFile(index, file) {
    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setMessage("Please upload image files only.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setMessage("Each product image must be 2 MB or smaller.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      updateImageData(index, reader.result || "");
      setMessage("");
    };
    reader.onerror = () => {
      setMessage("Unable to read that image. Please try another file.");
    };
    reader.readAsDataURL(file);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const imageUrls = formState.imageUrls.map((item) => item.trim()).filter(Boolean).slice(0, 3);

    if (imageUrls.length === 0) {
      setMessage("Upload at least one product image.");
      return;
    }

    const payload = {
      ...formState,
      isDigitalProduct: isDigitalCategory,
      price: isDigitalCategory ? formState.digitalPrice : formState.price,
      features: formState.features.split("\n"),
      imageUrls,
    };

    try {
      if (editingProductId) {
        const product = await updateProduct(editingProductId, payload);
        setMessage(`${product.name} was updated in the live Aruvi catalog.`);
        setEditingProductId(null);
      } else {
        const product = await addProduct(payload);
        setMessage(`${product.name} was added to the Aruvi storefront.`);
      }

      setFormState(initialForm);
    } catch (error) {
      setMessage(error.message || "Unable to save product.");
    }
  }

  function startEditing(product) {
    const productImages = (product.gallery || []).map((item) => item.imageUrl || "").filter(Boolean).slice(0, 3);
    setEditingProductId(product.id);
    setFormState({
      name: product.name,
      category: product.category,
      price: String(product.price),
      tag: product.tag,
      shortDescription: product.shortDescription,
      description: product.description,
      features: product.features.join("\n"),
      shippingLabel: product.shippingLabel,
      deliveryNote: product.deliveryNote,
      featured: product.featured,
      isDigitalProduct: product.isDigitalProduct,
      digitalLabel: product.digitalLabel || "E-book",
      digitalPrice: String(product.digitalPrice || 49),
      digitalAccessLink: product.digitalAccessLink || "",
      enablePhysicalVersion: product.enablePhysicalVersion ?? true,
      physicalLabel: product.physicalLabel || "Paperback",
      physicalPrice: String(product.physicalPrice || 499),
      imageUrls: [productImages[0] || "", productImages[1] || "", productImages[2] || ""],
    });
    setMessage(`Editing ${product.name}. Update the fields and save changes.`);
  }

  function cancelEditing() {
    setEditingProductId(null);
    setFormState(initialForm);
    setMessage("");
  }

  async function handleRemove(product) {
    try {
      await removeProduct(product.id);
      if (editingProductId === product.id) {
        setEditingProductId(null);
        setFormState(initialForm);
      }
      setMessage(`${product.name} was removed from the live Aruvi catalog.`);
    } catch (error) {
      setMessage(error.message || "Unable to remove product.");
    }
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 rounded-[2.5rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.18),transparent_28%),rgba(255,255,255,0.03)] p-8">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-teal-300">Admin Product Studio</p>
              <h1 className="mt-3 text-5xl font-semibold text-white">Add products to the live Aruvi catalog.</h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-white/62">
                This route is protected by the admin access gate. Products added here show up immediately across the shop, home page, and product detail route.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link href="/admin" className="inline-flex items-center gap-2 rounded-full border border-white/10 px-5 py-3 text-sm font-medium text-white/78 transition hover:border-white/25 hover:text-white">
                Dashboard
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
              <form action={logoutAdmin}>
                <button className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-teal-100">
                  <LogOutIcon className="h-4 w-4" />
                  Logout
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_0.95fr]">
          <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
            <p className="text-sm uppercase tracking-[0.3em] text-white/35">
              {editingProductId ? "Update product form" : "Add product form"}
            </p>
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-white/72">Product Title</span>
                  <input
                    value={formState.name}
                    onChange={(event) => updateField("name", event.target.value)}
                    className="w-full rounded-[1.25rem] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none focus:border-teal-300"
                    required
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-white/72">Category</span>
                  <select
                    value={formState.category}
                    onChange={(event) => updateField("category", event.target.value)}
                    className="w-full rounded-[1.25rem] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none focus:border-teal-300"
                  >
                    {PRODUCT_CATEGORIES.filter((item) => item !== "All").map((category) => (
                      <option key={category} value={category} className="bg-zinc-950">
                        {category}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {!isDigitalCategory ? (
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-white/72">Price (INR)</span>
                    <input
                      type="number"
                      min="0"
                      value={formState.price}
                      onChange={(event) => updateField("price", event.target.value)}
                      className="w-full rounded-[1.25rem] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none focus:border-teal-300"
                      required
                    />
                  </label>
                ) : (
                  <div className="rounded-[1.25rem] border border-dashed border-teal-400/20 bg-teal-400/5 px-4 py-3 text-sm text-white/65">
                    Digital categories use the digital and physical prices below.
                  </div>
                )}
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-white/72">Tag</span>
                  <input
                    value={formState.tag}
                    onChange={(event) => updateField("tag", event.target.value)}
                    placeholder="New Arrival"
                    className="w-full rounded-[1.25rem] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-teal-300"
                  />
                </label>
              </div>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-white/72">Short Description</span>
                <input
                  value={formState.shortDescription}
                  onChange={(event) => updateField("shortDescription", event.target.value)}
                  className="w-full rounded-[1.25rem] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none focus:border-teal-300"
                  required
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-white/72">Full Description</span>
                <textarea
                  value={formState.description}
                  onChange={(event) => updateField("description", event.target.value)}
                  rows={4}
                  className="w-full rounded-[1.25rem] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none focus:border-teal-300"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-white/72">Key Features</span>
                <textarea
                  value={formState.features}
                  onChange={(event) => updateField("features", event.target.value)}
                  rows={4}
                  placeholder={"One feature per line\nAnother feature\nFinal feature"}
                  className="w-full rounded-[1.25rem] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-teal-300"
                />
              </label>

              <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-4">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm font-medium text-white/72">Product Images</span>
                  <span className="text-xs uppercase tracking-[0.24em] text-white/35">1-3 images</span>
                </div>
                <div className="mt-4 grid gap-3">
                  {formState.imageUrls.map((imageUrl, index) => (
                    <div key={index} className="rounded-[1.25rem] border border-white/10 bg-white/[0.03] p-3">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-xs font-medium uppercase tracking-[0.24em] text-white/45">
                          Image {index + 1}{index === 0 ? " (required)" : ""}
                        </span>
                        {imageUrl ? (
                          <button
                            type="button"
                            onClick={() => updateImageData(index, "")}
                            className="rounded-full border border-white/10 px-3 py-1 text-xs font-medium text-white/70 transition hover:border-rose-300/50 hover:text-rose-100"
                          >
                            Remove
                          </button>
                        ) : null}
                      </div>

                      <div className="mt-3 grid gap-3 sm:grid-cols-[120px_1fr] sm:items-center">
                        <div className="flex h-24 items-center justify-center overflow-hidden rounded-[1rem] border border-dashed border-white/15 bg-black/30">
                          {imageUrl ? (
                            <img src={imageUrl} alt={`Product preview ${index + 1}`} className="h-full w-full object-cover" />
                          ) : (
                            <span className="px-3 text-center text-xs text-white/35">No image</span>
                          )}
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(event) => updateImageFile(index, event.target.files?.[0])}
                          className="w-full rounded-[1.25rem] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white file:mr-4 file:rounded-full file:border-0 file:bg-white file:px-4 file:py-2 file:text-sm file:font-semibold file:text-zinc-950 hover:file:bg-teal-100"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-white/72">Shipping Label</span>
                  <input
                    value={formState.shippingLabel}
                    onChange={(event) => updateField("shippingLabel", event.target.value)}
                    placeholder="Ships in 24 hours"
                    className="w-full rounded-[1.25rem] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-teal-300"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-white/72">Delivery Note</span>
                  <input
                    value={formState.deliveryNote}
                    onChange={(event) => updateField("deliveryNote", event.target.value)}
                    placeholder="Delivered in 3-5 days"
                    className="w-full rounded-[1.25rem] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-teal-300"
                  />
                </label>
              </div>

              <label className="flex items-center gap-3 rounded-[1.25rem] border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/72">
                <input
                  type="checkbox"
                  checked={formState.featured}
                  onChange={(event) => updateField("featured", event.target.checked)}
                  className="h-4 w-4 rounded border-white/20 bg-white/10 text-teal-500 focus:ring-teal-300"
                />
                Feature this product on the home page
              </label>

              {isDigitalCategory ? (
                <div className="grid gap-4 rounded-[1.5rem] border border-teal-400/20 bg-teal-400/5 p-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block">
                      <span className="mb-2 block text-sm font-medium text-white/72">Digital Label</span>
                      <input
                        value={formState.digitalLabel}
                        onChange={(event) => updateField("digitalLabel", event.target.value)}
                        className="w-full rounded-[1.25rem] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none focus:border-teal-300"
                      />
                    </label>
                    <label className="block">
                      <span className="mb-2 block text-sm font-medium text-white/72">Digital Price</span>
                      <input
                        type="number"
                        min="0"
                        value={formState.digitalPrice}
                        onChange={(event) => updateField("digitalPrice", event.target.value)}
                        className="w-full rounded-[1.25rem] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none focus:border-teal-300"
                      />
                    </label>
                  </div>

                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-white/72">Google Drive Link</span>
                    <input
                      value={formState.digitalAccessLink}
                      onChange={(event) => updateField("digitalAccessLink", event.target.value)}
                      placeholder="https://drive.google.com/..."
                      className="w-full rounded-[1.25rem] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-teal-300"
                    />
                  </label>

                  {isEbook ? (
                    <label className="flex items-center gap-3 rounded-[1.25rem] border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/72">
                      <input
                        type="checkbox"
                        checked={formState.enablePhysicalVersion}
                        onChange={(event) => updateField("enablePhysicalVersion", event.target.checked)}
                        className="h-4 w-4 rounded border-white/20 bg-white/10 text-teal-500 focus:ring-teal-300"
                      />
                      Also sell a paper book delivered version
                    </label>
                  ) : null}

                  {isEbook && formState.enablePhysicalVersion ? (
                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="block">
                        <span className="mb-2 block text-sm font-medium text-white/72">Paper Book Label</span>
                        <input
                          value={formState.physicalLabel}
                          onChange={(event) => updateField("physicalLabel", event.target.value)}
                          className="w-full rounded-[1.25rem] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none focus:border-teal-300"
                        />
                      </label>
                      <label className="block">
                        <span className="mb-2 block text-sm font-medium text-white/72">Paper Book Price</span>
                        <input
                          type="number"
                          min="0"
                          value={formState.physicalPrice}
                          onChange={(event) => updateField("physicalPrice", event.target.value)}
                          className="w-full rounded-[1.25rem] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none focus:border-teal-300"
                        />
                      </label>
                    </div>
                  ) : null}
                </div>
              ) : null}

              <div className="flex flex-col gap-3 sm:flex-row">
                <button className="w-full rounded-full bg-white px-5 py-4 text-sm font-semibold text-zinc-950 transition hover:bg-teal-100">
                  {editingProductId ? "Save Product Changes" : "Add Product"}
                </button>
                {editingProductId ? (
                  <button
                    type="button"
                    onClick={cancelEditing}
                    className="w-full rounded-full border border-white/10 px-5 py-4 text-sm font-medium text-white/78 transition hover:border-white/25 hover:text-white"
                  >
                    Cancel Editing
                  </button>
                ) : null}
              </div>
              {message ? <p className="text-sm text-teal-100">{message}</p> : null}
            </form>
          </section>

          <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-white/35">Catalog preview</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">{products.length} products currently live</h2>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {products.map((product) => (
                <div key={product.id} className="rounded-[1.5rem] border border-white/10 bg-black/20 p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-teal-300">{product.category}</p>
                      <h3 className="mt-2 text-xl font-semibold text-white">{product.name}</h3>
                    </div>
                    <p className="text-lg font-semibold text-white">{formatCurrency(product.price)}</p>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-white/60">{product.shortDescription}</p>
                  {product.purchaseOptions?.length > 1 ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {product.purchaseOptions.map((option) => (
                        <span
                          key={option.id}
                          className="rounded-full border border-teal-400/20 bg-teal-400/10 px-3 py-1 text-xs uppercase tracking-[0.24em] text-teal-100"
                        >
                          {option.label}: {formatCurrency(option.price)}
                        </span>
                      ))}
                    </div>
                  ) : null}
                  <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => startEditing(product)}
                      className="rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-white/80 transition hover:border-teal-400/40 hover:text-white"
                    >
                      Update Product
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemove(product)}
                      className="rounded-full border border-rose-400/30 bg-rose-400/10 px-4 py-2 text-sm font-medium text-rose-100 transition hover:border-rose-300/50"
                    >
                      Remove Product
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
