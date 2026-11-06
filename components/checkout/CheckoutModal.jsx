"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useStore } from "../../context/StoreContext";
import { formatCurrency } from "../../lib/formatters";
import { CheckCircleIcon, CloseIcon, MailIcon, MapPinIcon, PhoneIcon, ShieldIcon } from "../shared/Icons";

const defaultFormState = {
  fullName: "",
  email: "",
  phone: "",
  address: "",
};

export default function CheckoutModal() {
  const { checkout, closeCheckout, saveCustomerDetails, goBackToDetails, completeOrder } = useStore();
  const [formState, setFormState] = useState(defaultFormState);
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const isPhysicalDelivery = checkout.purchaseOption?.deliveryType !== "digital";

  useEffect(() => {
    if (!checkout.isOpen) {
      setFormState(defaultFormState);
      setError("");
      setIsProcessing(false);
      return;
    }

    setFormState(checkout.customer || defaultFormState);
  }, [checkout.customer, checkout.isOpen]);

  function handleChange(field, value) {
    setFormState((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleContinue(event) {
    event.preventDefault();
    const requiredEntries = [
      formState.fullName.trim(),
      formState.email.trim(),
      formState.phone.trim(),
      ...(isPhysicalDelivery ? [formState.address.trim()] : []),
    ];
    const hasEmptyField = requiredEntries.some((value) => value === "");

    if (hasEmptyField) {
      setError("Please complete every customer detail before continuing.");
      return;
    }

    saveCustomerDetails({
      fullName: formState.fullName.trim(),
      email: formState.email.trim(),
      phone: formState.phone.trim(),
      address: formState.address.trim(),
    });
    setError("");
  }

  async function submitOrderToServer(paymentResponse, orderId) {
    const deliveryLink = checkout.product?.digitalAccessLink || `${window.location.origin}/download/${checkout.product?.slug}`;

    const response = await fetch("/api/checkout/complete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        customer: checkout.customer,
        product: checkout.product,
        purchaseOption: checkout.purchaseOption,
        paymentResponse,
        orderId,
        deliveryLink,
      }),
    });

    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload.error || "Unable to complete checkout on the server.");
    }

    return payload;
  }

  async function handlePayment() {
    if (!checkout.product) {
      return;
    }

    setIsProcessing(true);
    setError("");

    try {
      const response = await fetch("/api/razorpay/order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: (checkout.purchaseOption?.price || checkout.product.price) * 100,
          productId: checkout.product.id,
          productName: `${checkout.product.name} (${checkout.purchaseOption?.label || "Standard"})`,
          customer: checkout.customer,
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Unable to create payment order.");
      }

      const keyId = payload.keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

      if (payload.mode !== "live" || !keyId) {
        throw new Error(
          payload.error ||
            "Razorpay is not configured correctly. Payment cannot proceed until Razorpay credentials are set on the server."
        );
      }

      if (typeof window === "undefined" || !window.Razorpay) {
        throw new Error("Razorpay checkout is still loading. Please try again in a moment.");
      }

      const checkoutInstance = new window.Razorpay({
        key: keyId,
        amount: payload.amount,
        currency: payload.currency,
        name: "Aruvi",
        description: checkout.product.name,
        image: "/logo.png",
        order_id: payload.orderId || undefined,
        prefill: {
          name: checkout.customer.fullName,
          email: checkout.customer.email,
          contact: checkout.customer.phone,
        },
        notes: {
          address: checkout.customer.address,
          product_name: checkout.product.name,
        },
        theme: {
          color: "#0d9488",
        },
        async handler(paymentResponse) {
          try {
            if (payload.orderId) {
              const verifyResponse = await fetch("/api/razorpay/verify", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  orderId: payload.orderId,
                  razorpay_payment_id: paymentResponse.razorpay_payment_id,
                  razorpay_signature: paymentResponse.razorpay_signature,
                }),
              });

              const verification = await verifyResponse.json();
              if (!verifyResponse.ok || !verification.verified) {
                throw new Error("Payment completed, but signature verification failed.");
              }
            }

            await submitOrderToServer(paymentResponse, payload.orderId);
            completeOrder(paymentResponse, "Payment captured through Razorpay checkout. Digital product email was triggered.");
            setIsProcessing(false);
          } catch (verificationError) {
            setError(verificationError.message || "Payment verification failed.");
            setIsProcessing(false);
          }
        },
        modal: {
          ondismiss() {
            setIsProcessing(false);
          },
        },
      });

      checkoutInstance.open();
    } catch (paymentError) {
      setError(paymentError.message || "Something went wrong while opening Razorpay.");
      setIsProcessing(false);
    }
  }

  return (
    <AnimatePresence>
      {checkout.isOpen ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 px-4 py-4 backdrop-blur md:items-center"
        >
          <motion.div
            initial={{ opacity: 0, y: 32, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 32, scale: 0.98 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-2xl rounded-[2rem] border border-white/10 bg-[#090909] p-6 text-white shadow-[0_30px_120px_rgba(0,0,0,0.5)]"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-teal-300">Checkout flow</p>
                <h2 className="mt-2 text-3xl font-semibold text-white">
                  {checkout.step === "details" && "Customer Details"}
                  {checkout.step === "review" && "Order Confirmation"}
                  {checkout.step === "success" && "Order Confirmed"}
                </h2>
              </div>
              <button
                type="button"
                onClick={closeCheckout}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-white/75"
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>

          {checkout.product ? (
              <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-5">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-teal-200">{checkout.product.category}</p>
                    <h3 className="mt-2 text-xl font-semibold text-white">{checkout.product.name}</h3>
                    {checkout.purchaseOption ? (
                      <p className="mt-2 text-sm uppercase tracking-[0.28em] text-white/45">{checkout.purchaseOption.label}</p>
                    ) : null}
                  </div>
                  <p className="text-2xl font-semibold text-white">{formatCurrency(checkout.purchaseOption?.price || checkout.product.price)}</p>
                </div>
              </div>
            ) : null}

            {checkout.step === "details" ? (
              <form onSubmit={handleContinue} className="mt-6 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-white/70">Full Name</span>
                    <input
                      value={formState.fullName}
                      onChange={(event) => handleChange("fullName", event.target.value)}
                      className="w-full rounded-[1.25rem] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none focus:border-teal-300"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-white/70">Email</span>
                    <input
                      type="email"
                      value={formState.email}
                      onChange={(event) => handleChange("email", event.target.value)}
                      className="w-full rounded-[1.25rem] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none focus:border-teal-300"
                    />
                  </label>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-white/70">Contact Number</span>
                    <input
                      value={formState.phone}
                      onChange={(event) => handleChange("phone", event.target.value)}
                      className="w-full rounded-[1.25rem] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none focus:border-teal-300"
                    />
                  </label>
                  <label className="block sm:col-span-1">
                    <span className="mb-2 block text-sm font-medium text-white/70">
                      {isPhysicalDelivery ? "Shipping Address" : "Delivery Note"}
                    </span>
                    <textarea
                      value={formState.address}
                      onChange={(event) => handleChange("address", event.target.value)}
                      rows={4}
                      placeholder={isPhysicalDelivery ? "Full shipping address" : "Optional note for your digital order"}
                      className="w-full rounded-[1.25rem] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none focus:border-teal-300"
                    />
                  </label>
                </div>

                {error ? <p className="text-sm text-teal-200">{error}</p> : null}

                <div className="flex justify-end">
                  <button className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-teal-100">
                    Continue to Review
                  </button>
                </div>
              </form>
            ) : null}

            {checkout.step === "review" ? (
              <div className="mt-6">
                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-5">
                    <div className="flex items-center gap-3 text-teal-200">
                      <MailIcon className="h-4 w-4" />
                      <span className="text-sm font-medium text-white">Customer</span>
                    </div>
                    <div className="mt-4 space-y-3 text-sm text-white/68">
                      <p>{checkout.customer.fullName}</p>
                      <p>{checkout.customer.email}</p>
                      <p className="flex items-center gap-2"><PhoneIcon className="h-4 w-4 text-teal-200" />{checkout.customer.phone}</p>
                      {isPhysicalDelivery ? (
                        <p className="flex items-start gap-2"><MapPinIcon className="mt-0.5 h-4 w-4 shrink-0 text-teal-200" />{checkout.customer.address}</p>
                      ) : (
                        <p>Delivery method: Google Drive link</p>
                      )}
                    </div>
                  </div>

                  <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-5">
                    <div className="flex items-center gap-3 text-teal-200">
                      <ShieldIcon className="h-4 w-4" />
                      <span className="text-sm font-medium text-white">Order summary</span>
                    </div>
                    <div className="mt-4 space-y-3 text-sm text-white/68">
                      <p>Product: {checkout.product?.name}</p>
                      <p>Format: {checkout.purchaseOption?.label || "Standard"}</p>
                      <p>Category: {checkout.product?.category}</p>
                      <p>Total: {checkout.product ? formatCurrency(checkout.purchaseOption?.price || checkout.product.price) : "-"}</p>
                      <p>Delivery: {checkout.purchaseOption?.note || checkout.product?.deliveryNote}</p>
                    </div>
                  </div>
                </div>

                {error ? <p className="mt-4 text-sm text-teal-200">{error}</p> : null}

                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={goBackToDetails}
                    className="rounded-full border border-white/10 px-5 py-3 text-sm font-medium text-white/75 transition hover:border-white/25 hover:text-white"
                  >
                    Edit Details
                  </button>
                  <button
                    type="button"
                    onClick={handlePayment}
                    disabled={isProcessing}
                    className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-teal-100 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isProcessing ? "Opening Razorpay..." : "Pay with Razorpay"}
                  </button>
                </div>
              </div>
            ) : null}

            {checkout.step === "success" ? (
              <div className="mt-6">
                <div className="flex items-center gap-3 text-teal-200">
                  <CheckCircleIcon className="h-6 w-6" />
                  <p className="text-lg font-medium text-white">Your order is locked in.</p>
                </div>
                <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-5 text-sm leading-7 text-white/68">
                  <p>Order ID: {checkout.completedOrder?.id}</p>
                  <p>Product: {checkout.completedOrder?.productName}</p>
                  <p>Total paid: {checkout.completedOrder ? formatCurrency(checkout.completedOrder.amount) : "-"}</p>
                  <p>Payment reference: {checkout.completedOrder?.paymentId}</p>
                  {checkout.purchaseOption?.deliveryType === "digital" ? (
                  <div className="space-y-2">
                    <p>Your digital product is being emailed to <strong>{checkout.completedOrder?.email || checkout.customer?.email}</strong>.</p>
                    {checkout.product?.digitalAccessLink ? (
                      <p>
                        Instant access: <a href={checkout.product.digitalAccessLink} target="_blank" rel="noreferrer" className="text-teal-200 underline">
                          {checkout.product.digitalAccessLink}
                        </a>
                      </p>
                    ) : (
                      <p>Please check your inbox for the downloadable PDF, ZIP, or Drive link.</p>
                    )}
                  </div>
                ) : null}
                {checkout.paymentNotice ? <p className="mt-3 text-teal-100">{checkout.paymentNotice}</p> : null}
                </div>
                <div className="mt-6 flex justify-end">
                  <button
                    type="button"
                    onClick={closeCheckout}
                    className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-teal-100"
                  >
                    Continue Shopping
                  </button>
                </div>
              </div>
            ) : null}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
