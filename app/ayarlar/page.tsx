"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const defaultSettings = { schoolName: "Bergama Doğa Lisesi", libraryName: "Okul Kütüphanesi", loanDays: "14" };

export default function SettingsPage() {
  const [settings, setSettings] = useState(() => {
    if (typeof window === "undefined") return defaultSettings;
    const stored = window.localStorage.getItem("bdoga-library-settings");
    return stored ? { ...defaultSettings, ...JSON.parse(stored) } : defaultSettings;
  });
  const [saved, setSaved] = useState(false);

  const saveSettings = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    window.localStorage.setItem("bdoga-library-settings", JSON.stringify(settings));
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2500);
  };

  return <div className="min-h-screen bg-[#f6f7f2] text-[#1e2922] dark:bg-[#111612] dark:text-[#edf3ea]"><main className="mx-auto max-w-3xl px-5 py-8 sm:px-8 lg:py-12"><Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm text-[#718073] hover:text-foreground"><ArrowLeft size={16} /> Genel bakışa dön</Link><div className="mb-8 flex items-center gap-3"><div className="flex size-11 items-center justify-center rounded-xl bg-[#e8f2d1] text-[#5d8234]"><Settings2 size={21} /></div><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8b988c]">Yönetim</p><h1 className="mt-1 text-3xl font-semibold tracking-[-0.04em]">Ayarlar</h1></div></div><form onSubmit={saveSettings} className="rounded-2xl border border-[#dfe5dc] bg-white p-6 shadow-[0_12px_40px_rgba(41,57,42,0.04)] dark:border-[#29332b] dark:bg-[#171d18]"><div className="border-b border-[#e7ebe5] pb-5 dark:border-[#29332b]"><h2 className="font-semibold">Kütüphane bilgileri</h2><p className="mt-1 text-sm text-[#78847a]">Bu bilgiler yalnızca bu tarayıcıda saklanır.</p></div><div className="mt-6 grid gap-5"><SettingField label="Okul adı" value={settings.schoolName} onChange={(value) => setSettings({ ...settings, schoolName: value })} /><SettingField label="Kütüphane adı" value={settings.libraryName} onChange={(value) => setSettings({ ...settings, libraryName: value })} /><label className="grid max-w-xs gap-1.5 text-xs font-medium text-[#627063]">Varsayılan ödünç süresi (gün)<input type="number" min="1" max="365" value={settings.loanDays} onChange={(event) => setSettings({ ...settings, loanDays: event.target.value })} className="h-10 rounded-lg border border-[#dfe5dc] bg-[#fbfcf8] px-3 text-sm font-normal outline-none focus:border-[#789c47] dark:border-[#344035] dark:bg-[#202820]" /></label></div><div className="mt-8 flex items-center gap-3"><Button type="submit" className="bg-[#294b2d] text-white hover:bg-[#1f3c24]">Kaydet</Button>{saved && <span className="flex items-center gap-1.5 text-sm text-[#5b7c38]"><Check size={16} /> Ayarlar kaydedildi</span>}</div></form><section className="mt-5 rounded-xl border border-[#dfe5dc] bg-[#fbfcf8] p-5 text-sm text-[#718073] dark:border-[#29332b] dark:bg-[#171d18]"><p className="font-semibold text-foreground">Veri bağlantısı</p><p className="mt-1">Kitaplar ve ödünç işlemleri Supabase veritabanında tutulur. Ayarlar bu aşamada cihaz bazlıdır.</p></section></main></div>;
}

function SettingField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) { return <label className="grid max-w-xl gap-1.5 text-xs font-medium text-[#627063]">{label}<input value={value} onChange={(event) => onChange(event.target.value)} className="h-10 rounded-lg border border-[#dfe5dc] bg-[#fbfcf8] px-3 text-sm font-normal outline-none focus:border-[#789c47] dark:border-[#344035] dark:bg-[#202820]" /></label>; }
