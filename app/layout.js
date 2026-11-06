import Script from "next/script";
import { Poppins } from "next/font/google";
import CheckoutModal from "../components/checkout/CheckoutModal";
import { StoreProvider } from "../context/StoreContext";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-poppins",
});

export const metadata = {
  title: "Aruvi",
  description: "Aruvi: cloud and DevOps study kits, templates and cheat sheets.",
  icons: {
    icon: "/favicon.svg",
    apple: "/favicon.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} bg-[#04030a] text-white antialiased`}>
        <StoreProvider>
          {children}
          <CheckoutModal />
        </StoreProvider>
        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
