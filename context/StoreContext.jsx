"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  createProductRecord,
  INITIAL_NEWSLETTER_SUBSCRIBERS,
  INITIAL_ORDERS,
  INITIAL_USERS,
} from "../lib/mock-data";

const STORAGE_KEYS = {
  products: "aruvi-products",
  orders: "aruvi-orders",
  users: "aruvi-users",
  newsletter: "aruvi-newsletter",
};

const defaultCustomer = {
  fullName: "",
  email: "",
  phone: "",
  address: "",
};

const defaultCheckout = {
  isOpen: false,
  step: "details",
  product: null,
  purchaseOption: null,
  customer: defaultCustomer,
  completedOrder: null,
  paymentNotice: "",
};

const StoreContext = createContext(null);

function readStorage(key, fallback) {
  if (typeof window === "undefined") {
    return fallback;
  }

  try {
    const stored = window.localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function createProductGallery(name, category) {
  const themes = {
    "E-books": [
      "linear-gradient(135deg, #2dd4bf 0%, #0d9488 52%, #09090b 100%)",
      "linear-gradient(135deg, #2dd4bf 0%, #0369a1 55%, #0f172a 100%)",
      "linear-gradient(135deg, #2dd4bf 0%, #0d9488 45%, #111827 100%)",
    ],
    "Desk Gear": [
      "linear-gradient(135deg, #2dd4bf 0%, #0d9488 55%, #0f172a 100%)",
      "linear-gradient(135deg, #2dd4bf 0%, #0369a1 50%, #09090b 100%)",
      "linear-gradient(135deg, #2dd4bf 0%, #0369a1 45%, #111827 100%)",
    ],
    Stickers: [
      "linear-gradient(135deg, #2dd4bf 0%, #0d9488 42%, #1f2937 100%)",
      "linear-gradient(135deg, #2dd4bf 0%, #0369a1 48%, #111827 100%)",
      "linear-gradient(135deg, #2dd4bf 0%, #0d9488 40%, #09090b 100%)",
    ],
    Planners: [
      "linear-gradient(135deg, #2dd4bf 0%, #0d9488 45%, #111827 100%)",
      "linear-gradient(135deg, #2dd4bf 0%, #0369a1 52%, #020617 100%)",
      "linear-gradient(135deg, #2dd4bf 0%, #0d9488 48%, #111827 100%)",
    ],
    Bags: [
      "linear-gradient(135deg, #2dd4bf 0%, #0369a1 44%, #020617 100%)",
      "linear-gradient(135deg, #2dd4bf 0%, #0d9488 45%, #111827 100%)",
      "linear-gradient(135deg, #2dd4bf 0%, #0369a1 42%, #0f172a 100%)",
    ],
    "Merch": [
      "linear-gradient(135deg, #2dd4bf 0%, #0d9488 45%, #020617 100%)",
      "linear-gradient(135deg, #2dd4bf 0%, #0369a1 35%, #0f172a 100%)",
      "linear-gradient(135deg, #2dd4bf 0%, #0369a1 48%, #111827 100%)",
    ],
    "Bundles": [
      "linear-gradient(135deg, #2dd4bf 0%, #0d9488 42%, #18181b 100%)",
      "linear-gradient(135deg, #2dd4bf 0%, #0369a1 48%, #020617 100%)",
      "linear-gradient(135deg, #2dd4bf 0%, #0d9488 44%, #111827 100%)",
    ],
  };

  const selected = themes[category] || themes["E-books"];

  return selected.map((background, index) => ({
    id: `${slugify(name)}-${index + 1}`,
    title: `${category} Frame ${index + 1}`,
    eyebrow: index === 0 ? "Front View" : index === 1 ? "Detail Shot" : "Community Fit",
    background,
  }));
}

function isDigitalCategory(category) {
  return category === "E-books" || category === "Bundles";
}

function canHavePhysicalVersion(category) {
  return category === "E-books";
}

function normalizeGalleryInput(input, name, category) {
  const source = Array.isArray(input) ? input : [];
  const imageScenes = source
    .map((item) => {
      if (typeof item === "string") {
        return item.trim() ? { imageUrl: item.trim() } : null;
      }

      const imageUrl = item?.imageUrl?.trim?.() || "";
      if (!imageUrl) {
        return item?.background ? item : null;
      }

      return { ...item, imageUrl };
    })
    .filter(Boolean)
    .slice(0, 3);

  if (imageScenes.length === 0) {
    return createProductGallery(name, category);
  }

  return imageScenes.map((item, index) => ({
    id: item.id || `${slugify(name)}-${index + 1}`,
    title: item.title || `${category} Image ${index + 1}`,
    eyebrow: item.eyebrow || (index === 0 ? "Front View" : index === 1 ? "Detail Shot" : "Lifestyle View"),
    imageUrl: item.imageUrl,
    background: item.background || "linear-gradient(135deg, #111827 0%, #1f2937 100%)",
  }));
}

function normalizeImageUrls(imageUrls) {
  const list = Array.isArray(imageUrls) ? imageUrls : String(imageUrls || "").split("\n");
  return list.map((item) => item.trim()).filter(Boolean).slice(0, 3);
}

function normalizeProductInput(input) {
  const category = input.category;
  const imageUrls = normalizeImageUrls(input.imageUrls);

  return {
    name: input.name.trim(),
    category,
    price: Number(input.price) || 0,
    tag: input.tag?.trim() || "Admin Added",
    shortDescription: input.shortDescription.trim() || "Product description coming soon.",
    description:
      input.description.trim() ||
      "This product was added from the Aruvi admin panel and is ready to be merchandised across the storefront.",
    features: input.features.map((item) => item.trim()).filter(Boolean).slice(0, 5),
    shippingLabel: input.shippingLabel.trim() || "Ships in 24 hours",
    deliveryNote: input.deliveryNote.trim() || "Delivery timelines are shared after checkout.",
    featured: Boolean(input.featured),
    isDigitalProduct: Boolean(input.isDigitalProduct),
    digitalLabel: input.digitalLabel?.trim() || "",
    digitalPrice: Number(input.digitalPrice) || 0,
    digitalAccessLink: input.digitalAccessLink?.trim() || "",
    enablePhysicalVersion: canHavePhysicalVersion(category) && Boolean(input.enablePhysicalVersion),
    physicalLabel: canHavePhysicalVersion(category) ? input.physicalLabel?.trim() || "" : "",
    physicalPrice: canHavePhysicalVersion(category) ? Number(input.physicalPrice) || 0 : 0,
    gallery: normalizeGalleryInput(imageUrls, input.name.trim(), category),
  };
}

function normalizePurchaseOption(option) {
  return {
    id: option.id,
    label: option.label,
    price: Number(option.price) || 0,
    deliveryType: option.deliveryType || "physical",
    deliveryLabel: option.deliveryLabel || "Standard delivery",
    note: option.note || "",
  };
}

function buildPurchaseOptions(product, overrides = null) {
  const category = overrides?.category ?? product.category;
  const isDigitalProduct = overrides?.isDigitalProduct ?? product.isDigitalProduct ?? isDigitalCategory(category);

  if (isDigitalProduct) {
    const digitalLabel =
      overrides?.digitalLabel?.trim() ||
      product.digitalLabel ||
      (category === "E-books" ? "E-book" : "Digital Access");
    const digitalPrice = Number(overrides?.digitalPrice ?? product.digitalPrice ?? 49) || 49;
    const digitalNote =
      "Google Drive link shared after payment confirmation.";
    const enablePhysicalVersion =
      canHavePhysicalVersion(category) && (overrides?.enablePhysicalVersion ?? product.enablePhysicalVersion ?? true);
    const physicalLabel =
      overrides?.physicalLabel?.trim() ||
      product.physicalLabel ||
      (category === "E-books" ? "Paperback" : "Physical Copy");
    const physicalPrice = Number(overrides?.physicalPrice ?? product.physicalPrice ?? 499) || 499;

    const options = [
      {
        id: "digital",
        label: digitalLabel,
        price: digitalPrice,
        deliveryType: "digital",
        deliveryLabel: "Google Drive delivery",
        note: digitalNote,
      },
    ];

    if (enablePhysicalVersion) {
      options.push({
        id: "physical",
        label: physicalLabel,
        price: physicalPrice,
        deliveryType: "physical",
        deliveryLabel: "Delivered to your address",
        note: "Printed copy delivered to the customer shipping address.",
      });
    }

    return options.map(normalizePurchaseOption);
  }

  if (Array.isArray(product.purchaseOptions) && product.purchaseOptions.length > 0) {
    return product.purchaseOptions.map(normalizePurchaseOption);
  }

  return [
    normalizePurchaseOption({
      id: "standard",
      label: "Standard",
      price: product.price,
      deliveryType: product.shippingLabel?.toLowerCase().includes("digital") ? "digital" : "physical",
      deliveryLabel: product.shippingLabel || "Standard delivery",
      note: product.deliveryNote || "Delivery details are shared after checkout.",
    }),
  ];
}

function decorateProduct(product, overrides = null) {
  const purchaseOptions = buildPurchaseOptions(product, overrides);
  const lowestPrice = Math.min(...purchaseOptions.map((option) => option.price));
  const isDigitalProduct = overrides?.isDigitalProduct ?? product.isDigitalProduct ?? isDigitalCategory(product.category);
  const digitalAccessLink = overrides?.digitalAccessLink?.trim() ?? product.digitalAccessLink ?? "";

  return {
    ...product,
    price: lowestPrice,
    purchaseOptions,
    isDigitalProduct,
    digitalLabel:
      overrides?.digitalLabel?.trim() ||
      product.digitalLabel ||
      purchaseOptions.find((option) => option.deliveryType === "digital")?.label ||
      "",
    digitalPrice: Number(overrides?.digitalPrice ?? product.digitalPrice ?? purchaseOptions[0]?.price ?? 0) || 0,
    digitalAccessLink,
    enablePhysicalVersion:
      canHavePhysicalVersion(product.category) &&
      (overrides?.enablePhysicalVersion ??
        product.enablePhysicalVersion ??
        purchaseOptions.some((option) => option.deliveryType === "physical")),
    physicalLabel:
      canHavePhysicalVersion(product.category)
        ? overrides?.physicalLabel?.trim() ||
          product.physicalLabel ||
          purchaseOptions.find((option) => option.deliveryType === "physical")?.label ||
          ""
        : "",
    physicalPrice:
      Number(
        canHavePhysicalVersion(product.category)
          ? overrides?.physicalPrice ??
              product.physicalPrice ??
              purchaseOptions.find((option) => option.deliveryType === "physical")?.price ??
              0
          : 0
      ) || 0,
    shippingLabel:
      purchaseOptions.length > 1
        ? "Choose digital or physical"
        : purchaseOptions[0].deliveryLabel,
    deliveryNote:
      purchaseOptions.length > 1
        ? "Select the format you want before checkout."
        : purchaseOptions[0].note,
  };
}

function getPurchaseOption(product, optionId) {
  if (!product?.purchaseOptions?.length) {
    return null;
  }

  return (
    product.purchaseOptions.find((option) => option.id === optionId) ||
    product.purchaseOptions[0]
  );
}

export function StoreProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [newsletterSubscribers, setNewsletterSubscribers] = useState(INITIAL_NEWSLETTER_SUBSCRIBERS);
  const [checkout, setCheckout] = useState(defaultCheckout);
  const [hasHydrated, setHasHydrated] = useState(false);
  const [isProductsLoading, setIsProductsLoading] = useState(true);

  function normalizeProductRow(product) {
    const name = product.name || product.slug || "product";
    const category = product.category || "E-books";

    return decorateProduct({
      ...product,
      gallery: normalizeGalleryInput(product.gallery, name, category),
      shortDescription: product.short_description || product.shortDescription || "",
      deliveryNote: product.delivery_note || product.deliveryNote || "",
      digitalLabel: product.digital_label || product.digitalLabel || "",
      digitalPrice: product.digital_price ?? product.digitalPrice ?? 0,
      digitalAccessLink: product.digital_access_link || product.digitalAccessLink || "",
      physicalLabel: product.physical_label || product.physicalLabel || "",
      physicalPrice: product.physical_price ?? product.physicalPrice ?? 0,
      isDigitalProduct: product.is_digital_product ?? product.isDigitalProduct ?? isDigitalCategory(category),
    });
  }

  function normalizeOrderRow(order) {
    return {
      id: order.order_code || order.id,
      customerName: order.customer_name || order.customerName || "Unknown Customer",
      email: order.customer_email || order.email || "",
      phone: order.customer_phone || order.phone || "-",
      address: order.customer_address || order.address || "-",
      productName: order.product_name || order.productName || "Unknown Product",
      productSlug: order.product_slug || order.productSlug || "",
      amount: Number(order.product_price ?? order.amount ?? 0),
      status: order.payment_status || order.status || "Paid",
      createdAt: order.created_at || order.createdAt || new Date().toISOString(),
    };
  }

  function normalizeUserRow(user) {
    return {
      id: user.id,
      name: user.full_name || user.name || "Customer",
      email: user.email || "",
      phone: user.phone || "-",
      address: user.address || "-",
      joinedAt: user.created_at || user.joined_at || user.joinedAt || new Date().toISOString(),
      source: "Customer",
    };
  }

  async function loadProducts() {
    try {
      const response = await fetch("/api/products");
      const payload = await response.json();
      if (!response.ok) {
        console.warn("Unable to load products:", payload.error);
        return;
      }

      const normalized = payload.products ? payload.products.map(normalizeProductRow) : [];
      setProducts(await Promise.all(normalized));
    } catch (error) {
      console.warn("Unable to load products:", error);
    } finally {
      setIsProductsLoading(false);
    }
  }

  async function loadOrders() {
    try {
      const response = await fetch("/api/orders");
      const payload = await response.json();
      if (!response.ok) {
        console.warn("Unable to load orders:", payload.error);
        return;
      }

      setOrders((payload.orders || []).map(normalizeOrderRow));
    } catch (error) {
      console.warn("Unable to load orders:", error);
    }
  }

  async function loadUsers() {
    try {
      const response = await fetch("/api/users");
      const payload = await response.json();
      if (!response.ok) {
        console.warn("Unable to load users:", payload.error);
        return;
      }

      setUsers((payload.users || []).map(normalizeUserRow));
    } catch (error) {
      console.warn("Unable to load users:", error);
    }
  }

  useEffect(() => {
    loadProducts();
    loadOrders();
    loadUsers();
    setNewsletterSubscribers(readStorage(STORAGE_KEYS.newsletter, INITIAL_NEWSLETTER_SUBSCRIBERS));
    setHasHydrated(true);

    const interval = window.setInterval(() => {
      loadProducts();
      loadOrders();
      loadUsers();
    }, 5000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    window.localStorage.setItem(STORAGE_KEYS.newsletter, JSON.stringify(newsletterSubscribers));
  }, [hasHydrated, newsletterSubscribers]);

  function openCheckout(product, optionId) {
    const decoratedProduct = decorateProduct(product);
    const purchaseOption = getPurchaseOption(decoratedProduct, optionId);

    setCheckout({
      isOpen: true,
      step: "details",
      product: decoratedProduct,
      purchaseOption,
      customer: defaultCustomer,
      completedOrder: null,
      paymentNotice: "",
    });
  }

  function closeCheckout() {
    setCheckout(defaultCheckout);
  }

  function saveCustomerDetails(customer) {
    setCheckout((current) => ({
      ...current,
      customer,
      step: "review",
      paymentNotice: "",
    }));
  }

  function goBackToDetails() {
    setCheckout((current) => ({
      ...current,
      step: "details",
    }));
  }

  function completeOrder(paymentResponse, notice = "") {
    const createdAt = new Date().toISOString();
    const newOrder = {
      id: `ARV-${Math.floor(Math.random() * 9000) + 1000}`,
      customerName: checkout.customer.fullName,
      email: checkout.customer.email,
      phone: checkout.customer.phone,
      address: checkout.customer.address,
      productName: `${checkout.product.name} (${checkout.purchaseOption?.label || "Standard"})`,
      productSlug: checkout.product.slug,
      amount: checkout.purchaseOption?.price || checkout.product.price,
      status: "Paid",
      createdAt,
      paymentId: paymentResponse?.razorpay_payment_id || `demo_pay_${Date.now()}`,
      format: checkout.purchaseOption?.label || "Standard",
    };

    setOrders((current) => [newOrder, ...current]);
    setUsers((current) => {
      const exists = current.some((item) => item.email.toLowerCase() === checkout.customer.email.toLowerCase());
      if (exists) {
        return current;
      }

      return [
        {
          id: `usr_${Date.now()}`,
          name: checkout.customer.fullName,
          email: checkout.customer.email,
          phone: checkout.customer.phone,
          address: checkout.customer.address,
          joinedAt: createdAt,
          source: "Customer",
        },
        ...current,
      ];
    });

    setCheckout((current) => ({
      ...current,
      step: "success",
      completedOrder: newOrder,
      paymentNotice: notice,
    }));
  }

  function submitNewsletter(email) {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      return { ok: false, message: "Enter a valid email address." };
    }

    const exists = newsletterSubscribers.some((item) => item.email.toLowerCase() === normalizedEmail);
    if (exists) {
      return { ok: false, message: "This email is already on the Aruvi list." };
    }

    const entry = {
      id: `sub_${Date.now()}`,
      email: normalizedEmail,
      joinedAt: new Date().toISOString(),
      source: "Newsletter",
    };

    setNewsletterSubscribers((current) => [entry, ...current]);
    return { ok: true, message: "You are in. Welcome to Aruvi." };
  }

  async function addProduct(input) {
    const payload = createProductRecord(input);
    const response = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || "Unable to add product.");
    }

    const product = await normalizeProductRow(result.product);
    setProducts((current) => [product, ...current]);
    return product;
  }

  async function updateProduct(productId, input) {
    const payload = {
      ...normalizeProductInput(input),
      slug: slugify(input.name.trim()),
    };

    const response = await fetch(`/api/products/${productId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || "Unable to update product.");
    }

    const updatedProduct = await normalizeProductRow(result.product);
    setProducts((current) => current.map((product) => (product.id === productId ? updatedProduct : product)));

    setCheckout((current) => {
      if (!current.product || current.product.id !== productId) {
        return current;
      }

      return {
        ...current,
        product: updatedProduct,
        purchaseOption: getPurchaseOption(updatedProduct, current.purchaseOption?.id),
      };
    });

    return updatedProduct;
  }

  async function removeProduct(productId) {
    const response = await fetch(`/api/products/${productId}`, {
      method: "DELETE",
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || "Unable to delete product.");
    }

    setProducts((current) => current.filter((product) => product.id !== productId));
    setCheckout((current) => {
      if (current.product?.id === productId) {
        return defaultCheckout;
      }

      return current;
    });
  }

  return (
    <StoreContext.Provider
      value={{
        products,
        isProductsLoading,
        orders,
        users,
        newsletterSubscribers,
        checkout,
        openCheckout,
        closeCheckout,
        saveCustomerDetails,
        goBackToDetails,
        completeOrder,
        submitNewsletter,
        addProduct,
        updateProduct,
        removeProduct,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);

  if (!context) {
    throw new Error("useStore must be used within a StoreProvider.");
  }

  return context;
}
