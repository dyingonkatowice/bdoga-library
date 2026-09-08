# Supabase kurulumu

## 1. Supabase projesi oluştur

1. [supabase.com](https://supabase.com) adresine gir ve giriş yap.
2. `New project` seçeneğine tıkla.
3. Proje adı olarak `bergama-doga-kutuphanesi` yaz.
4. Güçlü bir veritabanı parolası belirle ve projeyi oluştur.
5. Projenin hazırlanmasını bekle.

## 2. Kitap tablosunu oluştur

1. Supabase panelinde sol menüden `SQL Editor` bölümünü aç.
2. `New query` seçeneğine tıkla.
3. Bu projedeki `supabase/schema.sql` dosyasının tamamını kopyala.
4. SQL Editor'a yapıştırıp `Run` butonuna bas.
5. Sol menüde `Table Editor` bölümünü açarak `books` tablosunu ve örnek kitapları kontrol et.

Şema şu alanları oluşturur:

- `title`: kitap adı
- `author`: yazar
- `category`: kategori
- `shelf`: raf kodu
- `status`: `Rafta` veya `Ödünçte`
- `created_at`: kütüphaneye eklenme tarihi ve saati

Şema ayrıca ödünç işlemleri için `loans` tablosunu oluşturur. Bu tabloda kitap, öğrenci adı, öğrenci numarası, veriliş tarihi, son teslim tarihi ve teslim edilme tarihi tutulur. Ödünç sayfasını kullanmadan önce güncel `supabase/schema.sql` dosyasını SQL Editor'da tekrar çalıştır. Mevcut projelerde bu işlem `borrower_number` kolonunu da ekler.

## Demo kitaplarını temizleme

Daha önce eski şema dosyasını çalıştırdıysan örnek kitaplar Supabase'de kalmış olabilir. Bu projede demo kitapları ve ödünç kayıtlarını silmek için `supabase/temizle-demo-verileri.sql` dosyasını SQL Editor'da bir kez çalıştır. Bu işlemden sonra kitap listesi boş açılır ve kitapları uygulamadaki `Kitap ekle` butonuyla sen eklersin.

## 3. Projeye Supabase anahtarlarını ekle

Supabase panelinde `Project Settings > API` sayfasını aç. `Project URL` ve `Publishable key` veya `anon` değerlerini al. Proje kökünde `.env.local` adında bir dosya oluştur. `.env.local.example` yalnızca örnektir; Next.js tarafından otomatik okunmaz:

```env
NEXT_PUBLIC_SUPABASE_URL=https://proje-id.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxxxxxxxxxxxxxxxx
```

Eski Supabase projelerinde publishable key yerine `anon` key görürsen onu aynı değişkene yazabilirsin. `service_role` veya secret key'i kesinlikle bu dosyaya ya da frontend koduna koyma.

## 4. Uygulamayı çalıştır

Env dosyasını ekledikten sonra geliştirme sunucusunu yeniden başlat:

```bash
bun dev
```

Tarayıcıyı `http://localhost:3000` adresinde aç. Kitaplar Supabase'den gelecek, `Kitap ekle` formu yeni kaydı veritabanına yazacak.

## Güvenlik notu

İlk kurulum şeması giriş yapmadan kitap okuma ve ekleme izni verir. Bu okul içinde hızlı başlangıç içindir. Uygulama internete açılacaksa sonraki adım Supabase Auth eklemek ve RLS politikalarını yalnızca giriş yapmış öğretmenlere izin verecek şekilde daraltmaktır.
