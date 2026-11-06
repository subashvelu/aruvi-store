import nodemailer from "nodemailer";

function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || "587");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;
  const secure = process.env.SMTP_SECURE === "true";

  if (!host || !user || !pass) {
    throw new Error("SMTP_HOST, SMTP_USER, and SMTP_PASSWORD must be set to send email.");
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
  });
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function sendDigitalProductEmail({ to, customerName, productName, deliveryLink }) {
  const from = process.env.EMAIL_FROM || process.env.SMTP_USER || "no-reply@example.com";
  const fromName = process.env.EMAIL_FROM_NAME || "Aruvi";
  if (!/^https:\/\//i.test(String(deliveryLink))) {
    throw new Error("Delivery link must be an https URL.");
  }

  const safeName = escapeHtml(productName);
  const safeCustomer = escapeHtml(customerName || "Customer");
  const safeLink = escapeHtml(deliveryLink);
  const subject = `Your ${String(productName).replace(/[\r\n]/g, " ")} is ready to download`;
  const html = `
    <div style="font-family: system-ui, sans-serif; color: #111;">
      <h1 style="color: #0d9488;">Thanks for your purchase, ${safeCustomer}!</h1>
      <p>Your digital product is ready. Click the button below to access it instantly:</p>
      <p><a href="${safeLink}" style="display: inline-block; padding: 14px 22px; color: #fff; background: #0d9488; border-radius: 12px; text-decoration: none;">Download ${safeName}</a></p>
      <p>If the button does not work, copy and paste this link into your browser:</p>
      <p><a href="${safeLink}">${safeLink}</a></p>
      <p style="margin-top: 24px; color: #555;">Thank you for shopping with Aruvi.</p>
    </div>
  `;

  const transporter = getTransporter();

  await transporter.sendMail({
    from: `${fromName} <${from}>`,
    to,
    subject,
    html,
  });
}
