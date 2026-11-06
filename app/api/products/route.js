import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "../../../lib/supabase-server";
import { requireAdmin } from "../../../lib/admin-auth";

function getProductTableHelpMessage(errorMessage) {
  const missingProductsError = /could not find table 'public\.products'/i.test(errorMessage);
  const missingGalleryError = /gallery/i.test(errorMessage);
  return missingProductsError
    ? "Supabase table 'products' is missing. Run supabase-schema.sql in your Supabase SQL editor to create the products table."
    : missingGalleryError
      ? "Supabase products.gallery column is missing. Run the latest supabase-schema.sql or add a gallery jsonb column."
    : undefined;
}

function normalizeGallery(payload) {
  const gallery = Array.isArray(payload.gallery) ? payload.gallery : [];
  const imageUrls = Array.isArray(payload.imageUrls) ? payload.imageUrls : [];
  const source = gallery.length > 0 ? gallery : imageUrls.map((imageUrl) => ({ imageUrl }));

  return source
    .map((item, index) => {
      const imageUrl = typeof item === "string" ? item.trim() : item?.imageUrl?.trim?.() || "";
      if (!imageUrl) {
        return null;
      }

      return {
        id: item?.id || `${payload.slug || "product"}-${index + 1}`,
        title: item?.title || `${payload.category || "Product"} Image ${index + 1}`,
        eyebrow: item?.eyebrow || (index === 0 ? "Front View" : index === 1 ? "Detail Shot" : "Lifestyle View"),
        imageUrl,
        background: item?.background || "linear-gradient(135deg, #111827 0%, #1f2937 100%)",
      };
    })
    .filter(Boolean)
    .slice(0, 3);
}

export async function GET() {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const result = await supabaseAdmin.from("products").select("*").order("created_at", { ascending: false });

    if (result.error) {
      return NextResponse.json({ error: result.error.message, help: getProductTableHelpMessage(result.error.message) }, { status: 500 });
    }

    return NextResponse.json({ products: result.data || [] });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Unable to load products." }, { status: 500 });
  }
}

export async function POST(request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const supabaseAdmin = getSupabaseAdmin();
    const payload = await request.json();
    const gallery = normalizeGallery(payload);

    if (gallery.length < 1 || gallery.length > 3) {
      return NextResponse.json({ error: "Add between 1 and 3 product images." }, { status: 400 });
    }

    const canHavePhysicalVersion = payload.category === "E-books";

    const newProduct = {
      id: payload.id,
      slug: payload.slug,
      name: payload.name,
      category: payload.category,
      price: payload.price,
      tag: payload.tag || "",
      featured: payload.featured || false,
      short_description: payload.shortDescription || "",
      description: payload.description || "",
      features: payload.features || [],
      gallery,
      shipping_label: payload.shippingLabel || "",
      delivery_note: payload.deliveryNote || "",
      is_digital_product: payload.isDigitalProduct ?? false,
      digital_label: payload.digitalLabel || "",
      digital_price: payload.digitalPrice ? Number(payload.digitalPrice) : null,
      digital_access_link: payload.digitalAccessLink || null,
      enable_physical_version: canHavePhysicalVersion ? payload.enablePhysicalVersion ?? true : false,
      physical_label: canHavePhysicalVersion ? payload.physicalLabel || "" : "",
      physical_price: canHavePhysicalVersion && payload.physicalPrice ? Number(payload.physicalPrice) : null,
    };

    const result = await supabaseAdmin.from("products").insert([newProduct]).select("*").single();

    if (result.error) {
      return NextResponse.json({ error: result.error.message, help: getProductTableHelpMessage(result.error.message) }, { status: 500 });
    }

    return NextResponse.json({ product: result.data });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Unable to create product." }, { status: 500 });
  }
}
