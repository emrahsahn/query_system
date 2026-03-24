# 🐐 Kurbanlık Takip ve Yönetim Sistemi

**Kurbanlık Takip Sistemi**, küçükbaş veya büyükbaş hayvan satışlarını yönetmek, müşterileri listelemek, bakiye/alacakları takip etmek ve stok (hayvan sayısı) tutmak için geliştirilmiş **Streamlit** tabanlı gelişmiş bir yönetim panelidir.

Uygulamanın masaüstü tasarımdan web arayüzüne çevrilmesi ve modern tasarımıyla ön plana çıkan **Görsel Kart UI yapısı**, veri güvenlik (Validation) filtreleri ile son derece kullanıcı dostudur. Supabase vb. bulut (Cloud) tabanlı SQL yapılarına taşınmaya %100 uygun kodlama esasına dayanır.

---
<img width="1919" height="899" alt="image" src="https://github.com/user-attachments/assets/338373ac-a917-4856-b90d-3876ac1e95a7" />
<img width="1343" height="808" alt="image" src="https://github.com/user-attachments/assets/c6713580-80c1-4f26-8ad9-b301d5259c5f" /> <img width="363" height="521" alt="image" src="https://github.com/user-attachments/assets/ff4b997c-cd0e-4639-b765-2678b4a47ec8" />
<img width="1889" height="833" alt="image" src="https://github.com/user-attachments/assets/3117eb49-7296-4825-aba9-99c76eb1fa63" />



## ✨ Projenin Temel Özellikleri

- 📋 **Kapsamlı Müşteri ve Hayvan Kaydı:** ID (Numara), cins, özellik, küpe rengi, hayvan rengi, kime ait olduğu ve ödeme bilgilerini içeren tam kayıt sistemi.
- 🎨 **Modern "Kart" Görünümü:** Tüm kayıtları, düz veri tabloları yerine; şık, gölgelendirmeli ve kullanışlı CSS kartları (Card) formatında sergileme.
- 🧮 **Hesaplı Fiyat ve Telefon Güvenliği:** 
  * "15,400.00 TL" ya da "0532 222 45 45" gibi parçalı, kendi kendini onaran, hatalı verileri dışlayan güvenli backend kontrol (Validation) sistemi.
- 📊 **Otomatik Finans İstatistikleri (Dashboard Paneli):** Toplam Müşteri / Hayvan sayısını bildirme ve "Beklenen Toplam Alacak" hesaplaması yapma (eski hatalı kayıtlara takılmadan).
- 🔍 **Detaylı Sorgulama:** Hayvan Numarasına, Sahip İsmine, Hayvan Cinsine veya Telefon numarasına göre kayıtlar arasında saniyeler içinde anında arama.
- 🔄 **Modern Güncelleme Paneli:** Telefon numarası veya Fiyat değişeceği zaman o veriye en uygun maskeleme arayüzü çıkararak güncellemeleri hatasız tutma.

---

## 🛠 Kullanılan Teknolojiler

- **Backend:** Python (3.9+)
- **Frontend Panel:** Streamlit HTML/CSS injections
- **Veritabanı (DB):** SQLite3 (`database.py` DB aracı olarak görevlidir ve veriler bir dosya olarak localde saklanır.)
- **Versiyon Kontrol & Mimari:** MVC yapısına yakın Modüler Dizin Tasarımı (`src` / `ui` pattern).

---

## 📂 Dizin (Klasör) Yapısı 

```text
📦 kurbanlik-takip-sistemi
 ┣ 📂 src
 ┃ ┣ 📜 database.py         # SQLite3 veritabanı bağlantısı, bütün temel sorgular (CRUD)
 ┃ ┣ 📜 main.py             # Uygulamayı başlatacak olan güvenli çağırıcı (Wrapper)
 ┃ ┣ 📜 models.py           # Describe Sınıfı (Müşteri veri modelleri ve Objeleri)
 ┃ ┗ 📜 backbone.py         # Dizin konumlarını ve global dosyaları belirleyen configler
 ┣ 📂 ui
 ┃ ┣ 📜 ui.py               # PyQt tabanlı eski masaüstü sürüm denemesi (Eski yapı - yedek)
 ┃ ┗ 📜 ui_deneme.py        # Streamlit Web Arayüzü Uygulaması (Gerçek, modern ve stabil sistem)
 ┣ 📜 README.md             # Projenin bu dokümantasyon belgesi
 ┗ 📜 requirements.txt      # Gerekli kurulum paketleri listesi
```

---

## 🚀 Hızlı Kurulum ve Çalıştırma Rehberi (Installation)

Sistemi kendi lokal bilgisayarınızda çalıştırmak için aşağıdaki adımları sırayla uygulayınız:

### 1️⃣ Ön Gereksinimler (Prerequisites)
Bilgisayarınızda **Python 3.9 veya üstü** bir sürümün kurulu olduğundan emin olun. Terminale (Command Prompt/PowerShell) şu komutu yazarak test edebilirsiniz:
```bash
python --version
```

### 2️⃣ Ortam (Virtual Environment) Oluşturma ve Aktifleştirme
Projeyi dış kütüphanelerden izole etmek için `.venv` kurulumu tavsiye edilir. Proje ana dizininde (README'nin olduğu yer) terminal açıp sırayla çalıştırın:
```bash
# Windows Sistemler için
python -m venv .venv

# Sanal ortamı aktifleştirme (Windows)
.venv\Scripts\activate

# --- Mac/Linux sistemler için ---
# python3 -m venv .venv
# source .venv/bin/activate
```

### 3️⃣ Gerekli Kütüphanelerin (Paketlerin) Kurulumu
Projenin ihtiyaç duyduğu `streamlit` vb. gibi paketleri kurmak için:
```bash
pip install -r requirements.txt
```

### 4️⃣ Uygulamayı Çalıştırma (Run)
`main.py` dosyası arka planda çift port/sekme bug'ını yok edecek güvenlik önlemleriyle donatılmıştır. O yüzden projeyi direkt Streamlit komutu ile değil, Python'un doğal komutuyla çağırın:

Aşağıdaki kodu yazarak uygulamayı sorunsuz başlatın:
```bash
cd src
python main.py
```

Bunun sonucunda terminalde şöyle bir yeşil/mavi link düşecektir:
> **`Local URL: http://localhost:8501`**

Eğer tarayıcı kendiliğinden açılmazsa, [http://localhost:8501](http://localhost:8501) linkine tıklayarak sisteme Chrome/Edge kalitesinde erişim sağlayabilirsiniz.

---

## ⚠️ Dikkat Edilecekler
- Çift port/sekme bug'ı oluşmaması ve kodun kendi kendini tetiklememesi için lütfen projeyi başlatırken kasten `streamlit run main.py` **YAZMAMAYA** özen gösterin. 
- Eğer direkt manuel çalıştırmak isterseniz (`main.py` wrapper'i kullanmadan) => `streamlit run ../ui/ui_deneme.py` komutu kullanılabilir.
- Parasal değerlerde küsürat kuruşu `00` olarak değerlendirilir. Günümüzde "Virgül ile kuruş yazma" engellenmiştir. Örn `1400.00` Nokta formatındadır.
- **Güvenli Yedekleme:** SQLite dosyası bilgisayarda fiziki olarak durduğu için bulut üzerine geçilmeden önce sistem formatlanırken veya bilgisayar devredilirken proje klasöründeki...
adsad
asdasd dosyaların `.sqlite` veya veri klasörünün yedeklenmesi şarttır!

---
adasd
*Geliştiren : Emrah ŞAHİN*
