const categoryThemes = {
  "E-books": {
    badge: "Guide",
    backgrounds: [
      "linear-gradient(135deg, #2dd4bf 0%, #0d9488 52%, #09090b 100%)",
      "linear-gradient(135deg, #2dd4bf 0%, #0369a1 55%, #0f172a 100%)",
      "linear-gradient(135deg, #2dd4bf 0%, #0d9488 45%, #111827 100%)",
    ],
  },
  "Desk Gear": {
    badge: "Gear",
    backgrounds: [
      "linear-gradient(135deg, #2dd4bf 0%, #0d9488 55%, #0f172a 100%)",
      "linear-gradient(135deg, #2dd4bf 0%, #0369a1 50%, #09090b 100%)",
      "linear-gradient(135deg, #2dd4bf 0%, #0369a1 45%, #111827 100%)",
    ],
  },
  Stickers: {
    badge: "Stickers",
    backgrounds: [
      "linear-gradient(135deg, #2dd4bf 0%, #0d9488 42%, #1f2937 100%)",
      "linear-gradient(135deg, #2dd4bf 0%, #0369a1 48%, #111827 100%)",
      "linear-gradient(135deg, #2dd4bf 0%, #0d9488 40%, #09090b 100%)",
    ],
  },
  Planners: {
    badge: "Plan",
    backgrounds: [
      "linear-gradient(135deg, #2dd4bf 0%, #0d9488 45%, #111827 100%)",
      "linear-gradient(135deg, #2dd4bf 0%, #0369a1 52%, #020617 100%)",
      "linear-gradient(135deg, #2dd4bf 0%, #0d9488 48%, #111827 100%)",
    ],
  },
  Bags: {
    badge: "Carry",
    backgrounds: [
      "linear-gradient(135deg, #2dd4bf 0%, #0369a1 44%, #020617 100%)",
      "linear-gradient(135deg, #2dd4bf 0%, #0d9488 45%, #111827 100%)",
      "linear-gradient(135deg, #2dd4bf 0%, #0369a1 42%, #0f172a 100%)",
    ],
  },
  "Merch": {
    badge: "Merch",
    backgrounds: [
      "linear-gradient(135deg, #2dd4bf 0%, #0d9488 45%, #020617 100%)",
      "linear-gradient(135deg, #2dd4bf 0%, #0369a1 35%, #0f172a 100%)",
      "linear-gradient(135deg, #2dd4bf 0%, #0369a1 48%, #111827 100%)",
    ],
  },
  "Bundles": {
    badge: "Bundle",
    backgrounds: [
      "linear-gradient(135deg, #2dd4bf 0%, #0d9488 42%, #18181b 100%)",
      "linear-gradient(135deg, #2dd4bf 0%, #0369a1 48%, #020617 100%)",
      "linear-gradient(135deg, #2dd4bf 0%, #0d9488 44%, #111827 100%)",
    ],
  },
};

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function createGallery(name, category) {
  const theme = categoryThemes[category] || categoryThemes["E-books"];

  return theme.backgrounds.map((background, index) => ({
    id: `${slugify(name)}-${index + 1}`,
    title: `${theme.badge} Frame ${index + 1}`,
    eyebrow: index === 0 ? "Front View" : index === 1 ? "Detail Shot" : "In Use",
    background,
  }));
}

function normalizeImageUrls(imageUrls) {
  const list = Array.isArray(imageUrls) ? imageUrls : String(imageUrls || "").split("\n");
  return list.map((item) => item.trim()).filter(Boolean).slice(0, 3);
}

function createImageGallery(name, category, imageUrls) {
  const urls = normalizeImageUrls(imageUrls);
  if (urls.length === 0) {
    return createGallery(name, category);
  }

  return urls.map((imageUrl, index) => ({
    id: `${slugify(name)}-${index + 1}`,
    title: `${category} Image ${index + 1}`,
    eyebrow: index === 0 ? "Front View" : index === 1 ? "Detail Shot" : "Lifestyle View",
    imageUrl,
    background: "linear-gradient(135deg, #111827 0%, #1f2937 100%)",
  }));
}

function createProduct({
  id,
  name,
  category,
  price,
  tag,
  featured = false,
  shortDescription,
  description,
  features,
  shippingLabel,
  deliveryNote,
  imageUrls = [],
}) {
  return {
    id,
    slug: slugify(name),
    name,
    category,
    price,
    tag,
    featured,
    shortDescription,
    description,
    features,
    shippingLabel,
    deliveryNote,
    gallery: createImageGallery(name, category, imageUrls),
  };
}

export const PRODUCT_CATEGORIES = [
  "All",
  "E-books",
  "Bundles",
  "Planners",
  "Desk Gear",
  "Stickers",
  "Bags",
  "Merch",
];

