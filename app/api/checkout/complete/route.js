import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "../../../../lib/supabase-server";
import { sendDigitalProductEmail } from "../../../../lib/email";

function signatureIsValid(orderId, paymentId, signature) {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret || !orderId || !paymentId || !signature) return false;

  const expected = crypto.createHmac("sha256", secret).update(`${orderId}|${paymentId}`).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(String(signature));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

async function fetchRazorpayOrder(orderId) {
  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID;
  const secret = process.env.RAZORPAY_KEY_SECRET;
  const token = Buffer.from(`${keyId}:${secret}`).toString("base64");

  const response = await fetch(`https://api.razorpay.com/v1/orders/${encodeURIComponent(orderId)}`, {
    headers: { Authorization: `Basic ${token}` },
    cache: "no-store",
  });

  return response.ok ? response.json() : null;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { customer, product, purchaseOption, paymentResponse } = body;
    const orderId = body.orderId;
    const paymentId = paymentResponse?.razorpay_payment_id;

    if (!customer?.email || !customer?.fullName || !product?.id) {
      return NextResponse.json({ error: "Missing required order details." }, { status: 400 });
    }

    // 1. The payment must be real: verify Razorpay's signature on the server.
    if (!signatureIsValid(orderId, paymentId, paymentResponse?.razorpay_signature)) {
      return NextResponse.json({ error: "Payment could not be verified." }, { status: 400 });
    }

    // 2. Ask Razorpay what was actually paid, instead of trusting the browser.
    const razorpayOrder = await fetchRazorpayOrder(orderId);
    if (!razorpayOrder || razorpayOrder.status !== "paid") {
      return NextResponse.json({ error: "Payment has not been confirmed by Razorpay." }, { status: 402 });
    }
    const paidAmount = Number(razorpayOrder.amount) / 100;

    const supabaseAdmin = getSupabaseAdmin();

    // 3. Product details come from our database, not from the request.
    const productResult = await supabaseAdmin
      .from("products")
      .select("id, name, slug, is_digital_product, digital_price, digital_access_link")
      .eq("id", product.id)
      .maybeSingle();

    if (productResult.error || !productResult.data) {
      return NextResponse.json({ error: "Unknown product." }, { status: 400 });
    }
    const dbProduct = productResult.data;

    // 4. Idempotency: the same payment must not create a second order or resend the email.
    const existing = await supabaseAdmin.from("orders").select("order_code").eq("payment_id", paymentId).maybeSingle();
    if (existing.data) {
      return NextResponse.json({ ok: true, duplicate: true });
    }

    const normalizedEmail = customer.email.trim().toLowerCase();

    const userQuery = await supabaseAdmin.from("users").select("id").eq("email", normalizedEmail).limit(1).maybeSingle();
    if (userQuery.error) {
      return NextResponse.json({ error: "Unable to save the order." }, { status: 500 });
    }

    let userId = userQuery.data?.id;
    if (!userId) {
      const insertUser = await supabaseAdmin
        .from("users")
        .insert({
          full_name: customer.fullName,
          email: normalizedEmail,
          phone: customer.phone || null,
          address: customer.address || null,
        })
        .select("id")
        .single();

      if (insertUser.error) {
        return NextResponse.json({ error: "Unable to save the order." }, { status: 500 });
      }
      userId = insertUser.data.id;
    }

    const isDigital =
      purchaseOption?.deliveryType === "digital" &&
      dbProduct.is_digital_product &&
      Boolean(dbProduct.digital_access_link) &&
      (!Number(dbProduct.digital_price) || Number(dbProduct.digital_price) === paidAmount);

    const orderPayload = {
      order_code: `ARV-${Date.now()}`,
      customer_id: userId,
      customer_name: customer.fullName,
      customer_email: normalizedEmail,
      customer_phone: customer.phone || null,
      customer_address: customer.address || null,
      product_id: dbProduct.id,
      product_name: dbProduct.name,
      product_slug: dbProduct.slug || null,
      product_format: purchaseOption?.label || "Standard",
      product_price: paidAmount,
      payment_id: paymentId,
      payment_status: "Paid",
      delivery_type: isDigital ? "digital" : "physical",
      digital_link: isDigital ? dbProduct.digital_access_link : null,
      notes: `Verified Razorpay payment (order ${orderId}) at ${new Date().toISOString()}`,
    };

    const orderInsert = await supabaseAdmin.from("orders").insert([orderPayload]);
    if (orderInsert.error) {
      return NextResponse.json({ error: "Unable to save the order." }, { status: 500 });
    }

    // The payment succeeded and the order is saved. A failed email must not look like a failed checkout.
    let emailSent = false;
    if (isDigital) {
      try {
        await sendDigitalProductEmail({
          to: normalizedEmail,
          customerName: customer.fullName,
          productName: dbProduct.name,
          deliveryLink: dbProduct.digital_access_link,
        });
        emailSent = true;
      } catch (emailError) {
        console.error("Delivery email failed for order", orderPayload.order_code, emailError?.message);
      }
    }

    return NextResponse.json({ ok: true, orderCode: orderPayload.order_code, emailSent });
  } catch (error) {
    return NextResponse.json({ error: "Unable to complete checkout." }, { status: 500 });
  }
}
