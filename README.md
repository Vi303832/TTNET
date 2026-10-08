# ⚡ TT² Token Track AI Platform
### Google Gemini Destekli Çok Kullanıcılı & Mikro Maliyet Takip Panelli Web AI Platformu

> **TürkTicaret.net Staj Görev & Geliştirme Belgesi Standartlarına Uygun Olarak Geliştirilmiştir.**  
> **Proje Modeli:** Spec-Driven Development (SDD) & Test-Driven Development (TDD)  
> **Entegrasyon:** Google Gemini API (`usageMetadata`), Next.js 14 App Router, JWT & bcrypt Kimlik Doğrulama

---

## 🌟 1. Projenin Amacı ve Temel İlkeler

Bu platform; birden fazla kullanıcının güvenli kimlik doğrulama (JWT & bcrypt) ile sisteme kaydolup giriş yapabildiği, sunucu taraflı Google Gemini LLM API proxy'si üzerinden gerçek zamanlı (SSE Streaming) sohbet edebildiği ve her bir mesajda harcanan girdi/çıktı tokenları ile mikro-maliyetleri ($/₺) şeffaf bir şekilde hesaplayıp sunduğu uçtan uca kurumsal bir web yapay zekâ platformudur.

### 🛡️ Temel Mimari İlkeler:
1. **Spec-Driven Development (SDD):** Veritabanı şemaları, kota modelleri ve API sözleşmeleri önceden tanımlanmıştır.
2. **Zero-Client API Exposure:** `GEMINI_API_KEY` istemci tarafına (frontend) asla sızdırılmaz; tüm çağrılar `/api/chat/stream` proxy servisi üzerinden yürütülür.
3. **IDOR Koruması:** Kullanıcı istekleri istemciden gelen güvensiz başlıklara (`x-user-id`) değil, doğrulanmış `Authorization: Bearer <JWT>` tokenına göre yetkilendirilir.
4. **Deterministik Mikro Maliyet Hesabı:** Google AI Studio resmi birim fiyatları ($ / 10⁶ token) ve anlık döviz kuru (USD/TRY) ile kuruş seviyesinde hesaplanır.
5. **Bütçe & Kota Kontrolü (Budget Quota Guard):** Kullanıcının toplam harcaması tanımlı bütçe limitini (`balance_limit`) aştığında istekler engellenir ve açıklayıcı hata dönülür.

---

## 🏗️ 2. Veritabanı Şeması ve Veri Modeli (Faz 1)

Sistem hem in-memory veritabanı (yerel geliştirme için) hem de **Google Firebase Firestore** ile tam uyumlu hibrit bir mimari kullanır.

