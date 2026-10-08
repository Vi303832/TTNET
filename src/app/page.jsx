'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Zap, 
  ArrowUpRight, 
  Terminal, 
  Cpu, 
  Sparkles,
  Layers,
  Coins,
  MessageSquare
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-paper text-ink font-mono selection:bg-signal selection:text-paper">
      
      {/* 1. TOP ACCENT TAPE */}
      <div className="bg-signal text-ink border-b-2 border-ink">
        <div className="max-w-[1400px] mx-auto px-5 md:px-8 h-7 flex items-center justify-between font-mono text-[10px] font-bold uppercase tracking-[0.2em]">
          <div className="flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 fill-ink stroke-none" />
            <span>TÜRKTİCARET.NET STAJ PROJESİ · KOD ADI: TT² · TOKEN TRACK</span>
          </div>
          <div className="hidden sm:inline font-bold">
            GEMINI 3.8 FLASH STREAMING & MİKRO MALİYET TAKİBİ
          </div>
        </div>
      </div>

      {/* 2. STICKY PAPER NAV */}
      <header className="sticky top-0 z-50 bg-paper border-b-2 border-ink">
        <div className="max-w-[1400px] mx-auto px-5 md:px-8 h-14 md:h-16 flex items-center justify-between">
          
          {/* Brand Lockup */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <span className="w-8 h-7 inline-flex items-center justify-center bg-signal text-paper font-mono font-black text-xs border-2 border-ink transition-transform group-hover:-translate-y-0.5">
              TT²
            </span>
            <span className="font-mono font-extrabold tracking-tight text-base md:text-lg text-ink">
              TOKEN TRACK<span className="text-signal font-black">®</span>
            </span>
          </Link>

          {/* Center Nav */}
          <nav className="hidden md:flex items-center gap-7 font-mono text-[12px] font-bold uppercase tracking-widest text-ink">
            <a href="#features" className="link-underline pb-0.5">Özellikler</a>
            <a href="#details" className="link-underline pb-0.5">Yetenekler</a>
            <a href="#method" className="link-underline pb-0.5">Çalışma Mantığı</a>
            <a href="#project" className="link-underline pb-0.5">Proje Hakkında</a>
          </nav>

          {/* Right CTA Pill */}
          <div className="flex items-center gap-3">
            <Link
              href="/app"
              className="font-mono text-[11px] md:text-[12px] font-bold uppercase tracking-widest bg-ink text-paper px-3.5 md:px-4 py-2 md:py-2.5 border-2 border-ink transition-all duration-150 hover:bg-signal hover:border-signal hover:text-paper"
            >
              Uygulamayı Başlat
            </Link>
          </div>
        </div>
      </header>

      {/* 3. HERO SECTION */}
      <section className="relative grain overflow-hidden border-b-2 border-ink bg-paper">
        <div className="max-w-[1400px] mx-auto px-5 md:px-8 pt-12 md:pt-16">
          
          {/* Meta Row */}
          <div className="flex flex-wrap justify-between items-center font-mono text-[11px] uppercase tracking-[0.18em] text-ink/80 pb-8 md:pb-12 gap-3">
            <div className="flex items-center gap-1.5 font-bold">
              <span className="text-signal text-base leading-none">✳</span>
              <span>TÜRKTİCARET.NET / STAJ PROJESİ</span>
            </div>
            <div className="hidden md:block text-ink/60 font-medium">
              KURUMSAL KOD ADI: TT² · TOKEN TRACK
            </div>
            <div className="flex items-center gap-2 font-bold">
              <span className="inline-block w-2 h-2 rounded-full bg-signal animate-pulse" />
              <span>GERÇEK ZAMANLI AKIŞ & TOKEN MALİYETİ</span>
            </div>
          </div>

          {/* Giant Wordmark Headline */}
          <h1 className="font-grotesk font-black tighten-xl uppercase leading-[0.84] text-ink text-[16vw] md:text-[13vw] lg:text-[10.8vw] select-none">
            TOKEN <br />
            <span className="text-signal">TRACK</span> <br />
            BY TT².
          </h1>
        </div>

        {/* Hero Lower Band (12-col split) */}
        <div className="max-w-[1400px] mx-auto px-5 md:px-8 grid grid-cols-1 lg:grid-cols-12 gap-0 mt-8 md:mt-12 border-t-2 border-ink">
          
          {/* Left Column (7-col) */}
          <div className="lg:col-span-7 lg:border-r-2 border-ink py-8 md:py-10 lg:pr-10 flex flex-col justify-between">
            <div>
              <div className="text-signal font-mono text-[10px] font-bold uppercase tracking-[0.22em] mb-4">
                [ TÜRKTİCARET.NET STAJ PROJESİ ]
              </div>
              <p className="font-grotesk text-2xl lg:text-[2.2rem] leading-[1.15] tighten font-semibold max-w-2xl text-ink">
                TürkTicaret.net bünyesinde geliştirilen Token Track (kod adı: TT²); Google Gemini 3.8 Flash modeliyle anlık yanıt akışı sağlayan, harcanan token sayısını ve kur bazlı mikro maliyeti canlı olarak hesaplayan sistemdir.
              </p>
            </div>

            {/* CTA Row */}
            <div className="flex flex-wrap items-center gap-3 mt-8 font-mono text-[12px] uppercase tracking-widest">
              <Link
                href="/app"
                className="inline-flex items-center gap-2 bg-ink text-paper px-6 py-3.5 border-2 border-ink font-bold transition-all duration-150 hover:bg-signal hover:border-signal hover:text-paper"
              >
                <span>Token Track&apos;i Başlat</span>
                <ArrowUpRight className="w-4 h-4" />
              </Link>
              <a
                href="#features"
                className="inline-flex items-center gap-2 bg-transparent text-ink px-6 py-3.5 border-2 border-ink font-bold transition-all duration-150 hover:bg-ink hover:text-paper"
              >
                <span>Özellikleri Gör</span>
              </a>
            </div>
          </div>

          {/* Right Column (5-col) */}
          <div className="lg:col-span-5 py-8 md:py-10 lg:pl-10 flex flex-col justify-between gap-6">
            
            {/* Canvas Block (CSS Gradient Artwork + Grain) */}
            <div 
              className="relative bg-ink border-2 border-ink hardshadow-red aspect-[4/3] overflow-hidden flex flex-col justify-between p-5"
              style={{
                backgroundImage: `
                  radial-gradient(120% 90% at 80% 10%, #e5341f 0%, transparent 45%),
                  repeating-linear-gradient(135deg, #141414 0px, #141414 14px, #1d1d1d 14px, #1d1d1d 28px)
                `
              }}
            >
              <div className="flex justify-between items-start z-10">
                <span className="font-mono text-[10px] uppercase tracking-widest text-paper/80 font-bold">
                  FIG.01 / TT²-ENGINE
                </span>
                <span className="w-2.5 h-2.5 rounded-full bg-signal animate-ping" />
              </div>

              {/* Graphic Overlay Visual */}
              <div className="z-10 my-auto">
                <div className="border border-paper/20 bg-ink/80 p-3.5 backdrop-blur-sm">
                  <div className="flex items-center justify-between font-mono text-[9px] text-paper/60 uppercase tracking-widest mb-1.5">
                    <span>TÜRKTİCARET.NET / TOKEN TRACK</span>
                    <span className="text-signal font-bold">ACTIVE</span>
                  </div>
                  <div className="font-mono text-xs text-paper flex items-center gap-2">
                    <span className="text-signal font-bold">&gt;</span>
                    <span className="truncate">gemini-3.8-flash: akış başlatıldı [TT²]</span>
                  </div>
                  <div className="w-full bg-paper/10 h-1 mt-2.5 overflow-hidden">
                    <div className="bg-signal h-full w-4/5 animate-pulse" />
                  </div>
                </div>
              </div>

              <div className="flex justify-end z-10">
                <span className="font-mono text-[10px] uppercase font-bold text-ink bg-signal px-2 py-1 border border-ink/40">
                  CANLI ÖNİZLEME
                </span>
              </div>
            </div>

            {/* Stat Pair below */}
            <div className="grid grid-cols-2 gap-0 border-2 border-ink font-mono bg-paper">
              <div className="p-4 border-r-2 border-ink">
                <div className="text-2xl md:text-3xl font-extrabold tighten text-ink font-grotesk">
                  TT²
                </div>
                <div className="text-[10px] uppercase tracking-widest text-ink/60 mt-1 font-bold">
                  Token Track
                </div>
              </div>
              <div className="p-4">
                <div className="text-2xl md:text-3xl font-extrabold tighten text-signal font-grotesk">
                  TRY & USD
                </div>
                <div className="text-[10px] uppercase tracking-widest text-ink/60 mt-1 font-bold">
                  Anlık Maliyet
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. CLIENT / NETWORK MARQUEE STRIP */}
      <section className="bg-ink text-paper border-b-2 border-ink overflow-hidden py-3.5 md:py-4">
        <div className="marquee-track">
          
          {/* First Group */}
          <div className="flex items-center shrink-0">
            {[
              'TOKEN TRACK',
              'TÜRKTİCARET.NET',
              'KOD ADI: TT²',
              'GEMINI 3.8 FLASH',
              'STREAMING CHAT',
              'MICRO-COST ENGINE',
              'FIREBASE AUTH',
              'NEXT.JS 14'
            ].map((item, idx) => (
              <div key={`m1-${idx}`} className="px-7 flex items-center gap-3 font-mono text-sm md:text-base uppercase tracking-[0.14em] font-bold">
                <span>{item}</span>
                <span className="text-signal">✳</span>
              </div>
            ))}
          </div>

          {/* Second Duplicate Group for Seamless Loop */}
          <div className="flex items-center shrink-0" aria-hidden="true">
            {[
              'TOKEN TRACK',
              'TÜRKTİCARET.NET',
              'KOD ADI: TT²',
              'GEMINI 3.8 FLASH',
              'STREAMING CHAT',
              'MICRO-COST ENGINE',
              'FIREBASE AUTH',
              'NEXT.JS 14'
            ].map((item, idx) => (
              <div key={`m2-${idx}`} className="px-7 flex items-center gap-3 font-mono text-sm md:text-base uppercase tracking-[0.14em] font-bold">
                <span>{item}</span>
                <span className="text-signal">✳</span>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 5. SELECTED WORK / MODULES GRID */}
      <section id="features" className="border-b-2 border-ink bg-paper">
        <div className="max-w-[1400px] mx-auto px-5 md:px-8 py-12 md:py-16">
          
          {/* Header */}
          <div className="flex flex-wrap items-end justify-between mb-8 md:mb-12 gap-4">
            <h2 className="font-grotesk font-black uppercase tighten text-4xl md:text-6xl leading-none text-ink">
              Token Track Modülleri
            </h2>
            <div className="max-w-xs font-mono text-[11px] uppercase tracking-[0.18em] text-ink/60 font-bold">
              TÜRKTİCARET.NET STAJ KAPSAMINDA GELİŞTİRİLEN MODÜLLER
            </div>
          </div>

          {/* Grid of 3 Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            
            {/* Card 1 (Wide 16:7, md:col-span-2) */}
            <article className="group md:col-span-2">
              <div 
                className="relative border-2 border-ink hardshadow overflow-hidden aspect-[16/7] bg-ink grain p-6 md:p-10 flex flex-col justify-between"
                style={{
                  backgroundImage: `
                    radial-gradient(90% 120% at 15% 90%, #e5341f, transparent 50%),
                    linear-gradient(120deg, #101010, #222)
                  `
                }}
              >
                {/* Top Row */}
                <div className="flex items-center justify-between z-10">
                  <span className="font-mono text-sm font-bold text-paper/80 uppercase tracking-widest">
                    001
                  </span>
                  <span className="text-ink bg-paper border-2 border-paper px-2.5 py-1 font-mono text-[10px] uppercase font-bold tracking-widest">
                    ÖNE ÇIKAN MODÜL
                  </span>
                </div>

                {/* Title & Sub */}
                <div className="z-10 mt-auto">
                  <h3 className="font-grotesk font-black text-4xl md:text-6xl tighten uppercase text-paper mb-2">
                    Token Track Streaming Core
                  </h3>
                  <p className="font-mono text-xs md:text-sm text-paper/80 uppercase tracking-wider font-medium">
                    TürkTicaret.net Altyapısıyla SSE Yanıt Akışı & Gecikmesiz İletim
                  </p>
                </div>
              </div>

              {/* Below Frame Meta */}
              <div className="flex justify-between items-center font-mono text-[11px] uppercase tracking-widest text-ink/70 mt-3 font-bold">
                <span>Next.js App Router · SSE Protocol · Google GenAI SDK</span>
                <span className="text-ink/[0.68]">2026</span>
              </div>
            </article>

            {/* Card 2 (4:3, Cross-hatch + Inset Red Panel) */}
            <article className="group">
              <div 
                className="relative border-2 border-ink hardshadow-sm overflow-hidden aspect-[4/3] bg-paper p-6 flex flex-col justify-between"
                style={{
                  backgroundImage: `
                    repeating-linear-gradient(0deg, #0a0a0a 0, #0a0a0a 1px, transparent 1px, transparent 22px),
                    repeating-linear-gradient(90deg, #0a0a0a 0, #0a0a0a 1px, transparent 1px, transparent 22px)
                  `,
                  backgroundSize: '22px 22px'
                }}
              >
                <div className="flex items-center justify-between z-10">
                  <span className="font-mono text-sm font-bold text-ink uppercase tracking-widest bg-paper px-1.5 border border-ink">
                    002
                  </span>
                </div>

                {/* Inset Red Panel */}
                <div className="inset-6 border-2 border-ink bg-signal/90 flex flex-col items-center justify-center p-6 text-center my-auto z-10 shadow-inner">
                  <span className="font-grotesk font-black text-3xl md:text-4xl uppercase text-ink tighten">
                    TT² Micro-Cost
                  </span>
                  <span className="font-mono text-[10px] uppercase font-bold text-ink mt-2 tracking-widest bg-paper px-2 py-0.5 border border-ink">
                    TOKEN BAŞINA USD & KURUŞ HESABI
                  </span>
                </div>

                <div className="z-10">
                  <span className="font-mono text-[10px] uppercase font-bold text-ink bg-paper px-1.5 border border-ink">
                    FİYAT HESAPLAYICI
                  </span>
                </div>
              </div>

              {/* Below Frame Meta */}
              <div className="flex justify-between items-center font-mono text-[11px] uppercase tracking-widest text-ink/70 mt-3 font-bold">
                <span>Hassas Kuruş Takibi / Güncel Döviz Kuru</span>
                <span className="text-ink/[0.68]">2026</span>
              </div>
            </article>

            {/* Card 3 (4:3, Conic Gradient + Grain) */}
            <article className="group">
              <div 
                className="relative border-2 border-ink hardshadow-sm overflow-hidden aspect-[4/3] bg-ink grain p-6 flex flex-col justify-between"
                style={{
                  backgroundImage: `conic-gradient(from 200deg at 70% 30%, #e5341f, #0a0a0a 40%, #1a1a1a 70%, #e5341f)`
                }}
              >
                <div className="flex items-center justify-between z-10">
                  <span className="font-mono text-sm font-bold text-paper/90 uppercase tracking-widest">
                    003
                  </span>
                  <span className="text-paper bg-ink/70 border border-paper/30 px-2 py-0.5 font-mono text-[10px] uppercase font-bold tracking-widest">
                    FIREBASE
                  </span>
                </div>

                <div className="z-10 mt-auto">
                  <h3 className="font-grotesk font-black text-3xl md:text-4xl tighten uppercase text-paper mb-1">
                    TT² Oturumları
                  </h3>
                  <p className="font-mono text-[11px] text-paper/80 uppercase tracking-wider font-bold">
                    Kullanıcı Girişi ve Sohbet Kaydı
                  </p>
                </div>
              </div>

              {/* Below Frame Meta */}
              <div className="flex justify-between items-center font-mono text-[11px] uppercase tracking-widest text-ink/70 mt-3 font-bold">
                <span>Firebase Authentication · Cloud Firestore</span>
                <span className="text-ink/[0.68]">2026</span>
              </div>
            </article>

          </div>
        </div>
      </section>

      {/* 6. STATS STRIP (4-UP WITH 2PX DIVIDERS) */}
      <section className="bg-paper border-b-2 border-ink">
        <div className="max-w-[1400px] mx-auto px-5 md:px-8 grid grid-cols-2 md:grid-cols-4">
          
          <div className="border-r-2 border-ink py-8 md:py-10 pr-4 md:pr-6">
            <div className="font-grotesk font-black tighten text-3xl md:text-5xl text-ink leading-none">
              TT²
            </div>
            <div className="font-mono text-[10px] md:text-[11px] uppercase tracking-widest text-ink/60 mt-2 font-bold">
              TürkTicaret.net Kod Adı
            </div>
          </div>

          <div className="md:border-r-2 border-ink py-8 md:py-10 px-0 md:px-6 pl-4 md:pl-6">
            <div className="font-grotesk font-black tighten text-3xl md:text-5xl text-signal leading-none">
              3.8 Flash
            </div>
            <div className="font-mono text-[10px] md:text-[11px] uppercase tracking-widest text-ink/60 mt-2 font-bold">
              Google Gemini Modeli
            </div>
          </div>

          <div className="border-r-2 border-t-2 md:border-t-0 border-ink py-8 md:py-10 pr-4 md:px-6">
            <div className="font-grotesk font-black tighten text-3xl md:text-5xl text-ink leading-none">
              TRY / USD
            </div>
            <div className="font-mono text-[10px] md:text-[11px] uppercase tracking-widest text-ink/60 mt-2 font-bold">
              Mikro Kuruş Maliyet Hesabı
            </div>
          </div>

          <div className="border-t-2 md:border-t-0 border-ink py-8 md:py-10 pl-4 md:pl-6">
            <div className="font-grotesk font-black tighten text-3xl md:text-5xl text-ink leading-none">
              100<span className="text-signal">%</span>
            </div>
            <div className="font-mono text-[10px] md:text-[11px] uppercase tracking-widest text-ink/60 mt-2 font-bold">
              Token Track Staj Projesi
            </div>
          </div>

        </div>
      </section>

      {/* 7. SERVICES / WHAT IT DOES LIST (NUMBERED 01-04, INVERT-ON-HOVER) */}
      <section id="details" className="border-b-2 border-ink bg-paper">
        <div className="max-w-[1400px] mx-auto px-5 md:px-8 py-12 md:py-16">
          
          {/* Header */}
          <div className="flex flex-wrap items-end justify-between mb-6 md:mb-8 gap-4">
            <h2 className="font-grotesk font-black uppercase tighten text-4xl md:text-6xl text-ink">
              Neler Yapabilir?
            </h2>
            <div className="font-mono text-[11px] uppercase tracking-widest text-ink/60 font-bold">
              İNDEKS / 01—04
            </div>
          </div>

          {/* List of Rows */}
          <ul className="font-grotesk border-t-2 border-ink">
            
            {/* Row 01 */}
            <li className="group border-b-2 border-ink cursor-default">
              <div className="grid grid-cols-12 items-start gap-4 py-6 md:py-8 px-2 md:px-4 transition-colors group-hover:bg-ink group-hover:text-paper">
                <div className="col-span-12 md:col-span-1 font-mono text-[12px] uppercase tracking-widest pt-2 text-ink/[0.68] group-hover:text-paper/70 font-bold">
                  01
                </div>
                <div className="col-span-12 md:col-span-6 font-black uppercase text-3xl md:text-5xl tighten text-ink group-hover:text-paper">
                  Gerçek Zamanlı Token Akışı
                </div>
                <div className="col-span-12 md:col-span-5 font-mono text-[12px] md:text-[13px] leading-relaxed text-ink/70 group-hover:text-paper/80 font-medium pt-1">
                  Token Track, Gemini 3.8 Flash modeliyle yanıtlarken Server-Sent Events üzerinden kelime kelime akış sunar. Bekleme olmadan kesintisiz çıktı sağlar.
                </div>
              </div>
            </li>

            {/* Row 02 */}
            <li className="group border-b-2 border-ink cursor-default">
              <div className="grid grid-cols-12 items-start gap-4 py-6 md:py-8 px-2 md:px-4 transition-colors group-hover:bg-ink group-hover:text-paper">
                <div className="col-span-12 md:col-span-1 font-mono text-[12px] uppercase tracking-widest pt-2 text-ink/[0.68] group-hover:text-paper/70 font-bold">
                  02
                </div>
                <div className="col-span-12 md:col-span-6 font-black uppercase text-3xl md:text-5xl tighten text-ink group-hover:text-paper">
                  Mikro Maliyet <span className="text-signal">Hesaplama</span>
                </div>
                <div className="col-span-12 md:col-span-5 font-mono text-[12px] md:text-[13px] leading-relaxed text-ink/70 group-hover:text-paper/80 font-medium pt-1">
                  TürkTicaret.net projesi kapsamında her prompt ve yanıttaki token harcamasını anlık kurla kuruş düzeyinde hesaplar ve şeffafça sunar.
                </div>
              </div>
            </li>

            {/* Row 03 */}
            <li className="group border-b-2 border-ink cursor-default">
              <div className="grid grid-cols-12 items-start gap-4 py-6 md:py-8 px-2 md:px-4 transition-colors group-hover:bg-ink group-hover:text-paper">
                <div className="col-span-12 md:col-span-1 font-mono text-[12px] uppercase tracking-widest pt-2 text-ink/[0.68] group-hover:text-paper/70 font-bold">
                  03
                </div>
                <div className="col-span-12 md:col-span-6 font-black uppercase text-3xl md:text-5xl tighten text-ink group-hover:text-paper">
                  TT² Model & Parametre Ayarı
                </div>
                <div className="col-span-12 md:col-span-5 font-mono text-[12px] md:text-[13px] leading-relaxed text-ink/70 group-hover:text-paper/80 font-medium pt-1">
                  Temperature, Top-P, Max Output Tokens ve System Instruction değerlerini Token Track modal arayüzünden dilediğiniz gibi yapılandırabilirsiniz.
                </div>
              </div>
            </li>

            {/* Row 04 */}
            <li className="group border-b-2 border-ink cursor-default">
              <div className="grid grid-cols-12 items-start gap-4 py-6 md:py-8 px-2 md:px-4 transition-colors group-hover:bg-ink group-hover:text-paper">
                <div className="col-span-12 md:col-span-1 font-mono text-[12px] uppercase tracking-widest pt-2 text-ink/[0.68] group-hover:text-paper/70 font-bold">
                  04
                </div>
                <div className="col-span-12 md:col-span-6 font-black uppercase text-3xl md:text-5xl tighten text-ink group-hover:text-paper">
                  Oturum & Geçmiş Yönetimi
                </div>
                <div className="col-span-12 md:col-span-5 font-mono text-[12px] md:text-[13px] leading-relaxed text-ink/70 group-hover:text-paper/80 font-medium pt-1">
                  Firebase ile kullanıcı girişi yapabilir, Token Track geçmiş sohbetlerinizi listeleyebilir, yeni oturum açabilir veya silebilirsiniz.
                </div>
              </div>
            </li>

          </ul>
        </div>
      </section>

      {/* 8. METHOD (DARK PHASE CARDS) */}
      <section id="method" className="bg-ink text-paper border-b-2 border-ink grain relative overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-5 md:px-8 py-12 md:py-16 relative z-10">
          
          {/* Header */}
          <div className="flex flex-wrap items-end justify-between mb-8 md:mb-12 gap-4">
            <h2 className="font-grotesk font-black uppercase tighten text-4xl md:text-6xl text-paper">
              Token Track <br className="hidden md:block" />Çalışma Mantığı.
            </h2>
            <div className="max-w-xs font-mono text-[11px] uppercase tracking-[0.18em] text-paper/50 font-bold">
              TürkTicaret.net staj projesinin uçtan uca akış mimarisi.
            </div>
          </div>

          {/* Grid of 4 Phase Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5 md:gap-6">
            
            {/* Card 1 (Red Hard Shadow) */}
            <div 
              className="border-2 border-paper/30 hover:border-signal transition-colors p-5 bg-ink"
              style={{ boxShadow: '6px 6px 0 0 #e5341f' }}
            >
              <div className="font-mono text-signal text-sm font-bold mb-6">
                / 01
              </div>
              <h3 className="font-grotesk font-extrabold uppercase text-xl tighten text-paper mb-3">
                Kullanıcı İstemi
              </h3>
              <p className="font-mono text-[12px] leading-relaxed text-paper/70 font-medium">
                Mesaj ve parametreler Token Track Next.js API rotasına güvenli bir şekilde iletilir.
              </p>
            </div>

            {/* Card 2 */}
            <div className="border-2 border-paper/30 hover:border-signal transition-colors p-5 bg-ink">
              <div className="font-mono text-signal text-sm font-bold mb-6">
                / 02
              </div>
              <h3 className="font-grotesk font-extrabold uppercase text-xl tighten text-paper mb-3">
                Gemini Akışı
              </h3>
              <p className="font-mono text-[12px] leading-relaxed text-paper/70 font-medium">
                Google GenAI SDK ile streamGenerateContent çağrısı yapılarak yanıt parça parça alınır.
              </p>
            </div>

            {/* Card 3 */}
            <div className="border-2 border-paper/30 hover:border-signal transition-colors p-5 bg-ink">
              <div className="font-mono text-signal text-sm font-bold mb-6">
                / 03
              </div>
              <h3 className="font-grotesk font-extrabold uppercase text-xl tighten text-paper mb-3">
                TT² Maliyet Analizi
              </h3>
              <p className="font-mono text-[12px] leading-relaxed text-paper/70 font-medium">
                Kullanılan girdi/çıktı token sayıları baz alınarak anlık USD ve TL maliyeti çıkarılır.
              </p>
            </div>

            {/* Card 4 */}
            <div className="border-2 border-paper/30 hover:border-signal transition-colors p-5 bg-ink">
              <div className="font-mono text-signal text-sm font-bold mb-6">
                / 04
              </div>
              <h3 className="font-grotesk font-extrabold uppercase text-xl tighten text-paper mb-3">
                Arayüze İletim
              </h3>
              <p className="font-mono text-[12px] leading-relaxed text-paper/70 font-medium">
                Dönen metin ekranda gerçek zamanlı yazdırılır ve Firestore veritabanına kaydedilir.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 9. CONTACT / ABOUT PROJECT SECTION (FULL RED #E5341F) */}
      <section id="project" className="bg-signal text-ink border-b-2 border-ink">
        <div className="max-w-[1400px] mx-auto px-5 md:px-8 py-14 md:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            {/* Left 7-Col */}
            <div className="lg:col-span-7 flex flex-col justify-between">
              <div>
                <div className="font-mono text-[11px] uppercase tracking-[0.22em] mb-5 font-black text-ink">
                  [ TÜRKTİCARET.NET STAJ PROJESİ ]
                </div>
                <h2 className="font-grotesk font-black uppercase tighten-xl leading-[0.86] text-[13vw] md:text-[9vw] lg:text-[6.5vw] text-ink select-none">
                  TOKEN TRACK&apos;İ <br />
                  HEMEN DENEYİN.
                </h2>
              </div>

              <div className="mt-8 md:mt-12">
                <Link
                  href="/app"
                  className="inline-flex items-center gap-3 font-grotesk font-black text-2xl md:text-4xl tighten link-underline text-ink"
                >
                  <span>Token Track Uygulamasını Aç</span>
                  <ArrowUpRight className="w-8 h-8 md:w-10 md:h-10 stroke-[2.5]" />
                </Link>
              </div>
            </div>

            {/* Right 5-Col (2x2 Paper Info Grid) */}
            <div className="lg:col-span-5 h-fit self-end">
              <div className="grid grid-cols-2 gap-0 border-2 border-ink font-mono bg-paper">
                
                {/* Cell 1 */}
                <div className="p-5 border-r-2 border-b-2 border-ink">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-ink/[0.68] mb-1">
                    PROJE ADI
                  </div>
                  <div className="text-sm font-bold leading-relaxed text-ink">
                    Token Track
                  </div>
                </div>

                {/* Cell 2 */}
                <div className="p-5 border-b-2 border-ink">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-ink/[0.68] mb-1">
                    KOD ADI
                  </div>
                  <div className="text-sm font-bold leading-relaxed text-ink">
                    TT² (TürkTicaret.net)
                  </div>
                </div>

                {/* Cell 3 */}
                <div className="p-5 border-r-2 border-ink">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-ink/[0.68] mb-1">
                    MODEL
                  </div>
                  <div className="text-sm font-bold leading-relaxed text-ink">
                    Google Gemini 3.8 Flash
                  </div>
                </div>

                {/* Cell 4 */}
                <div className="p-5">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-ink/[0.68] mb-1">
                    DURUM
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-signal animate-pulse" />
                    <span className="text-sm font-bold leading-relaxed text-ink">
                      Canlı & Çalışır Durumda
                    </span>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 10. FOOTER (DARK BG-INK) */}
      <footer className="bg-ink text-paper py-10 md:py-12">
        <div className="max-w-[1400px] mx-auto px-5 md:px-8">
          
          {/* Top Row */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="font-grotesk font-black uppercase tighten text-4xl md:text-6xl text-paper">
                TOKEN TRACK<span className="text-signal">®</span>
              </div>
              <div className="font-mono text-xs text-paper/60 uppercase tracking-widest mt-1 font-bold">
                KOD ADI: TT² · TÜRKTİCARET.NET
              </div>
            </div>

            <nav className="flex flex-wrap gap-x-7 gap-y-2 font-mono text-[12px] font-bold uppercase tracking-widest text-paper">
              <a href="#features" className="link-underline-paper pb-0.5">Özellikler</a>
              <a href="#details" className="link-underline-paper pb-0.5">Yetenekler</a>
              <a href="#method" className="link-underline-paper pb-0.5">Çalışma Mantığı</a>
              <Link href="/app" className="link-underline-paper pb-0.5">Uygulama</Link>
            </nav>
          </div>

          {/* Bottom Legal Row */}
          <div className="mt-10 pt-6 border-t-2 border-paper/20 flex flex-col md:flex-row justify-between font-mono text-[11px] uppercase tracking-widest text-paper/55 gap-4">
            <div>
              © 2026 TOKEN TRACK (TT²) — TÜRKTİCARET.NET STAJ PROJESİ
            </div>
            <div className="text-paper/80 font-bold">
              NEO-BRUTALIST SYSTEM
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}
