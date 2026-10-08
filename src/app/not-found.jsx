import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#080d1a] text-slate-100 p-4">
      <h2 className="text-2xl font-bold mb-2">Sayfa Bulunamadı (404)</h2>
      <p className="text-slate-400 mb-4 text-sm">Aradığınız sayfa mevcut değil veya taşınmış olabilir.</p>
      <Link 
        href="/" 
        className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs transition-colors"
      >
        Ana Sayfaya Dön
      </Link>
    </div>
  );
}
