import crypto from "node:crypto";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json();
    const secretKey = process.env.RAZORPAY_KEY_SECRET;

    if (!secretKey || !body.orderId) {
      return NextResponse.json({ verified: false, error: "Razorpay verification cannot be performed. Missing configuration or order information." }, { status: 400 });
    }

    const expectedSignature = crypto
      .createHmac("sha256", secretKey)
      .update(`${body.orderId}|${body.razorpay_payment_id}`)
      .digest("hex");

    const verified = expectedSignature === body.razorpay_signature;

    return NextResponse.json({ verified, mode: "live" }, { status: verified ? 200 : 400 });
  } catch (error) {
    return NextResponse.json({ verified: false, error: error.message || "Unable to verify payment signature." }, { status: 500 });
  }
}
