"use client";

export const categories = ["Roman", "Türk Edebiyatı", "Dünya Klasikleri", "Şiir", "Bilim ve Teknoloji", "Tarih", "Felsefe", "Kişisel Gelişim", "Çocuk ve Gençlik"];

export type CategoryPalette = { cover: string; page: string; edge: string; highlight: string; text: string; soft: string };

const palettes: Record<string, CategoryPalette> = {
  "Türk Edebiyatı": { cover: "#ef4444", page: "#fee2e2", edge: "#991b1b", highlight: "#fca5a5", text: "#ffffff", soft: "#fef2f2" },
  Roman: { cover: "#3b82f6", page: "#dbeafe", edge: "#1e40af", highlight: "#93c5fd", text: "#ffffff", soft: "#eff6ff" },
  "Dünya Klasikleri": { cover: "#8b5cf6", page: "#ede9fe", edge: "#5b21b6", highlight: "#c4b5fd", text: "#ffffff", soft: "#f5f3ff" },
  Şiir: { cover: "#ec4899", page: "#fce7f3", edge: "#9d174d", highlight: "#f9a8d4", text: "#ffffff", soft: "#fdf2f8" },
  "Bilim ve Teknoloji": { cover: "#06b6d4", page: "#cffafe", edge: "#155e75", highlight: "#67e8f9", text: "#ffffff", soft: "#ecfeff" },
  Tarih: { cover: "#d97706", page: "#fef3c7", edge: "#92400e", highlight: "#fcd34d", text: "#ffffff", soft: "#fffbeb" },
  Felsefe: { cover: "#64748b", page: "#e2e8f0", edge: "#334155", highlight: "#cbd5e1", text: "#ffffff", soft: "#f8fafc" },
  "Kişisel Gelişim": { cover: "#16a34a", page: "#dcfce7", edge: "#166534", highlight: "#86efac", text: "#ffffff", soft: "#f0fdf4" },
  "Çocuk ve Gençlik": { cover: "#f97316", page: "#ffedd5", edge: "#9a3412", highlight: "#fdba74", text: "#ffffff", soft: "#fff7ed" },
};

export function categoryPalette(category: string): CategoryPalette {
  return palettes[category] ?? { cover: "#64748b", page: "#e2e8f0", edge: "#334155", highlight: "#cbd5e1", text: "#ffffff", soft: "#f8fafc" };
}

export function CategoryLegend() {
  return <div className="flex flex-wrap gap-2">{categories.map((category) => { const palette = categoryPalette(category); return <span key={category} className="inline-flex items-center gap-1.5 rounded-full border border-[#e5e9e3] bg-white px-2.5 py-1 text-[11px] text-[#667368] dark:border-[#344035] dark:bg-[#202820] dark:text-[#c0c9c1]"><span className="size-3 rounded-full" style={{ backgroundColor: palette.cover }} />{category}</span>; })}</div>;
}

export function BookEmojiBadge({ title, category }: { title: string; category: string }) {
  const palette = categoryPalette(category);
  const initials = title.split(/\s+/).filter(Boolean).slice(0, 3).map((word) => word[0]).join("").toLocaleUpperCase("tr");
  return <span className="relative flex size-10 shrink-0 items-center justify-center rounded-xl border" style={{ backgroundColor: palette.cover, borderColor: palette.edge }} role="img" aria-label={`${title} kitap simgesi`}><span className="text-[9px] font-extrabold leading-none tracking-[0.02em]" style={{ color: palette.text }}>{initials}</span></span>;
}
