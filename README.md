# 🌌 Gemini AI Chat & Real-Time Micro-Cost Tracker

Google Gemini 1.5 Flash, 1.5 Pro ve 2.0 modelleri ile çalışan, Server-Sent Events (SSE) ile gerçek zamanlı yanıt akışı sağlayan ve harcanan her bir token'ın maliyetini (USD $ ve TRY ₺ cinsinden) anlık hesaplayıp görselleştiren tam yığın (Full-Stack) yapay zekâ uygulaması.

---

## 🚀 Özellikler

### 🤖 Gemini Yapay Zekâ & Streaming Engine
- **Server-Sent Events (SSE):** Düşük gecikmeli, anlık kelime ve token akışı.
- **Model Seçimi:** `Gemini 1.5 Flash`, `Gemini 1.5 Pro`, `Gemini 2.0 Flash`.
- **Sistem Talimatı (System Instruction) & Parametreler:** Temperature, Top-P, Maksimum Çıktı Tokenı ayarları.

### 💰 Canlı Token & Maliyet Takip Sistemi
- **Hassas Token Hesaplama:** Prompt (girdi) ve candidate (çıktı) tokenları Google AI Studio fiyat tarifesiyle çarpılarak hesaplanır.
- **Kademeli Fiyatlandırma:** $\le$128k ve $>$128k context kademeleri otomatik uygulanır.
- **Döviz Çevirici:** Anlık USD ($) ve TRY (₺) karşılığı gösterilir.
- **Canlı Simülatör / Hesaplayıcı:** Göndermeden önce tahmini token ve maliyet hesaplama aracı.

### 📊 Maliyet & Analitik Gösterge Paneli
- Toplam Harcama (\$ / ₺), Toplam Tüketilen Tokenlar, Toplam İstek ve İstek Başına Ortalama Maliyet KPI kartları.
- Model bazında harcama ve token kullanım dağılım grafikleri.
- Günlük trend ve işlem geçmişi tablosu.

### 🔐 Kimlik Doğrulama & Oturum Yönetimi
- **Firebase Auth:** Google ile Giriş, Anonim Giriş ve Geliştirici Profil Değiştirici.
- **Firestore & In-Memory Fallback:** Firebase anahtarı henüz eklenmese dahi kesintisiz yerel geliştirme modu.

---

## 🛠️ Kurulum ve Çalıştırma

### 1. Backend (Sunucu)
```bash
cd server
npm install
npm run dev
```
> Sunucu varsayılan olarak `http://localhost:5000` portunda çalışır.

### 2. Frontend (İstemci)
```bash
cd client
npm install
npm run dev
```
> İstemci varsayılan olarak `http://localhost:5173` portunda açılır.

### 3. Ortam Değişkenleri (.env)
* **`server/.env`**:
  ```env
  PORT=5000
  GEMINI_API_KEY=your_gemini_api_key_here
  FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccountKey.json
  ```
* **`client/.env`**:
  ```env
  VITE_API_BASE_URL=http://localhost:5000/api
  ```

---

## 🧪 Testleri Çalıştırma
```bash
cd server
npm test
```
