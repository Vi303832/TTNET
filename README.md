# ⚡ TT² Token Track AI Platform
### Google Gemini Destekli Çok Kullanıcılı & Mikro Maliyet Takip Panelli Web AI Platformu

> **TürkTicaret.net Staj Görev & Geliştirme Belgesi Standartlarına Uygun Olarak Geliştirilmiştir.**  
> **Geliştirme Metodolojisi:** Spec-Driven Development (SDD) & Test-Driven Development (TDD)  
> **Teknoloji Yığını:** Next.js 14 (App Router), React 18, Tailwind CSS, Google Gemini API (`@google/generative-ai`), Server-Sent Events (SSE), JWT & bcrypt, Firebase Firestore / In-Memory Hibrit Depolama, Vitest.

---

## 📑 İçindekiler
- [1. Projeye Genel Bakış ve Temel İlkeler](#-1-projeye-genel-bakış-ve-temel-ilkeler)
- [2. Temel Yetenekler ve Özellikler](#-2-temel-yetenekler-ve-özellikler)
- [3. Sistem ve Mimari Tasarımı](#-3-sistem-ve-mimari-tasarımı)
- [4. Veritabanı Şeması ve Veri Modeli](#-4-veritabanı-şeması-ve-veri-modeli)
- [5. Model Kataloğu ve Fiyatlandırma Formülleri](#-5-model-kataloğu-ve-fiyatlandırma-formülleri)
- [6. API Uç Noktaları ve Sözleşmeleri (API Specification)](#-6-api-uç-noktaları-ve-sözleşmeleri-api-specification)
- [7. Dizin ve Proje Yapısı](#-7-dizin-ve-proje-yapısı)
- [8. Kurulum ve Çalıştırma Rehberi](#-8-kurulum-ve-çalıştırma-rehberi)
- [9. Test ve Kalite Güvencesi (TDD & Vitest)](#-9-test-ve-kalite-güvencesi-tdd--vitest)
- [10. Güvenlik ve Kurumsal Standartlar](#-10-güvenlik-ve-kurumsal-standartlar)

---

## 🌟 1. Projeye Genel Bakış ve Temel İlkeler

**TT² Token Track AI Platform**, birden fazla kullanıcının güvenli kimlik doğrulama (**JWT & bcrypt**) ile sisteme kaydolup giriş yapabildiği, sunucu taraflı Google Gemini LLM API proxy'si üzerinden gerçek zamanlı (**SSE Streaming**) yapay zekâ sohbeti gerçekleştirebildiği ve her mesajda harcanan girdi/çıktı tokenları ile mikro maliyetleri ($ ve ₺) kuruş seviyesinde hesaplayıp raporladığı tam teşekküllü (full-stack) kurumsal bir web yapay zekâ platformudur.

```mermaid
flowchart LR
    Client[Tarayıcı / Next.js İstemci] -->|JWT Auth & Prompt| ProxyAPI[Next.js 14 API Proxy /api/chat/stream]
    ProxyAPI -->|Pre-check| QuotaGuard[Bütçe & Kota Kontrolü]
    QuotaGuard -->|API Key Güvenli| GeminiEngine[Google Gemini 3.7 / 3.8 Flash API]
    GeminiEngine -->|SSE Chunks & Token Metadata| ProxyAPI
    ProxyAPI -->|Mikro Maliyet Hesabı & Kayıt| Storage[Firestore / In-Memory DB]
    ProxyAPI -->|Gerçek Zamanlı Akış| Client
```

### 🛡️ Temel Mimari İlkeler
1. **Spec-Driven Development (SDD):** Veritabanı tabloları, bütçe kotaları, token fiyatlandırma motoru ve API sözleşmeleri önceden tanımlanmış kurallara göre kurgulanmıştır.
2. **Zero-Client API Exposure (Sıfır İstemci Sızıntısı):** `GEMINI_API_KEY` istemci tarafına (frontend) hiçbir koşulda aktarılmaz; tüm AI iletişimi `/api/chat/stream` proxy uç noktası üzerinden yürütülür.
3. **IDOR Koruması (Insecure Direct Object Reference):** Kullanıcı istekleri istemciden gelen başlıklarla değil, kriptografik olarak imzalanmış `Authorization: Bearer <JWT>` tokenı ile yetkilendirilir.
4. **Deterministik Mikro Maliyet Hesabı:** Google AI Studio resmi birim fiyat tarifesi ($ / 10⁶ token) ve anlık USD/TRY döviz kuru üzerinden kuruş hassasiyetinde hesaplanır.
5. **Bütçe & Kota Koruma Kalkanı (Budget Quota Guard):** Kullanıcının toplam harcaması tanımlı bakiye sınırını (`balance_limit`, varsayılan $5.00) aştığında AI çağrısı engellenir ve HTTP `402 Payment Required` kodu ile işlem durdurulur.
6. **Akıllı Model Geri Dönüşü (Fallback Cascade):** Talep edilen modelde kota veya API engeli oluştuğunda, sistem otomatik olarak yedek Gemini modellerine geçerek akışın kesintiye uğramasını önler.
7. **Bağlantı Kesintisi (Abort) Güvenliği:** Kullanıcı yanıt üretilirken üretimi dursa dahi o ana kadar tüketilen tokenlar hesaplanıp veritabanına loglanır.

---

## 🚀 2. Temel Yetenekler ve Özellikler

### 💬 1. Gerçek Zamanlı AI Sohbet & SSE Streaming
* **Düşük Gecikmeli Akış (Server-Sent Events):** Kelime kelime akıcı metin aktarımı.
* **Gelişmiş Markdown & Kod Blokları:** Canlı kod renklendirme, tablolar, tek tıkla kopyalama desteği.
* **Mesaj İçi Mikro Rozetler:** Her asistan mesajının altında harcanan prompt/çıktı token sayısı, yanıt süresi (ms) ve USD/TRY maliyeti gösterilir.
* **Durdurma (Stop Generating):** Uzun yanıtları anında sonlandırabilme yeteneği (`AbortController`).

### 🤖 2. Çoklu Model Desteği
* **Gemini 3.7 Flash** *(Amiral Gemisi - Varsayılan)*: Yüksek işlem hızı, hibrit akıl yürütme ve gelişmiş kodlama.
* **Gemini 3.8 Flash** *(Yeni Nesil)*: Karmaşık yazılım mimarileri ve uzun soluklu iş akışları için optimize.
* **Gemini 3.5 Flash** *(Dengeli & Hızlı)*: Düşük gecikmeli, yüksek verimli genel asistan.
* **Gemini Flash Lite** *(Mikro Maliyet)*: Ultra düşük maliyet ve yüksek hacimli operasyonlar.
* **Geriye Dönük Uyumluluk (Legacy Mapping):** Eski 1.5 Flash/Pro istekleri güvenle canlı modellere eşlenir.

### 📊 3. Mikro Maliyet Analitik Paneli (Cost Dashboard)
* **Kümülatif Harcama Göstergeleri:** Toplam harcanan USD ve TRY tutarları.
* **Token Dağılım Grafikleri:** Girdi (Prompt) ve Çıktı (Candidate) token oranları.
* **Oturum ve Model Bazlı Filtreleme:** Hangi modelde ne kadar harcama yapıldığının dökümü.
* **CSV Dışa Aktarma (Export):** Tüm token işlem geçmişini kurumsal analizler için tek tıkla CSV formatında indirme.

### 🧮 4. Etkileşimli Fiyatlandırma & Token Simülatörü
* **Canlı Token Hesaplayıcı:** Kullanıcının gireceği tahmini girdi ve çıktı token adetlerine göre anlık USD/TRY maliyeti hesaplayan simülatör.
* **Şeffaf Tarife Tablosu:** Tüm aktif modellerin 1M token başına düşen girdi ve çıktı birim fiyatları.

### ⚙️ 5. Model Parametreleri ve Sistem Yönergeleri (Settings)
* **System Instruction:** Modele özel sistem komutu tanımlayabilme.
* **Hiperparametre Ayarları:** `Temperature`, `Top-P`, `Top-K` ve `Max Output Tokens` dinamik yapılandırması.
* **Canlı Döviz Kuru Ayarı:** USD/TRY paritesini anlık güncelleyebilme.

### 🔐 6. Güvenli Kimlik Doğrulama & Oturum Yönetimi
* **JWT & bcrypt:** 10 salt round ile şifrelenen kullanıcı parolaları ve güvenli oturum tokenları.
* **Çoklu Sohbet Oturumu (Multi-Session):** Sohbetleri ayrı başlıklarda saklama, geçmiş oturumlara dönme ve temizleme.
* **Hibrit Veri Saklama:** Google Firebase Firestore yapılandırılmışsa buluta, yapılandırılmamışsa in-memory bellek deposuna otomatik geçiş.

---

## 🏗️ 3. Sistem ve Mimari Tasarımı

```
TTNET/
├── src/
│   ├── app/                      # Next.js 14 App Router
│   │   ├── api/                  # Backend REST & Streaming API Endpoints
│   │   │   ├── auth/             # Kayıt, Giriş ve Kullanıcı Bilgisi (/register, /login, /me)
│   │   │   ├── chat/             # SSE Akış ve Oturum Yönetimi (/stream, /sessions)
│   │   │   ├── cost/             # Token Maliyet Simülasyonu ve Analitik (/estimate, /stats)
│   │   │   ├── health/           # Sistem Sağlık Kontrolü (/health)
│   │   │   └── models/           # Aktif Model Kataloğu (/models)
│   │   ├── app/page.jsx          # Ana Chat & Analitik Uygulama Ekranı (/app)
│   │   ├── page.jsx              # Neo-Brutalist Landing Page (/)
│   │   └── layout.jsx            # Global Layout ve HTML Kökü
│   ├── components/               # Modüler React Bileşenleri
│   │   ├── analytics/            # Maliyet Gösterge Paneli (CostDashboard.jsx)
│   │   ├── auth/                 # Giriş/Kayıt Modal Penceresi (AuthModal.jsx)
│   │   ├── chat/                 # Chat Görünümü, Mesaj Kartları ve Giriş Alanı
│   │   ├── layout/               # Üst Başlık (Header) ve Yan Menü (Sidebar)
│   │   ├── pricing/              # Fiyat Tarifesi & Token Hesaplayıcı (PricingModal.jsx)
│   │   └── settings/             # Model ve Parametre Ayarları (SettingsModal.jsx)
│   ├── context/                  # React Context (AuthContext.jsx)
│   ├── lib/                      # Çekirdek Kütüphaneler & İş Mantığı
│   │   ├── auth.js               # JWT & bcrypt Güvenlik Katmanı
│   │   ├── gemini.js             # Google Generative AI SDK İstemcisi & Token Sayacı
│   │   ├── pricing.js            # Fiyatlandırma Motoru & Model Kataloğu
│   │   └── storage.js            # Firestore & In-Memory Hibrit Depolama Servisi
│   └── services/                 # Frontend API İstek Servisi (api.js)
├── test/                         # Vitest Birim Testleri
│   ├── auth.test.js              # Kimlik doğrulama, hashleme ve IDOR testleri
│   ├── pricing.test.js           # Deterministik token maliyet testleri
│   └── quota.test.js             # Bütçe sınırı ve kota aşım testleri
├── .env.example                  # Örnek Ortam Değişkenleri
├── package.json                  # Proje Bağımlılıkları ve Scriptler
└── tailwind.config.js            # Neo-Brutalist Tasarım Sistemi Yapılandırması
```

---

## 🗄️ 4. Veritabanı Şeması ve Veri Modeli

Sistem hem yerel geliştirmeler için **In-Memory Store** hem de canlı ortam için **Google Firebase Firestore** ile %100 uyumludur.

```
+-----------------------------------------------------------------------------------+
|                                   USERS TABLOSU                                   |
+------------------+------------------+---------------------------------------------+
| Alan Adı         | Veri Tipi        | Açıklama                                    |
+------------------+------------------+---------------------------------------------+
| id               | VARCHAR (PK)     | Benzersiz kullanıcı kimliği (usr_xxx)       |
| email            | VARCHAR (Unique) | Kullanıcı e-posta adresi                    |
| name             | VARCHAR          | Kullanıcı adı ve soyadı                     |
| password_hash    | VARCHAR          | bcrypt ile hashlenmiş güvenli şifre         |
| balance_limit    | DECIMAL(10,4)    | Tanımlı bütçe kotası (varsayılan: $5.00)    |
| total_spent_usd  | DECIMAL(12,6)    | Toplam harcanan miktar ($)                  |
| created_at       | TIMESTAMP        | Kayıt oluşturulma tarihi                    |
+------------------+------------------+---------------------------------------------+

+-----------------------------------------------------------------------------------+
|                             CONVERSATIONS (SESSIONS) TABLOSU                      |
+------------------+------------------+---------------------------------------------+
| id               | VARCHAR (PK)     | Benzersiz oturum kimliği (sess_xxx)         |
| user_id          | VARCHAR (FK)     | Oturumun ait olduğu kullanıcı (users.id)    |
| title            | VARCHAR          | Sohbet başlığı                              |
| model_name       | VARCHAR          | Kullanılan varsayılan model                 |
| lastUpdated      | TIMESTAMP        | Son aktivite tarihi                         |
| created_at       | TIMESTAMP        | Oluşturulma tarihi                          |
+------------------+------------------+---------------------------------------------+

+-----------------------------------------------------------------------------------+
|                                 MESSAGES TABLOSU                                  |
+------------------+------------------+---------------------------------------------+
| id               | VARCHAR (PK)     | Benzersiz mesaj kimliği (msg_xxx)           |
| conversation_id  | VARCHAR (FK)     | Oturum referansı (conversations.id)         |
| role             | ENUM             | 'user' | 'model' | 'system'                 |
| content          | TEXT             | Markdown mesaj içeriği                      |
| model_name       | VARCHAR          | Yanıtı üreten model adı                     |
| tokens           | OBJECT           | { promptTokens, candidateTokens, total }    |
| costUSD          | OBJECT           | { promptCost, candidateCost, totalCost }    |
| costTRY          | OBJECT           | { promptCostTRY, candidateCostTRY, total }  |
| latencyMs        | INTEGER          | Milisaniye cinsinden yanıt süresi           |
| createdAt        | TIMESTAMP        | Mesaj gönderim zamanı                       |
+------------------+------------------+---------------------------------------------+

+-----------------------------------------------------------------------------------+
|                    TOKEN_TRANSACTIONS / USAGE_LOGS TABLOSU                        |
+------------------+------------------+---------------------------------------------+
| id               | VARCHAR (PK)     | Benzersiz işlem kaydı (usage_xxx)           |
| message_id       | VARCHAR (FK)     | Mesaj referansı (messages.id)               |
| session_id       | VARCHAR (FK)     | Oturum referansı (conversations.id)         |
| user_id          | VARCHAR (FK)     | Kullanıcı referansı (users.id)              |
| model            | VARCHAR          | Kullanılan model                            |
| prompt_tokens    | INTEGER          | Girdi token adedi                           |
| candidate_tokens | INTEGER          | Üretilen çıktı token adedi                  |
| total_tokens     | INTEGER          | Toplam token adedi                          |
| prompt_cost      | DECIMAL(12,8)    | Girdi maliyeti ($)                          |
| candidate_cost   | DECIMAL(12,8)    | Çıktı maliyeti ($)                          |
| total_cost_usd   | DECIMAL(12,8)    | Toplam istek maliyeti ($)                   |
| total_cost_try   | DECIMAL(12,6)    | Toplam istek maliyeti (₺)                   |
| latencyMs        | INTEGER          | Yanıt süresi (ms)                           |
| timestamp        | TIMESTAMP        | İşlem zamanı                                |
+------------------+------------------+---------------------------------------------+
```

---

## 💰 5. Model Kataloğu ve Fiyatlandırma Formülleri

### 📐 Hesaplama Formülü

$$\text{Toplam Maliyet (USD)} = \left(\frac{\text{Girdi Token} \times \text{Girdi Birim Fiyatı}}{10^6}\right) + \left(\frac{\text{Çıktı Token} \times \text{Çıktı Birim Fiyatı}}{10^6}\right)$$

$$\text{Toplam Maliyet (TRY)} = \text{Toplam Maliyet (USD)} \times \text{Döviz Kuru (USD/TRY)}$$

### 🏷️ Güncel Birim Fiyat Tarifesi

| Model Adı | Rozet | Girdi Fiyatı (1M Token) | Çıktı Fiyatı (1M Token) | Maks. Girdi Bağlamı |
| :--- | :---: | :---: | :---: | :---: |
| **Gemini 3.7 Flash** *(Varsayılan)* | `Flagship Flash` | **$0.100** | **$0.400** | 1,048,576 tokens |
| **Gemini 3.8 Flash** | `Yeni Nesil` | **$0.100** | **$0.400** | 1,048,576 tokens |
| **Gemini 3.5 Flash** | `Dengeli & Hızlı` | **$0.080** | **$0.300** | 1,048,576 tokens |
| **Gemini Flash Lite** | `Mikro Maliyet` | **$0.050** | **$0.200** | 1,048,576 tokens |
| *Gemini 1.5 Flash (Arşiv)* | `Legacy` | $0.075 | $0.300 | 1,048,576 tokens |
| *Gemini 1.5 Pro (Arşiv)* | `Legacy` | $3.500 | $10.500 | 2,097,152 tokens |

---

## 🔌 6. API Uç Noktaları ve Sözleşmeleri (API Specification)

### 1. Kimlik Doğrulama: Kayıt Ol
* **Uç Nokta:** `POST /api/auth/register`
* **İstek Gövdesi:**
  ```json
  {
    "email": "developer@ttnet.com",
    "password": "SecurePassword123!",
    "name": "Mehmet Geliştirici",
    "balance_limit": 5.00
  }
  ```
* **Başarılı Yanıt (200 OK):**
  ```json
  {
    "success": true,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "usr_1712345678",
      "email": "developer@ttnet.com",
      "displayName": "Mehmet Geliştirici",
      "balanceLimit": 5.00,
      "totalSpentUSD": 0.00
    }
  }
  ```

### 2. Kimlik Doğrulama: Giriş Yap
* **Uç Nokta:** `POST /api/auth/login`
* **İstek Gövdesi:**
  ```json
  {
    "email": "developer@ttnet.com",
    "password": "SecurePassword123!"
  }
  ```

### 3. Kullanıcı Profili ve Kota Bilgisi
* **Uç Nokta:** `GET /api/auth/me`
* **Başlıklar:** `Authorization: Bearer <token>`
* **Yanıt:** Kullanıcının kalan bakiyesi, güncel harcama toplamı ve hesap detayları.

### 4. Gerçek Zamanlı Mesaj Akışı & Mikro Maliyet Proxy'si
* **Uç Nokta:** `POST /api/chat/stream`
* **Başlıklar:** `Authorization: Bearer <token>`, `Content-Type: application/json`
* **İstek Gövdesi:**
  ```json
  {
    "prompt": "Next.js App Router mimarisini ve SSE streaming avantajlarını açıkla.",
    "model": "gemini-3.7-flash",
    "sessionId": "sess_1712345678",
    "exchangeRate": 35.50,
    "generationConfig": {
      "temperature": 0.7,
      "topP": 0.95,
      "maxOutputTokens": 4096
    }
  }
  ```
* **Server-Sent Events (SSE) Akış Olayları:**
  - `event: chunk` -> `{"type": "chunk", "text": "Next.js..."}`
  - `event: done` ->
    ```json
    {
      "type": "done",
      "messageId": "msg_987654",
      "model": "gemini-3.7-flash",
      "tokens": {
        "promptTokens": 62,
        "candidateTokens": 240,
        "totalTokens": 302
      },
      "costUSD": {
        "promptCost": 0.0000062,
        "candidateCost": 0.000096,
        "totalCost": 0.0001022
      },
      "costTRY": {
        "totalCost": 0.003628,
        "exchangeRate": 35.50
      },
      "latencyMs": 845,
      "quota": {
        "balanceLimit": 5.00,
        "totalSpentUSD": 0.0001022,
        "remainingBudgetUSD": 4.9998978
      }
    }
    ```
* **Bütçe Kotası Aşımı Durumu (402 Payment Required):**
  ```json
  {
    "error": "Bütçe limiti aşıldı! Tanımlı bakiye kotanız ($5.00) dolmuştur.",
    "code": "QUOTA_EXCEEDED",
    "balanceLimit": 5.00,
    "totalSpent": 5.0045
  }
  ```

### 5. Sohbet Oturumları
* `GET /api/chat/sessions`: Kullanıcının tüm oturum listesi.
* `DELETE /api/chat/sessions/:sessionId`: Belirtilen oturumu ve mesaj geçmişini silme.
* `GET /api/chat/sessions/:sessionId/messages`: Oturuma ait mesaj dökümü.

### 6. Analitik ve Fiyat Tahmini
* `GET /api/cost/stats`: Kullanıcının kümülatif harcama, token dökümü ve oturum istatistikleri.
* `POST /api/cost/estimate`: Belirtilen prompt/çıktı token sayıları için anlık $ ve ₺ maliyet simülasyonu.
* `GET /api/models`: Desteklenen aktif modeller ve birim fiyat kataloğu.
* `GET /api/health`: Sistem servislerinin ve Gemini API bağlantı durumunun kontrolü.

---

## 📂 7. Dizin ve Proje Yapısı

```
TTNET/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   ├── login/route.js
│   │   │   │   ├── me/route.js
│   │   │   │   └── register/route.js
│   │   │   ├── chat/
│   │   │   │   ├── sessions/
│   │   │   │   │   ├── [sessionId]/
│   │   │   │   │   │   ├── messages/route.js
│   │   │   │   │   │   └── route.js
│   │   │   │   │   └── route.js
│   │   │   │   └── stream/route.js
│   │   │   ├── cost/
│   │   │   │   ├── estimate/route.js
│   │   │   │   └── stats/route.js
│   │   │   ├── health/route.js
│   │   │   └── models/route.js
│   │   ├── app/page.jsx
│   │   ├── globals.css
│   │   ├── layout.jsx
│   │   ├── not-found.jsx
│   │   └── page.jsx
│   ├── components/
│   │   ├── analytics/CostDashboard.jsx
│   │   ├── auth/AuthModal.jsx
│   │   ├── chat/
│   │   │   ├── ChatInput.jsx
│   │   │   ├── ChatMessage.jsx
│   │   │   └── ChatView.jsx
│   │   ├── layout/
│   │   │   ├── Header.jsx
│   │   │   └── Sidebar.jsx
│   │   ├── pricing/PricingModal.jsx
│   │   └── settings/SettingsModal.jsx
│   ├── config/firebase.js
│   ├── context/AuthContext.jsx
│   ├── lib/
│   │   ├── auth.js
│   │   ├── gemini.js
│   │   ├── pricing.js
│   │   └── storage.js
│   └── services/api.js
├── test/
│   ├── auth.test.js
│   ├── pricing.test.js
│   └── quota.test.js
├── .env.example
├── .env.local
├── jsconfig.json
├── next.config.mjs
├── package.json
├── postcss.config.js
├── tailwind.config.js
└── README.md
```

---

## ⚙️ 8. Kurulum ve Çalıştırma Rehberi

### 1. Sistem Gereksinimleri
* **Node.js**: v18.17.0 veya üzeri (v20+ önerilir)
* **npm** / **yarn** / **pnpm**
* **Google Gemini API Anahtarı**: [Google AI Studio](https://aistudio.google.com/) üzerinden ücretsiz temin edilebilir.

### 2. Depoyu Klonlama ve Bağımlılıkları Yükleme
```bash
git clone <repo-url>
cd TTNET
npm install
```

### 3. Ortam Değişkenlerini Tanımlama (`.env.local`)
`.env.example` dosyasını kopyalayarak `.env.local` oluşturun:

```bash
cp .env.example .env.local
```

`.env.local` dosyasını düzenleyin:
```env
# Google Gemini API Yapılandırması (Zorunlu)
GEMINI_API_KEY=AIzaSyD_your_actual_gemini_api_key_here

# Güvenlik ve JWT Gizli Anahtarı (Zorunlu)
JWT_SECRET=ttnet-gemini-ai-secure-jwt-secret-key-2026

# Opsiyonel: Firebase Yapılandırması (Tanımlanmazsa In-Memory Fallback çalışır)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
```

### 4. Geliştirme Sunucusunu Başlatma
```bash
npm run dev
```
Uygulamayı tarayıcınızda açın:
* **Landing Page:** [http://localhost:3000](http://localhost:3000)
* **AI Uygulama & Chat Paneli:** [http://localhost:3000/app](http://localhost:3000/app)

### 5. Prodüksiyon Derlemesi ve Çalıştırma
```bash
npm run build
npm run start
```

---

## 🧪 9. Test ve Kalite Güvencesi (TDD & Vitest)

Platform, Spec-Driven ve Test-Driven standartlarında geliştirilmiştir. Tüm fiyat hesaplamaları, token sınırları, bütçe kotaları ve yetkilendirme akışları birim testlerle doğrulanmıştır.

```bash
npm run test
```

### 📋 Test Kapsamı
* **`test/pricing.test.js`**:
  * Model isimlerinin normalizasyonu (alias çözümleme).
  * Gemini 3.7 Flash ve 3.8 Flash deterministik maliyet hesabı ($0.10/$0.40).
  * Gemini 1.5 Flash ve 1.5 Pro kademeli (tiered) fiyatlandırma doğrulaması.
  * Uç durumlar: 0 token, negatif veya geçersiz girdi denetimi, mikro tokenlar.
* **`test/quota.test.js`**:
  * $5.00 kota kontrolü, bütçe aşımı durumunda işlemin engellenmesi.
* **`test/auth.test.js`**:
  * bcrypt ile güvenli parola hashleme ve doğrulama.
  * JWT token üretimi, imza doğrulaması ve IDOR güvenlik kontrolü.

---

## 🔒 10. Güvenlik ve Kurumsal Standartlar

1. **İstemci Güvenliği (Zero-Leakage):** `GEMINI_API_KEY` ve kritik kimlik bilgileri sadece Next.js sunucu tarafında (`process.env`) saklanır.
2. **Kimlik Doğrulama Güvenliği:** Parolalar bcrypt ile tek yönlü tuzlanarak (salt) hashlenir. Oturumlar 7 gün geçerli JWT ile korunur.
3. **IDOR Engelleme:** Kullanıcılar sadece kendi oturumlarını ve kendi tüketim istatistiklerini görebilir.
4. **Kota Güvencesi:** Her istek öncesinde kullanıcının kalan bakiyesi kontrol edilir, bütçe aşımı durumunda API çağrısı yapılmadan önce istek durdurulur.
5. **Geri Dönüş (Fallback) Güvenliği:** Model geçişlerinde veya bağlantı kopmalarında veri kaybı yaşanmaz; tüketim anlık loglanır.

---

<div align="center">
  <sub>TürkTicaret.net Staj Görevi Kapsamında Geliştirilmiştir · © 2026 TT² Token Track</sub>
</div>
