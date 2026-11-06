import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "../../../../lib/supabase-server";

export async function POST(request) {
  try {
    const body = await request.json();
    const amount = Math.round(Number(body.amount) || 0);

    if (!amount || !body.productId) {
      return NextResponse.json({ error: "A valid product and order amount are required." }, { status: 400 });
    }

    // Never trust the price sent by the browser: it must match a price stored for this product.
    const productResult = await getSupabaseAdmin()
      .from("products")
      .select("price, digital_price, physical_price")
      .eq("id", body.productId)
      .maybeSingle();

    if (productResult.error || !productResult.data) {
      return NextResponse.json({ error: "Unknown product." }, { status: 400 });
    }

    const allowedAmounts = [
      productResult.data.price,
      productResult.data.digital_price,
      productResult.data.physical_price,
    ]
      .map(Number)
      .filter((value) => value > 0)
      .map((value) => Math.round(value * 100));

    if (!allowedAmounts.includes(amount)) {
      return NextResponse.json({ error: "The order amount does not match the product price." }, { status: 400 });
    }

    const publicKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || "";
    const secretKey = process.env.RAZORPAY_KEY_SECRET;

    if (!publicKey || !secretKey) {
      return NextResponse.json({ error: "Payments are not configured on the server." }, { status: 500 });
    }

    const authToken = Buffer.from(`${publicKey}:${secretKey}`).toString("base64");
    const orderResponse = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: `Basic ${authToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount,
        currency: "INR",
        receipt: `aruvi_${Date.now()}`,
        notes: {
          product_id: String(body.productId),
          product_name: body.productName || "Aruvi Product",
          customer_email: body.customer?.email || "",
        },
      }),
      cache: "no-store",
    });

    if (!orderResponse.ok) {
      return NextResponse.json({ error: "Failed to create the payment order." }, { status: 502 });
    }

    const order = await orderResponse.json();

    return NextResponse.json({
      mode: "live",
      keyId: publicKey,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error) {
    return NextResponse.json({ error: "Unexpected payment error." }, { status: 500 });
  }
}