```
+-----------------------------------------------------------------------------------+
|                                   USERS TABLOSU                                   |
+------------------+------------------+---------------------------------------------+
| Alan Adı         | Veri Tipi        | Açıklama                                    |
+------------------+------------------+---------------------------------------------+
| id               | VARCHAR (PK)     | Benzersiz kullanıcı ID'si (örn. usr_xxx)    |
| email            | VARCHAR (Unique) | Kullanıcı e-posta adresi                    |
| name             | VARCHAR          | Kullanıcı adı soyadı                        |
| password_hash    | VARCHAR          | bcrypt ile hashlenmiş güvenli şifre         |
| balance_limit    | DECIMAL(10,4)    | Tanımlı bütçe kotası (varsayılan: $5.00)    |
| total_spent_usd  | DECIMAL(10,6)    | Kümülatif toplam harcama miktarı (USD)      |
| created_at       | TIMESTAMP        | Kayıt oluşturulma tarihi                    |
+------------------+------------------+---------------------------------------------+

+-----------------------------------------------------------------------------------+
|                             CONVERSATIONS (SESSIONS) TABLOSU                      |
+------------------+------------------+---------------------------------------------+
| id               | VARCHAR (PK)     | Benzersiz oturum ID'si (sess_xxx)           |
| user_id          | VARCHAR (FK)     | Kullanıcı referansı (users.id)              |
| title            | VARCHAR          | Sohbet başlığı (ilk mesajdan üretilir)      |
| model_name       | VARCHAR          | Kullanılan varsayılan LLM modeli            |
| lastUpdated      | TIMESTAMP        | Son mesaj tarihi                            |
| created_at       | TIMESTAMP        | Oluşturulma tarihi                          |
+------------------+------------------+---------------------------------------------+

+-----------------------------------------------------------------------------------+
|                                 MESSAGES TABLOSU                                  |
+------------------+------------------+---------------------------------------------+
| id               | VARCHAR (PK)     | Benzersiz mesaj ID'si (msg_xxx)             |
| conversation_id  | VARCHAR (FK)     | Oturum referansı (conversations.id)         |
| role             | ENUM             | 'user' | 'model' | 'system'                 |
| content          | TEXT             | Markdown mesaj içeriği                      |
| model_name       | VARCHAR          | Yanıtı üreten model                         |
| tokens           | OBJECT           | { promptTokens, candidateTokens, total }    |
| costUSD          | OBJECT           | { promptCost, candidateCost, totalCost }    |
| costTRY          | OBJECT           | { totalCost, exchangeRate }                 |
| latencyMs        | INTEGER          | Yanıt süresi (milisaniye)                   |
| createdAt        | TIMESTAMP        | Gönderim zamanı                             |
+------------------+------------------+---------------------------------------------+

+-----------------------------------------------------------------------------------+
|                    TOKEN_TRANSACTIONS / USAGE_LOGS TABLOSU                        |
+------------------+------------------+---------------------------------------------+
| id               | VARCHAR (PK)     | Benzersiz işlem ID'si (usage_xxx)           |
| message_id       | VARCHAR (FK)     | Mesaj referansı (messages.id)               |
| session_id       | VARCHAR (FK)     | Oturum referansı (conversations.id)         |
| user_id          | VARCHAR (FK)     | Kullanıcı referansı (users.id)              |
| model            | VARCHAR          | Model kimliği (örn. gemini-1.5-flash)       |
| prompt_tokens    | INTEGER          | Girdi token sayısı                          |
| candidate_tokens | INTEGER          | Üretilen çıktı token sayısı                 |
| total_tokens     | INTEGER          | Toplam token sayısı                         |
| prompt_cost      | DECIMAL(12,8)    | Girdi mikro maliyeti ($)                    |
| candidate_cost   | DECIMAL(12,8)    | Çıktı mikro maliyeti ($)                    |
| total_cost_usd   | DECIMAL(12,8)    | Toplam istek maliyeti ($)                   |
| total_cost_try   | DECIMAL(12,6)    | Toplam istek maliyeti (₺)                   |
| latencyMs        | INTEGER          | İşlem süresi (ms)                           |
| timestamp        | TIMESTAMP        | Loglanma zamanı                             |
+------------------+------------------+---------------------------------------------+
```

---

## 💰 3. Model Fiyatlandırma Referansı & Hesaplama Formülü

Maliyetler Google AI Studio resmi tarifesi baz alınarak şu formülle hesaplanır:

$$\text{Maliyet (USD)} = \left(\frac{\text{Girdi Token} \times \text{Girdi Birim Fiyatı}}{10^6}\right) + \left(\frac{\text{Çıktı Token} \times \text{Çıktı Birim Fiyatı}}{10^6}\right)$$

$$\text{Maliyet (TRY)} = \text{Maliyet (USD)} \times \text{Döviz Kuru (USD/TRY)}$$

| Model Adı | Girdi Fiyatı (1M Token / $\le$128k) | Çıktı Fiyatı (1M Token / $\le$128k) | Maksimum Bağlam Penceresi |
| :--- | :---: | :---: | :---: |
| **Gemini 1.5 Flash** *(Varsayılan)* | **$0.075** | **$0.300** | 1,048,576 tokens |
| **Gemini 1.5 Pro** | **$3.500** | **$10.500** | 2,097,152 tokens |
| **Gemini 3.8 Flash** | **$0.100** | **$0.400** | 1,048,576 tokens |
| **Gemini 3.7 Flash** | **$0.100** | **$0.400** | 1,048,576 tokens |
| **Gemini Flash Lite** | **$0.050** | **$0.200** | 1,048,576 tokens |

---

