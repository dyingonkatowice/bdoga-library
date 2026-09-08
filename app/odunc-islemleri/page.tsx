"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Archive, CalendarDays, Check, Plus, Search, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { supabase } from "@/lib/supabase";
import { CategoryLegend } from "@/components/category-legend";

type Book = { id: number; title: string; status: "Rafta" | "Ödünçte" };
type Loan = { id: number; book_id: number; borrower_name: string; borrower_number: string; borrowed_at: string; due_at: string | null; returned_at: string | null; book?: Book };
const emptyForm = { bookId: "", borrower: "", borrowerNumber: "", dueAt: "" };

function dateLabel(value: string | null) { return value ? new Intl.DateTimeFormat("tr-TR", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value)) : "Belirtilmemiş"; }

export default function LoansPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [adding, setAdding] = useState(false);
  const [message, setMessage] = useState("");

  const loadData = async () => {
    if (!supabase) return;
    const [{ data: bookData }, { data: loanData, error }] = await Promise.all([
      supabase.from("books").select("id, title, status").order("title"),
      supabase.from("loans").select("*").is("returned_at", null).order("borrowed_at", { ascending: false }),
    ]);
    if (error) { setMessage("Ödünç kayıtları yüklenemedi. Önce schema.sql dosyasını Supabase'de çalıştır."); return; }
    setBooks(bookData ?? []);
    setLoans((loanData ?? []).map((loan) => ({ ...loan, book: bookData?.find((book) => book.id === loan.book_id) })));
  };

  useEffect(() => {
    const timer = window.setTimeout(() => { void loadData(); }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const lendBook = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!supabase || !form.bookId || !form.borrower.trim() || !form.borrowerNumber.trim()) return;
    const bookId = Number(form.bookId);
    const { error: loanError } = await supabase.from("loans").insert({ book_id: bookId, borrower_name: form.borrower.trim(), borrower_number: form.borrowerNumber.trim(), due_at: form.dueAt || null });
    if (loanError) { setMessage("Ödünç kaydı oluşturulamadı."); return; }
    const { error: bookError } = await supabase.from("books").update({ status: "Ödünçte" }).eq("id", bookId);
    if (bookError) { setMessage("Kayıt oluştu ancak kitap durumu güncellenemedi."); return; }
    setForm(emptyForm); setAdding(false); setMessage("Ödünç kaydı oluşturuldu."); void loadData();
  };

  const returnBook = async (loan: Loan) => {
    if (!supabase) return;
    const { error: loanError } = await supabase.from("loans").update({ returned_at: new Date().toISOString() }).eq("id", loan.id);
    const { error: bookError } = await supabase.from("books").update({ status: "Rafta" }).eq("id", loan.book_id);
    if (loanError || bookError) { setMessage("Teslim alma işlemi tamamlanamadı."); return; }
    setMessage("Kitap teslim alındı ve rafa döndü."); void loadData();
  };

  return <div className="min-h-screen bg-[#f6f7f2] text-[#1e2922] dark:bg-[#111612] dark:text-[#edf3ea]"><main className="mx-auto max-w-6xl px-5 py-8 sm:px-8 lg:py-12"><header className="mb-8 flex items-start justify-between gap-4"><div><Link href="/" className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-[#718073] hover:text-foreground"><ArrowLeft size={16} /> Genel bakışa dön</Link><p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8b988c]">Takip</p><h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em]">Ödünç İşlemleri</h1><p className="mt-2 text-sm font-medium text-[#78847a]">Alınan kitapları ve teslim tarihlerini takip et.</p></div><Button onClick={() => setAdding(true)} className="mt-9 bg-[#294b2d] text-white hover:bg-[#1f3c24]"><Plus size={17} /> Ödünç ver</Button></header><div className="mb-8"><p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#8b988c]">Kategori renkleri</p><CategoryLegend /></div>
      {message && <div className="mb-4 rounded-lg border border-[#d9e7be] bg-[#f1f8e4] px-4 py-3 text-sm text-[#557232]">{message}</div>}
      <section className="mb-6 grid gap-4 sm:grid-cols-3"><Metric label="Aktif ödünç" value={loans.length.toString()} icon={<Archive size={18} />} /><Metric label="Rafta bekleyen" value={books.filter((book) => book.status === "Rafta").length.toString()} icon={<Check size={18} />} /><Metric label="Bugün" value={new Intl.DateTimeFormat("tr-TR", { day: "2-digit", month: "short" }).format(new Date())} icon={<CalendarDays size={18} />} /></section>
      <section className="rounded-2xl border border-[#dfe5dc] bg-white shadow-[0_12px_40px_rgba(41,57,42,0.04)] dark:border-[#29332b] dark:bg-[#171d18]"><div className="border-b border-[#e7ebe5] p-5 dark:border-[#29332b]"><h2 className="font-semibold">Aktif ödünç kayıtları</h2><p className="mt-1 text-xs text-[#8b988c]">Kitap teslim edildiğinde ilgili satırdaki butonu kullan.</p></div><div className="divide-y divide-[#eef1eb] dark:divide-[#29332b]">{loans.map((loan) => <div key={loan.id} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-3"><div className="flex size-10 items-center justify-center rounded-xl bg-[#fff0dc] text-[#bd7e4c]"><BookOpenIcon /></div><div><p className="font-semibold">{loan.book?.title ?? "Kitap"}</p><p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-[#78847a]"><UserRound size={14} /> {loan.borrower_name} · {loan.borrower_number}</p></div></div><div className="flex items-center gap-5"><div className="text-left text-xs font-medium text-[#78847a]"><p>Veriliş</p><p className="mt-1 font-medium text-foreground">{dateLabel(loan.borrowed_at)}</p></div><div className="text-left text-xs font-medium text-[#78847a]"><p>Son teslim</p><p className="mt-1 font-medium text-foreground">{dateLabel(loan.due_at)}</p></div><Button variant="outline" size="sm" onClick={() => void returnBook(loan)}>Teslim al</Button></div></div>)}{loans.length === 0 && <p className="px-5 py-14 text-center text-sm text-[#8b988c]">Aktif ödünç kaydı yok.</p>}</div></section></main>
      {adding && <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#172219]/40 p-4 backdrop-blur-sm"><form onSubmit={lendBook} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-[#1b241c]" onClick={(event) => event.stopPropagation()}><p className="text-xs uppercase tracking-[0.14em] text-[#7a9855]">Yeni işlem</p><h2 className="mt-1 text-xl font-semibold">Kitabı ödünç ver</h2><div className="mt-6 grid gap-4"><BookPicker books={books} value={form.bookId} onChange={(bookId) => setForm({ ...form, bookId })} /><label className="grid gap-1.5 text-xs font-medium text-[#627063]">Öğrenci adı soyadı<input required value={form.borrower} onChange={(event) => setForm({ ...form, borrower: event.target.value })} placeholder="Ad soyad" className="h-10 rounded-lg border border-[#dfe5dc] bg-[#fbfcf8] px-3 text-sm outline-none dark:border-[#344035] dark:bg-[#202820]" /></label><label className="grid gap-1.5 text-xs font-medium text-[#627063]">Öğrenci numarası<input required value={form.borrowerNumber} onChange={(event) => setForm({ ...form, borrowerNumber: event.target.value })} placeholder="Örn. 1042" className="h-10 rounded-lg border border-[#dfe5dc] bg-[#fbfcf8] px-3 text-sm outline-none dark:border-[#344035] dark:bg-[#202820]" /></label><label className="grid gap-1.5 text-xs font-medium text-[#627063]">Son teslim tarihi<input type="date" value={form.dueAt} onChange={(event) => setForm({ ...form, dueAt: event.target.value })} className="h-10 rounded-lg border border-[#dfe5dc] bg-[#fbfcf8] px-3 text-sm outline-none dark:border-[#344035] dark:bg-[#202820]" /></label></div><div className="mt-7 flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setAdding(false)}>Vazgeç</Button><Button type="submit" className="bg-[#294b2d] text-white">Kaydet</Button></div></form></div>}
    </div>;
}

function Metric({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) { return <div className="flex items-center justify-between rounded-2xl border border-[#dfe5dc] bg-white p-5 dark:border-[#29332b] dark:bg-[#171d18]"><div><p className="text-xs text-[#849086]">{label}</p><p className="mt-2 text-2xl font-semibold">{value}</p></div><span className="flex size-10 items-center justify-center rounded-xl bg-[#e9f5d5] text-[#6b913e]">{icon}</span></div>; }
function BookOpenIcon() { return <Archive size={19} />; }

function BookPicker({ books, value, onChange }: { books: Book[]; value: string; onChange: (value: string) => void }) {
  const [query, setQuery] = useState("");
  const selectedBook = books.find((book) => book.id.toString() === value);
  const visibleBooks = books.filter((book) => `${book.title} ${book.status}`.toLocaleLowerCase("tr").includes(query.toLocaleLowerCase("tr")));

  return <div className="grid gap-1.5 text-xs font-medium text-[#627063]"><span>Kitap</span><DropdownMenu><DropdownMenuTrigger className="flex h-10 w-full items-center justify-between rounded-lg border border-[#dfe5dc] bg-[#fbfcf8] px-3 text-left text-sm font-normal text-foreground outline-none focus:border-[#789c47] dark:border-[#344035] dark:bg-[#202820]">{selectedBook?.title ?? "Kitap seçin"}<span className="text-[#9ba69c]">⌄</span></DropdownMenuTrigger><DropdownMenuContent align="start" className="w-[var(--anchor-width)] p-2"><div className="relative mb-2"><Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#9ba69c]" size={15} /><input value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => event.stopPropagation()} placeholder="Kitap ara..." className="h-9 w-full rounded-md border border-[#dfe5dc] bg-[#fbfcf8] pl-8 pr-2 text-xs outline-none focus:border-[#789c47] dark:border-[#344035] dark:bg-[#202820]" /></div><div className="max-h-52 overflow-y-auto">{visibleBooks.map((book) => <DropdownMenuItem key={book.id} disabled={book.status === "Ödünçte"} onClick={() => onChange(book.id.toString())} className="flex justify-between gap-3 py-2"><span className="truncate">{book.title}</span><span className="shrink-0 text-[10px] text-[#8b988c]">{book.status}</span></DropdownMenuItem>)}{visibleBooks.length === 0 && <p className="px-2 py-3 text-center text-xs text-[#8b988c]">Kitap bulunamadı.</p>}</div></DropdownMenuContent></DropdownMenu></div>;
}
