export default function ProductVisual({ product, scene, className = "", compact = false }) {
  const safeScene = scene || {
    background: "linear-gradient(135deg, #111827 0%, #1f2937 100%)",
    eyebrow: "Featured",
  };

  return (
    <div
      className={`relative overflow-hidden rounded-[2rem] border border-white/10 ${compact ? "min-h-[220px]" : "min-h-[360px]"} ${className}`}
      style={{ backgroundImage: safeScene.background }}
    >
      {safeScene.imageUrl ? (
        <img
          src={safeScene.imageUrl}
          alt={`${product.name} product image`}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : null}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.24),transparent_45%),linear-gradient(180deg,rgba(10,10,12,0),rgba(10,10,12,0.74))]" />
      <div className="absolute -right-10 top-8 h-36 w-36 rounded-full border border-white/15 bg-white/5 blur-2xl" />
      <div className="absolute left-8 top-8 rounded-full border border-white/20 bg-black/20 px-4 py-2 text-[0.65rem] font-semibold uppercase tracking-[0.32em] text-white/75">
        {product.category}
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-7 text-white">
        <p className="text-xs uppercase tracking-[0.3em] text-white/70">{safeScene.eyebrow}</p>
        <h3 className={`${compact ? "mt-3 text-2xl" : "mt-4 text-4xl"} max-w-xs font-semibold leading-tight`}>
          {product.name}
        </h3>
      </div>
    </div>
  );
}