export const INITIAL_PRODUCTS = [
  createProduct({
    id: "prod_cloud_starter",
    name: "Cloud Starter Handbook",
    category: "E-books",
    price: 499,
    tag: "Bestseller",
    featured: true,
    shortDescription: "A 6-week beginner plan to go from zero to your first deployed AWS project.",
    description:
      "Cloud Starter Handbook walks you through core AWS services, IAM basics, and a hands-on mini project, with a checklist for every week so you always know the next step.",
    features: [
      "6-week study plan with weekly checklists",
      "Core AWS services explained with simple diagrams",
      "Hands-on mini project: static site on S3 + CloudFront",
    ],
    shippingLabel: "Instant digital delivery",
    deliveryNote: "Download link delivered to your email right after payment.",
  }),
  createProduct({
    id: "prod_k8s_cheatsheets",
    name: "Kubernetes Cheat Sheet Bundle",
    category: "Bundles",
    price: 299,
    tag: "Digital Drop",
    featured: true,
    shortDescription: "kubectl, pods, deployments, services and troubleshooting on printable one-pagers.",
    description:
      "A set of clean one-page cheat sheets you can keep next to your keyboard: the kubectl commands you actually use, common errors, and a debugging flow for broken pods.",
    features: [
      "10 printable one-page cheat sheets",
      "Troubleshooting flow for CrashLoopBackOff and Pending pods",
      "Updated whenever Kubernetes changes",
    ],
    shippingLabel: "Instant digital delivery",
    deliveryNote: "Email delivery happens automatically after checkout.",
  }),
  createProduct({
    id: "prod_cicd_templates",
    name: "CI/CD Pipeline Templates",
    category: "Bundles",
    price: 399,
    tag: "Hands-on",
    featured: true,
    shortDescription: "Ready-to-use GitHub Actions workflows with keyless AWS deploys (OIDC).",
    description:
      "Copy, adapt and learn: tested workflow files for testing, building Docker images, and deploying to AWS without storing long-lived keys.",
    features: [
      "GitHub Actions workflows for test, build and deploy",
      "OIDC role setup guide (no stored AWS keys)",
      "Explained line by line so you learn, not just copy",
    ],
    shippingLabel: "Instant digital delivery",
    deliveryNote: "Email delivery happens automatically after checkout.",
  }),
  createProduct({
    id: "prod_terraform_templates",
    name: "Terraform Starter Templates",
    category: "Bundles",
    price: 449,
    tag: "New",
    featured: false,
    shortDescription: "Modular Terraform for a VPC, EC2 and an S3-backed remote state.",
    description:
      "Starter modules for the infrastructure most beginner projects need, with remote state, variables and outputs set up the way teams actually do it.",
    features: [
      "VPC, subnets, security groups and EC2 modules",
      "Remote state with S3 backend example",
      "Comments that explain why, not just what",
    ],
    shippingLabel: "Instant digital delivery",
    deliveryNote: "Email delivery happens automatically after checkout.",
  }),
  createProduct({
    id: "prod_devops_planner",
    name: "DevOps Weekly Planner",
    category: "Planners",
    price: 599,
    tag: "Print",
    featured: false,
    shortDescription: "A printed planner to track study goals, labs, and project milestones.",
    description:
      "A simple weekly layout for learners: set a goal, log a lab, note what broke, and track the projects you ship.",
    features: [
      "Weekly goal and lab log pages",
      "Project milestone tracker",
      "Lay-flat binding",
    ],
    shippingLabel: "Ships in 3 days",
    deliveryNote: "Standard delivery window is 3-5 working days.",
  }),
  createProduct({
    id: "prod_kubectl_stickers",
    name: "kubectl Sticker Pack",
    category: "Stickers",
    price: 199,
    tag: "Desk Gear",
    featured: false,
    shortDescription: "Waterproof laptop stickers for Kubernetes and cloud fans.",
    description:
      "A pack of durable vinyl stickers for your laptop, bottle or notebook.",
    features: [
      "12 waterproof vinyl stickers",
      "Matte finish",
      "Peel-and-stick, residue-free",
    ],
    shippingLabel: "Ships in 3 days",
    deliveryNote: "Standard delivery window is 3-5 working days.",
  }),
];

export const INITIAL_NEWSLETTER_SUBSCRIBERS = [
  {
    id: "sub_001",
    email: "subscriber1@example.com",
    joinedAt: "2026-05-24T08:45:00.000Z",
    source: "Newsletter",
  },
  {
    id: "sub_002",
    email: "subscriber2@example.com",
    joinedAt: "2026-05-20T10:30:00.000Z",
    source: "Newsletter",
  },
];

