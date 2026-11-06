import Image from "next/image";
import Link from "next/link";

export default function BrandLogo({ href = "/", className = "", priority = false, size = "default" }) {
  const dimensions =
    size === "sm"
      ? { width: 110, height: 46 }
      : size === "xs"
        ? { width: 82, height: 34 }
        : size === "xxs"
          ? { width: 64, height: 26 }
          : size === "lg"
            ? { width: 188, height: 78 }
            : { width: 156, height: 64 };

  return (
    <Link href={href} className={`inline-flex items-center ${className}`}>
      <Image
        src="/logo.svg"
        alt="Aruvi"
        width={dimensions.width}
        height={dimensions.height}
        priority={priority}
        className="block h-auto w-auto max-w-full object-contain"
      />
    </Link>
  );
}
