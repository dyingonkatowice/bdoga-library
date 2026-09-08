"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, BookOpen, MoreHorizontal, Plus, Search, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { supabase } from "@/lib/supabase";
import { BookEmojiBadge, categories, CategoryLegend } from "@/components/category-legend";

type Book = { id: number; title: string; author: string; category: string; shelf: string; status: "Rafta" | "Ödünçte"; added: string };
const emptyForm = { title: "", author: "", category: "Roman", shelf: "", status: "Rafta" as Book["status"] };

function dateLabel(value: string) { return new Intl.DateTimeFormat("tr-TR", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value)); }

export default function BooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Tümü");
  const [selected, setSelected] = useState<Book | null>(null);
  const [adding, setAdding] = useState(false);
  const [message, setMessage] = useState("");

  const loadBooks = async () => {
    if (!supabase) return;
    const { data, error } = await supabase.from("books").select("*").order("created_at", { ascending: false });
    if (error) { setMessage("Kitaplar yüklenemedi. Supabase ayarlarını kontrol et."); return; }
    setBooks(data.map((book) => ({ id: book.id, title: book.title, author: book.author, category: book.category, shelf: book.shelf, status: book.status, added: dateLabel(book.created_at) })));
  };

  useEffect(() => {
    const timer = window.setTimeout(() => { void loadBooks(); }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const visibleBooks = useMemo(() => books.filter((book) => {
    const matchesSearch = `${book.title} ${book.author} ${book.shelf}`.toLocaleLowerCase("tr").includes(search.toLocaleLowerCase("tr"));
    return matchesSearch && (category === "Tümü" || book.category === category);
  }), [books, category, search]);

  const addBook = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!supabase || !form.title.trim() || !form.author.trim()) return;
    const { error } = await supabase.from("books").insert({ title: form.title.trim(), author: form.author.trim(), category: form.category, shelf: form.shelf.trim(), status: form.status });
    if (error) { setMessage("Kitap kaydedilemedi."); return; }
    setForm(emptyForm); setAdding(false); setMessage("Kitap başarıyla eklendi."); void loadBooks();
  };

  const deleteBook = async (book: Book) => {
    if (!supabase || !window.confirm(`“${book.title}” kitabı silinsin mi?`)) return;
    const { error } = await supabase.from("books").delete().eq("id", book.id);
    if (error) { setMessage("Kitap silinemedi."); return; }
    setSelected(null); setBooks((current) => current.filter((item) => item.id !== book.id)); setMessage("Kitap silindi.");
  };

  return <div className="min-h-screen bg-[#f6f7f2] text-[#1e2922] dark:bg-[#111612] dark:text-[#edf3ea]"><main className="mx-auto max-w-6xl px-5 py-8 sm:px-8 lg:py-12"><header className="mb-8 flex items-start justify-between gap-4"><div><Link href="/" className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-[#718073] hover:text-foreground"><ArrowLeft size={16} /> Genel bakışa dön</Link><p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8b988c]">Katalog</p><h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em]">Kitaplar</h1><p className="mt-2 text-sm font-medium text-[#78847a]">Kütüphanedeki tüm kitap kayıtlarını buradan yönet.</p></div><Button onClick={() => setAdding(true)} className="mt-9 bg-[#294b2d] text-white hover:bg-[#1f3c24]"><Plus size={17} /> Kitap ekle</Button></header>
      <div className="mb-5"><p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#8b988c]">Kategori renkleri</p><CategoryLegend /></div>{message && <div className="mb-4 rounded-lg border border-[#d9e7be] bg-[#f1f8e4] px-4 py-3 text-sm text-[#557232]">{message}</div>}
      <section className="rounded-2xl border border-[#dfe5dc] bg-white shadow-[0_12px_40px_rgba(41,57,42,0.04)] dark:border-[#29332b] dark:bg-[#171d18]"><div className="flex flex-col gap-3 border-b border-[#e7ebe5] p-5 sm:flex-row dark:border-[#29332b]"><div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9ba69c]" size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Kitap veya yazar ara..." className="h-10 w-full rounded-lg border border-[#dfe5dc] bg-[#fbfcf8] pl-10 text-sm outline-none focus:border-[#789c47] dark:border-[#344035] dark:bg-[#202820]" /></div><select value={category} onChange={(event) => setCategory(event.target.value)} className="h-10 rounded-lg border border-[#dfe5dc] bg-[#fbfcf8] px-3 text-sm outline-none dark:border-[#344035] dark:bg-[#202820]"><option>Tümü</option>{categories.map((item) => <option key={item}>{item}</option>)}</select></div><div className="overflow-x-auto"><table className="w-full min-w-[700px] text-left"><thead><tr className="border-b border-[#e7ebe5] text-[10px] uppercase tracking-[0.14em] text-[#9ba69c] dark:border-[#29332b]"><th className="px-5 py-3">Kitap</th><th className="px-5 py-3">Yazar</th><th className="px-5 py-3">Kategori</th><th className="px-5 py-3">Raf</th><th className="px-5 py-3">Durum</th><th /></tr></thead><tbody>{visibleBooks.map((book) => <tr key={book.id} onClick={() => setSelected(book)} className="cursor-pointer border-b border-[#eef1eb] hover:bg-[#fafcf6] dark:border-[#29332b] dark:hover:bg-[#202820]"><td className="px-5 py-4"><span className="flex items-center gap-3 text-sm font-semibold"><BookEmojiBadge title={book.title} category={book.category} />{book.title}</span></td><td className="px-5 py-4 text-sm font-medium text-[#718073]">{book.author}</td><td className="px-5 py-4 text-sm font-medium text-[#718073]">{book.category}</td><td className="px-5 py-4 text-sm">{book.shelf || "-"}</td><td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs ${book.status === "Rafta" ? "bg-[#e9f5d5] text-[#5b7c38] dark:bg-[#2b3d24] dark:text-[#c9e870]" : "bg-[#fff0dc] text-[#ae7041] dark:bg-[#4a3422] dark:text-[#ffc58d]"}`}>{book.status}</span></td><td className="px-5"><MoreHorizontal size={17} className="text-[#9ba69c]" /></td></tr>)}</tbody></table>{visibleBooks.length === 0 && <p className="px-5 py-14 text-center text-sm text-[#8b988c]">Kayıt bulunamadı.</p>}</div></section></main>

      {adding && <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#172219]/40 p-4 backdrop-blur-sm"><form onSubmit={addBook} className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-[#1b241c]"><div className="mb-6 flex justify-between"><div><p className="text-xs uppercase tracking-[0.14em] text-[#7a9855]">Yeni kayıt</p><h2 className="mt-1 text-xl font-semibold">Kitap ekle</h2></div><button type="button" onClick={() => setAdding(false)} aria-label="Kapat"><X size={18} /></button></div><div className="grid gap-4 sm:grid-cols-2"><Input label="Kitap adı" required value={form.title} onChange={(value) => setForm({ ...form, title: value })} /><Input label="Yazar" required value={form.author} onChange={(value) => setForm({ ...form, author: value })} /><div className="grid gap-1.5 text-xs font-medium text-[#627063]"><span>Kategori</span><DropdownMenu><DropdownMenuTrigger className="flex h-10 w-full items-center justify-between rounded-lg border border-[#dfe5dc] px-3 text-left text-sm font-normal dark:border-[#344035]">{form.category}<span>⌄</span></DropdownMenuTrigger><DropdownMenuContent className="w-[var(--anchor-width)]">{categories.map((item) => <DropdownMenuItem key={item} onClick={() => setForm({ ...form, category: item })}>{item}</DropdownMenuItem>)}</DropdownMenuContent></DropdownMenu></div><Input label="Raf kodu" placeholder="Örn. A-04" value={form.shelf} onChange={(value) => setForm({ ...form, shelf: value })} /></div><div className="mt-7 flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setAdding(false)}>Vazgeç</Button><Button type="submit" className="bg-[#294b2d] text-white">Kaydet</Button></div></form></div>}
      {selected && <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#172219]/40 p-4 backdrop-blur-sm"><div role="dialog" className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-[#1b241c]"><div className="flex justify-between"><BookOpen className="text-[#63873b]" /><button onClick={() => setSelected(null)} aria-label="Kapat"><X size={18} /></button></div><h2 className="mt-5 text-2xl font-semibold">{selected.title}</h2><p className="mt-1 text-sm font-medium text-[#78847a]">{selected.author}</p><div className="mt-6 grid grid-cols-2 gap-3 text-sm"><Info label="Kategori" value={selected.category} /><Info label="Raf" value={selected.shelf || "Belirtilmemiş"} /><Info label="Eklenme" value={selected.added} /><Info label="Durum" value={selected.status} /></div><Button variant="destructive" onClick={() => void deleteBook(selected)} className="mt-6"><Trash2 size={16} /> Kitabı sil</Button></div></div>}
    </div>;
}

function Input({ label, value, onChange, required, placeholder }: { label: string; value: string; onChange: (value: string) => void; required?: boolean; placeholder?: string }) { return <label className="grid gap-1.5 text-xs font-medium text-[#627063]">{label}<input required={required} value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} className="h-10 rounded-lg border border-[#dfe5dc] bg-[#fbfcf8] px-3 text-sm font-normal outline-none focus:border-[#789c47] dark:border-[#344035] dark:bg-[#202820]" /></label>; }
function Info({ label, value }: { label: string; value: string }) { return <div className="rounded-lg bg-[#f5f8f1] p-3 dark:bg-[#202820]"><p className="text-[10px] uppercase tracking-[0.1em] text-[#9ba69c]">{label}</p><p className="mt-1 font-medium">{value}</p></div>; }