export const INITIAL_USERS = [
  {
    id: "usr_001",
    name: "Demo Customer One",
    email: "demo1@example.com",
    phone: "+91 00000 00000",
    address: "Demo Street, Chennai",
    joinedAt: "2026-05-23T07:00:00.000Z",
    source: "Community",
  },
  {
    id: "usr_002",
    name: "Demo Customer Two",
    email: "demo2@example.com",
    phone: "+91 00000 00000",
    address: "Demo Street, Bengaluru",
    joinedAt: "2026-05-18T12:15:00.000Z",
    source: "Customer",
  },
  {
    id: "usr_003",
    name: "Demo Customer Three",
    email: "demo3@example.com",
    phone: "+91 00000 00000",
    address: "Demo Street, Hyderabad",
    joinedAt: "2026-05-12T14:10:00.000Z",
    source: "Newsletter",
  },
];

export const INITIAL_ORDERS = [
  {
    id: "ARV-2048",
    customerName: "Demo Customer Two",
    email: "demo2@example.com",
    phone: "+91 00000 00000",
    address: "Demo Street, Bengaluru",
    productName: "CI/CD Pipeline Templates",
    productSlug: "ci-cd-pipeline-templates",
    amount: 1699,
    status: "Shipped",
    createdAt: "2026-05-25T06:25:00.000Z",
  },
  {
    id: "ARV-2047",
    customerName: "Demo Customer One",
    email: "demo1@example.com",
    phone: "+91 00000 00000",
    address: "Demo Street, Chennai",
    productName: "Kubernetes Cheat Sheet Bundle",
    productSlug: "kubernetes-cheat-sheet-bundle",
    amount: 1499,
    status: "Paid",
    createdAt: "2026-05-24T09:55:00.000Z",
  },
  {
    id: "ARV-2046",
    customerName: "Demo Customer Three",
    email: "demo3@example.com",
    phone: "+91 00000 00000",
    address: "Demo Street, Hyderabad",
    productName: "DevOps Weekly Planner",
    productSlug: "devops-weekly-planner",
    amount: 899,
    status: "Pending",
    createdAt: "2026-05-21T15:35:00.000Z",
  },
  {
    id: "ARV-2042",
    customerName: "Demo Customer Four",
    email: "demo4@example.com",
    phone: "+91 00000 00000",
    address: "Demo Street, Pune",
    productName: "kubectl Sticker Pack",
    productSlug: "kubectl-sticker-pack",
    amount: 1199,
    status: "Shipped",
    createdAt: "2026-05-03T11:20:00.000Z",
  },
];

export function createProductRecord(input) {
  const title = input.name.trim();
  const category = PRODUCT_CATEGORIES.includes(input.category) && input.category !== "All"
    ? input.category
    : "E-books";
  const isDigitalProduct = Boolean(input.isDigitalProduct);
  const canHavePhysicalVersion = category === "E-books";
  const price = isDigitalProduct ? Number(input.digitalPrice) || 0 : Number(input.price) || 0;
  const shortDescription = input.shortDescription.trim();
  const description = input.description.trim();
  const shippingLabel = input.shippingLabel.trim() || "Ships in 24 hours";
  const deliveryNote = input.deliveryNote.trim() || "Delivery timelines are shared after checkout.";
  const features = input.features
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 5);
  const imageUrls = normalizeImageUrls(input.imageUrls);

  return {
    ...createProduct({
      id: `prod_${slugify(title)}_${Date.now()}`,
      name: title,
      category,
      price,
      tag: input.tag?.trim() || "Admin Added",
      featured: Boolean(input.featured),
      shortDescription: shortDescription || "Aruvi product description coming in strong.",
      description:
        description ||
        "This product was added from the Aruvi admin panel and is ready to be merchandised across the storefront.",
      features:
        features.length > 0
          ? features
          : [
              "Freshly added through the protected admin dashboard",
              "Editable product story for future CMS or database hookup",
              "Ready for checkout and storefront rendering immediately",
            ],
      shippingLabel,
      deliveryNote,
      imageUrls,
    }),
    isDigitalProduct,
    digitalLabel: input.digitalLabel?.trim() || "",
    digitalPrice: Number(input.digitalPrice) || 0,
    digitalAccessLink: input.digitalAccessLink?.trim() || "",
    enablePhysicalVersion: canHavePhysicalVersion && Boolean(input.enablePhysicalVersion),
    physicalLabel: canHavePhysicalVersion ? input.physicalLabel?.trim() || "" : "",
    physicalPrice: canHavePhysicalVersion ? Number(input.physicalPrice) || 0 : 0,
  };
}