## 🔌 4. API Uç Noktaları ve İstek/Yanıt Sözleşmeleri (Contracts)

### 1. Kimlik Doğrulama: Kayıt Ol (`POST /api/auth/register`)
* **İstek Gövdesi:**
  ```json
  {
    "email": "stajyer@ttnet.com",
    "password": "GuvenliSifre123!",
    "name": "Stajyer Geliştirici",
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
      "email": "stajyer@ttnet.com",
      "displayName": "Stajyer Geliştirici",
      "balanceLimit": 5.00,
      "totalSpentUSD": 0.00
    }
  }
  ```

### 2. Kimlik Doğrulama: Giriş Yap (`POST /api/auth/login`)
* **İstek Gövdesi:**
  ```json
  {
    "email": "stajyer@ttnet.com",
    "password": "GuvenliSifre123!"
  }
  ```

### 3. Kullanıcı Bilgisi ve Kota Kontrolü (`GET /api/auth/me`)
* **Başlıklar:** `Authorization: Bearer <token>`
* **Yanıt:** Kullanıcının kalan bakiyesi, harcanan tutar ve kota durumunu döner.

### 4. Akışlı Mesajlaşma & Maliyet Proxy (`POST /api/chat/stream`)
* **Başlıklar:** `Authorization: Bearer <token>`, `Content-Type: application/json`
* **İstek Gövdesi:**
  ```json
  {
    "prompt": "Next.js App Router mimarisini özetle.",
    "model": "gemini-1.5-flash",
    "sessionId": "sess_1712345678",
    "exchangeRate": 35.50
  }
  ```
* **SSE Akış Olayları:**
  - `event: chunk` -> `{"type": "chunk", "text": "Next.js..."}`
  - `event: done` -> `{"type": "done", "tokens": {"promptTokens": 45, "candidateTokens": 180}, "costUSD": {"totalCost": 0.000057}, "costTRY": {"totalCost": 0.0020}, "quota": {"remainingBudgetUSD": 4.999943}}`
* **Bütçe Aşımı Durumu (402 Payment Required):**
  ```json
  {
    "error": "Bütçe limiti aşıldı! Tanımlı bakiye kotanız ($5.00) dolmuştur.",
    "code": "QUOTA_EXCEEDED"
  }
  ```

---

## ⚙️ 5. Kurulum ve Çalıştırma Adımları

### 1. Gereksinimler
* Node.js 18.x veya üzeri
* Google Gemini API Anahtarı ([Google AI Studio](https://aistudio.google.com/))

### 2. Ortam Değişkenlerini Tanımlama
`.env.example` dosyasını `.env.local` olarak kopyalayın ve anahtarınızı ekleyin:

```bash
cp .env.example .env.local
```

`.env.local` içeriği:
```env
GEMINI_API_KEY=AIzaSyD_your_actual_gemini_api_key_here
JWT_SECRET=your_super_secret_jwt_key_2026

# Opsiyonel: Firebase yapılandırması (Kullanılmadığında in-memory güvenli fallback çalışır)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
```

### 3. Bağımlılıkları Yükleme
```bash
npm install
```

### 4. Birim Testlerini Çalıştırma (TDD)
```bash
npm run test
```
*Tüm fiyatlandırma formülleri, bütçe kotaları ve şifre hash testleri doğrulanır.*

### 5. Geliştirici Sunucusunu Başlatma
```bash
npm run dev
```
Uygulamaya tarayıcınızdan erişin: `http://localhost:3000`

---

## 🧪 6. Test ve Güvenlik Güvencesi (QA & Hardening)

* **Vitest Birim Testleri:** `test/pricing.test.js`, `test/quota.test.js`, `test/auth.test.js` dosyalarıyla formüller ve sınır durumlar (0 token, negatif girdi, kota taşması, şifre doğrulama) kapsanmıştır.
* **IDOR Önleme:** Her API isteğinde JWT tokenı doğrulanarak sadece oturum sahibinin verilerine erişim sağlanır.
* **Bağlantı Kesintisi (Abort) Yönetimi:** Kullanıcı yanıt akarken bağlantıyı kesse bile sunucu tarafında o ana kadar harcanan tokenlar veritabanına loglanır.
