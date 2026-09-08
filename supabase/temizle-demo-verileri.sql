-- Bu dosyayı yalnızca mevcut demo kitaplarını tamamen temizlemek için bir kez çalıştır.
-- Çalıştırınca books ve loans tabloları boşalır.

truncate table public.loans, public.books restart identity cascade;
