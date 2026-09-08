"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Archive, BookMarked, BookOpen, Check, LayoutDashboard, Library,
  MoreHorizontal, Plus, Search, Settings2, X,
} from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/lib/supabase";
import { BookEmojiBadge, CategoryLegend } from "@/components/category-legend";

type Book = {
  id: number; title: string; author: string; category: string; shelf: string;
  status: "Rafta" | "Ödünçte"; added: string; loan?: LoanSummary;
};

type LoanSummary = { borrower_name: string; borrower_number: string; borrowed_at: string; due_at: string | null };

const categories = [
  "Roman",
  "Türk Edebiyatı",
  "Dünya Klasikleri",
  "Şiir",
  "Bilim ve Teknoloji",
  "Tarih",
  "Felsefe",
  "Kişisel Gelişim",
  "Çocuk ve Gençlik",
];

const emptyForm = { title: "", author: "", category: "Roman", shelf: "", status: "Rafta" as Book["status"] };

function formatAddedDate(value: string) {
  return new Intl.DateTimeFormat("tr-TR", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
}

function formatLoanDate(value: string | null) {
  return value ? new Intl.DateTimeFormat("tr-TR", { day: "2-digit", month: "short" }).format(new Date(value)) : "Belirtilmemiş";
}

export default function Home() {
  const [books, setBooks] = useState<Book[]>([]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("Tümü");
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (!supabase) return;
    const client = supabase;

    const loadBooks = async () => {
      const [{ data, error }, { data: loans }] = await Promise.all([
        client.from("books").select("*").order("created_at", { ascending: false }),
        client.from("loans").select("book_id, borrower_name, borrower_number, borrowed_at, due_at").is("returned_at", null),
      ]);
      if (error) {
        console.error("Kitaplar yüklenemedi:", error.message);
        return;
      }
      setBooks(data.map((book) => ({
        id: book.id,
        title: book.title,
        author: book.author,
        category: book.category,
        shelf: book.shelf,
        status: book.status,
        added: formatAddedDate(book.created_at),
        loan: loans?.find((loan) => loan.book_id === book.id),
      })));
    };

    void loadBooks();
  }, []);

  const filteredBooks = useMemo(() => books.filter((book) => {
    const matchesQuery = `${book.title} ${book.author} ${book.shelf}`.toLocaleLowerCase("tr").includes(query.toLocaleLowerCase("tr"));
    return matchesQuery && (filter === "Tümü" || book.status === filter);
  }), [books, filter, query]);

  const addBook = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.title.trim() || !form.author.trim()) return;
    if (supabase) {
      const { data, error } = await supabase.from("books").insert({
        title: form.title.trim(),
        author: form.author.trim(),
        category: form.category.trim() || "Roman",
        shelf: form.shelf.trim(),
        status: form.status,
      }).select().single();

      if (error || !data) {
        console.error("Kitap kaydedilemedi:", error?.message);
        return;
      }

      setBooks((current) => [{ ...form, id: data.id, added: formatAddedDate(data.created_at) }, ...current]);
    } else {
      setBooks((current) => [{ ...form, id: Date.now(), added: "Bugün" }, ...current]);
    }
    setForm(emptyForm);
    setShowAddForm(false);
  };

  return (
    <div className="h-screen overflow-hidden bg-[#f6f7f2] text-[#1e2922] dark:bg-[#111612] dark:text-[#edf3ea]">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col border-r border-[#dfe5dc] bg-[#fbfcf8] px-5 py-6 dark:border-[#29332b] dark:bg-[#171d18] lg:flex">
        <div className="mb-12 flex items-center gap-3 px-2"><div className="flex size-10 items-center justify-center rounded-xl bg-[#d9ef63] text-[#263519]"><BookOpen size={21} strokeWidth={2.5} /></div><div><p className="font-semibold tracking-tight">Bergama Doğa Lise</p><p className="text-xs text-[#849086]">Kütüphane</p></div></div>
        <nav className="space-y-1 text-sm font-medium"><p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#9ba69c]">Menü</p><Link href="/" className="flex w-full items-center gap-3 rounded-lg bg-[#e8f2d1] px-3 py-2.5 text-[#456321] dark:bg-[#26351f] dark:text-[#d9ef63]"><LayoutDashboard size={17} /> Genel Bakış</Link><Link href="/kitaplar" className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[#728074] hover:bg-[#f0f3ec] dark:hover:bg-[#232c24]"><Library size={17} /> Kitaplar</Link><Link href="/odunc-islemleri" className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[#728074] hover:bg-[#f0f3ec] dark:hover:bg-[#232c24]"><Archive size={17} /> Ödünç İşlemleri</Link></nav>
        <div className="mt-auto border-t border-[#e4e9e1] pt-5 dark:border-[#29332b]"><Link href="/ayarlar" className="flex w-full items-center gap-3 px-3 py-2.5 text-sm text-[#728074] hover:text-foreground"><Settings2 size={17} /> Ayarlar</Link><div className="mt-4 flex items-center justify-between"><span className="px-3 text-xs text-[#9ba69c]">Tema</span><ModeToggle /></div></div>
      </aside>

      <main className="h-screen overflow-hidden lg:pl-64"><div className="mx-auto flex h-full max-w-[1440px] flex-col overflow-hidden px-5 py-5 sm:px-8 lg:px-10 lg:py-6">
        <header className="mb-5 flex items-start justify-between gap-4"><div><p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#8b988c]">Okul kütüphanesi</p><h1 className="font-[family-name:var(--font-heading)] text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">Genel Bakış</h1><p className="mt-2 text-sm font-medium text-[#78847a]">Kutuphane kitap kayit tutma sistemi.</p></div><div className="flex items-center gap-2 lg:hidden"><ModeToggle /></div></header><div className="mb-5"><p className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#8b988c]">Kategori renkleri</p><CategoryLegend /></div>
        <section className="mb-5 grid gap-3 sm:grid-cols-3"><StatCard label="Toplam kitap" value={books.length.toString()} icon={<BookMarked size={18} />} tone="lime" /><StatCard label="Rafta" value={books.filter((book) => book.status === "Rafta").length.toString()} icon={<Check size={18} />} tone="blue" /><StatCard label="Ödünçte" value={books.filter((book) => book.status === "Ödünçte").length.toString()} icon={<Archive size={18} />} tone="peach" /></section>
        <section className="flex min-h-0 flex-1 flex-col rounded-2xl border border-[#dfe5dc] bg-white shadow-[0_12px_40px_rgba(41,57,42,0.04)] dark:border-[#29332b] dark:bg-[#171d18]">
          <div className="flex flex-col gap-3 border-b border-[#e7ebe5] p-4 sm:flex-row sm:items-center sm:justify-between dark:border-[#29332b]"><div><h2 className="text-lg font-semibold tracking-tight">Kitaplar</h2><p className="mt-1 text-xs text-[#8b988c]">Kayıtlı kitaplarını görüntüle ve yönet.</p></div><Button onClick={() => setShowAddForm(true)} className="h-10 rounded-lg bg-[#294b2d] px-4 text-white hover:bg-[#1f3c24] dark:bg-[#d9ef63] dark:text-[#253219] dark:hover:bg-[#c9df55]"><Plus size={17} /> Kitap ekle</Button></div>
          <div className="flex flex-col gap-3 border-b border-[#e7ebe5] p-4 sm:flex-row sm:items-center dark:border-[#29332b]"><div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9ba69c]" size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Kitap, yazar veya raf ara..." className="h-10 w-full rounded-lg border border-[#dfe5dc] bg-[#fbfcf8] pl-10 pr-3 text-sm outline-none transition focus:border-[#789c47] focus:ring-2 focus:ring-[#d9ef63]/30 dark:border-[#344035] dark:bg-[#202820]" /></div><div className="flex rounded-lg border border-[#dfe5dc] bg-[#fbfcf8] p-1 dark:border-[#344035] dark:bg-[#202820]">{["Tümü", "Rafta", "Ödünçte"].map((item) => <button key={item} onClick={() => setFilter(item)} className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${filter === item ? "bg-white text-[#385425] shadow-sm dark:bg-[#303b31] dark:text-[#d9ef63]" : "text-[#8b988c] hover:text-foreground"}`}>{item}</button>)}</div></div>
          <div className="min-h-0 flex-1 overflow-auto"><table className="w-full min-w-[780px] text-left"><thead className="sticky top-0 z-10 bg-white dark:bg-[#171d18]"><tr className="border-b border-[#e7ebe5] text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9ba69c] dark:border-[#29332b]"><th className="px-4 py-2.5 font-semibold">Kitap adı</th><th className="px-4 py-2.5 font-semibold">Yazar</th><th className="px-4 py-2.5 font-semibold">Kategori</th><th className="px-4 py-2.5 font-semibold">Raf</th><th className="px-4 py-2.5 font-semibold">Durum / ödünç bilgisi</th><th className="w-12 px-5 py-3" /></tr></thead><tbody>{filteredBooks.map((book) => <tr key={book.id} onClick={() => setSelectedBook(book)} className="cursor-pointer border-b border-[#eef1eb] transition hover:bg-[#fafcf6] dark:border-[#29332b] dark:hover:bg-[#202820]"><td className="px-4 py-3"><div className="flex items-center gap-3"><BookEmojiBadge title={book.title} category={book.category} /><span className="max-w-[220px] truncate text-sm font-semibold">{book.title}</span></div></td><td className="px-4 py-3 text-sm font-medium text-[#718073]">{book.author}</td><td className="px-4 py-3 text-sm font-medium text-[#718073]">{book.category}</td><td className="px-4 py-3 text-sm font-semibold text-[#506052] dark:text-[#b9c4ba]">{book.shelf}</td><td className="px-4 py-3">{book.loan ? <div className="min-w-[190px] text-xs"><p className="font-semibold text-[#ae7041]">{book.loan.borrower_name}</p><p className="mt-0.5 text-[#78847a]">No: {book.loan.borrower_number}</p><p className="mt-1 text-[#78847a]">Alındı {formatLoanDate(book.loan.borrowed_at)} · Teslim {formatLoanDate(book.loan.due_at)}</p></div> : <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e9f5d5] px-2.5 py-1 text-xs font-medium text-[#5b7c38] dark:bg-[#2b3d24] dark:text-[#c9e870]"><span className="size-1.5 rounded-full bg-current" />Rafta</span>}</td><td className="px-4 py-3"><MoreHorizontal size={17} className="text-[#9ba69c]" /></td></tr>)}</tbody></table>{filteredBooks.length === 0 && <div className="px-5 py-14 text-center text-sm text-[#8b988c]">Aramana uygun kitap bulunamadı.</div>}</div>
          <div className="flex items-center justify-between px-4 py-3 text-xs text-[#8b988c]"><span>{filteredBooks.length} kitap gösteriliyor</span><span>Son güncelleme: bugün</span></div>
        </section>
      </div></main>

      {showAddForm && <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#172219]/40 p-4 backdrop-blur-sm" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setShowAddForm(false)}><form onSubmit={addBook} className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-[#1b241c]"><div className="mb-6 flex items-start justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#7a9855]">Yeni kayıt</p><h2 className="mt-1 text-xl font-semibold">Kitap ekle</h2></div><button type="button" aria-label="Formu kapat" onClick={() => setShowAddForm(false)} className="rounded-lg p-2 text-[#8b988c] hover:bg-[#f1f4ee]"><X size={18} /></button></div><div className="grid gap-4 sm:grid-cols-2"><Field label="Kitap adı" value={form.title} required onChange={(value) => setForm({ ...form, title: value })} /><Field label="Yazar" value={form.author} required onChange={(value) => setForm({ ...form, author: value })} /><CategoryMenu value={form.category} onChange={(category) => setForm({ ...form, category })} /><Field label="Raf kodu" value={form.shelf} placeholder="Örn. A-04" onChange={(value) => setForm({ ...form, shelf: value })} /><label className="grid gap-1.5 text-xs font-medium text-[#627063]">Durum<select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as Book["status"] })} className="h-10 rounded-lg border border-[#dfe5dc] bg-[#fbfcf8] px-3 text-sm font-normal text-foreground outline-none focus:border-[#789c47] dark:border-[#344035] dark:bg-[#202820]"><option>Rafta</option><option>Ödünçte</option></select></label></div><div className="mt-7 flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>Vazgeç</Button><Button type="submit" className="bg-[#294b2d] text-white hover:bg-[#1f3c24]">Kaydet</Button></div></form></div>}

      {selectedBook && <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#172219]/40 p-4 backdrop-blur-sm" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setSelectedBook(null)}><div role="dialog" aria-modal="true" aria-labelledby="book-detail-title" className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-[#1b241c]"><div className="flex items-start justify-between"><div className="flex size-12 items-center justify-center rounded-xl bg-[#e8f2d1] text-[#5d8234] dark:bg-[#2c3a25] dark:text-[#d9ef63]"><BookOpen size={22} /></div><button aria-label="Detayı kapat" onClick={() => setSelectedBook(null)} className="rounded-lg p-2 text-[#8b988c] hover:bg-[#f1f4ee]"><X size={18} /></button></div><h2 id="book-detail-title" className="mt-5 text-2xl font-semibold tracking-tight">{selectedBook.title}</h2><p className="mt-1 text-sm font-medium text-[#78847a]">{selectedBook.author}</p><div className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-[#e4e9e1] bg-[#e4e9e1] dark:border-[#344035]">{[["Kategori", selectedBook.category], ["Raf kodu", selectedBook.shelf || "Belirtilmemiş"], ["Eklenme", selectedBook.added], ["Ödünç durumu", selectedBook.status === "Rafta" ? "Ödünç verilebilir" : "Şu an ödünçte"]].map(([label, value]) => <div key={label} className="bg-[#fbfcf8] p-3.5 dark:bg-[#202820]"><p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#9ba69c]">{label}</p><p className="mt-1 text-sm font-medium">{value}</p></div>)}</div><div className="mt-5 flex items-center justify-between border-t border-[#e7ebe5] pt-4 dark:border-[#29332b]"><span className="text-sm font-medium text-[#78847a]">Mevcut durum</span><span className="rounded-full bg-[#e9f5d5] px-2.5 py-1 text-xs font-medium text-[#5b7c38] dark:bg-[#2b3d24] dark:text-[#c9e870]">{selectedBook.status}</span></div></div></div>}
    </div>
  );
}

function StatCard({ label, value, icon, tone }: { label: string; value: string; icon: React.ReactNode; tone: "lime" | "blue" | "peach" }) {
  const colors = { lime: "bg-[#e9f5d5] text-[#6b913e]", blue: "bg-[#e1f0ef] text-[#508783]", peach: "bg-[#fff0dc] text-[#bd7e4c]" };
  return <div className="flex items-center justify-between rounded-2xl border border-[#dfe5dc] bg-white p-5 dark:border-[#29332b] dark:bg-[#171d18]"><div><p className="text-xs text-[#849086]">{label}</p><p className="mt-2 text-3xl font-semibold tracking-[-0.04em]">{value}</p></div><div className={`flex size-10 items-center justify-center rounded-xl ${colors[tone]}`}>{icon}</div></div>;
}

function CategoryMenu({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return <div className="grid gap-1.5 text-xs font-medium text-[#627063]"><span>Kategori</span><DropdownMenu><DropdownMenuTrigger className="flex h-10 w-full items-center justify-between rounded-lg border border-[#dfe5dc] bg-[#fbfcf8] px-3 text-left text-sm font-normal text-foreground outline-none focus:border-[#789c47] dark:border-[#344035] dark:bg-[#202820]">{value}<span className="text-[#9ba69c]">⌄</span></DropdownMenuTrigger><DropdownMenuContent align="start" className="w-[var(--anchor-width)]">{categories.map((category) => <DropdownMenuItem key={category} onClick={() => onChange(category)}>{category}</DropdownMenuItem>)}</DropdownMenuContent></DropdownMenu></div>;
}

function Field({ label, value, onChange, required, type = "text", placeholder }: { label: string; value: string; onChange: (value: string) => void; required?: boolean; type?: string; placeholder?: string }) {
  return <label className="grid gap-1.5 text-xs font-medium text-[#627063]">{label}<input required={required} type={type} value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} className="h-10 rounded-lg border border-[#dfe5dc] bg-[#fbfcf8] px-3 text-sm font-normal text-foreground outline-none placeholder:text-[#b4beb4] focus:border-[#789c47] focus:ring-2 focus:ring-[#d9ef63]/30 dark:border-[#344035] dark:bg-[#202820]" /></label>;
}
