import React, { useState, useEffect } from 'react';
import { 
  Coins, 
  Cpu, 
  TrendingUp, 
  Activity, 
  Calculator, 
  RotateCw, 
  Layers, 
  ArrowUpRight,
  DollarSign,
  Sparkles
} from 'lucide-react';
import { fetchCostStats, estimateTokenCost } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function CostDashboard({ exchangeRate = 35.50 }) {
  const { token, user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Interactive Calculator State
  const [calcModel, setCalcModel] = useState('gemini-1.5-flash');
  const [calcPromptTokens, setCalcPromptTokens] = useState(5000);
  const [calcCandidateTokens, setCalcCandidateTokens] = useState(1500);
  const [calcResult, setCalcResult] = useState(null);

  const loadStats = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const data = await fetchCostStats(token, user);
      setStats(data);
    } catch (err) {
      console.error('İstatistikler yüklenemedi:', err);
    } finally {
      setLoading(false);
      if (isManual) setRefreshing(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, [token, user]);

  // Recalculate cost when calculator inputs change
  useEffect(() => {
    const calculate = async () => {
      try {
        const res = await estimateTokenCost({
          model: calcModel,
          promptTokens: calcPromptTokens,
          candidateTokens: calcCandidateTokens,
          exchangeRate
        });
        setCalcResult(res);
      } catch (err) {
        console.error('Hesaplama hatası:', err);
      }
    };
    calculate();
  }, [calcModel, calcPromptTokens, calcCandidateTokens, exchangeRate]);

  const summary = stats?.summary || {
    totalRequests: 0,
    totalTokens: 0,
    totalPromptTokens: 0,
    totalCandidateTokens: 0,
    totalCostUSD: 0,
    totalCostTRY: 0,
    avgCostPerRequestUSD: 0
  };

  const byModel = stats?.byModel || {};
  const dailyTrend = stats?.dailyTrend || [];

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Coins className="w-6 h-6 text-amber-400" />
            Maliyet & Token Analiz Paneli
          </h2>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Gemini AI API tüketiminizin ayrıntılı maliyet ve token dökümü
          </p>
        </div>

        <button
          onClick={() => loadStats(true)}
          disabled={refreshing}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl glass-panel hover:bg-slate-800 text-xs text-slate-300 font-medium transition-all"
        >
          <RotateCw className={`w-3.5 h-3.5 text-cyan-400 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Yenile</span>
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Cost USD & TRY */}
        <div className="glass-panel p-5 rounded-2xl border-l-4 border-l-amber-500 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Toplam Harcama</span>
            <DollarSign className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            ${summary.totalCostUSD.toFixed(5)}
          </div>
          <div className="text-xs text-amber-400/90 font-mono mt-1 font-medium">
            ≈ ₺{summary.totalCostTRY.toFixed(3)}
          </div>
        </div>

        {/* Total Tokens */}
        <div className="glass-panel p-5 rounded-2xl border-l-4 border-l-cyan-500 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Toplam Token</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            {summary.totalTokens.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Girdi: {summary.totalPromptTokens.toLocaleString()} | Çıktı: {summary.totalCandidateTokens.toLocaleString()}
          </div>
        </div>

        {/* Total Prompts */}
        <div className="glass-panel p-5 rounded-2xl border-l-4 border-l-blue-500 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Toplam İstek</span>
            <TrendingUp className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            {summary.totalRequests}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Sohbet sorgusu
          </div>
        </div>

        {/* Avg Cost per Request */}
        <div className="glass-panel p-5 rounded-2xl border-l-4 border-l-emerald-500 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Ortalama İstek Maliyeti</span>
            <Layers className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            ${summary.avgCostPerRequestUSD.toFixed(6)}
          </div>
          <div className="text-[11px] text-emerald-400 mt-1">
            ≈ ₺{(summary.avgCostPerRequestUSD * exchangeRate).toFixed(4)} / sorgu
          </div>
        </div>
      </div>

      {/* Two Column Layout: Model Breakdown & Interactive Calculator */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Model Breakdown */}
        <div className="glass-panel p-5 rounded-2xl shadow-xl">
          <h3 className="text-sm font-semibold text-slate-200 mb-4 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            Model Bazında Dağılım
          </h3>

          {Object.keys(byModel).length === 0 ? (
            <div className="text-xs text-slate-500 text-center py-8">
              Henüz kayıtlı bir model kullanımı bulunmuyor.
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(byModel).map(([modelName, data]) => {
                const percent = summary.totalTokens > 0 
                  ? Math.round((data.totalTokens / summary.totalTokens) * 100) 
                  : 0;
                
                return (
                  <div key={modelName} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-semibold text-cyan-300 font-mono">{modelName}</span>
                      <span className="text-slate-400 font-mono">{data.totalTokens.toLocaleString()} token ({percent}%)</span>
                    </div>

                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden mb-2">
                      <div 
                        className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full" 
                        style={{ width: `${percent}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                      <span>{data.count} istek</span>
                      <span className="text-emerald-400 font-medium">${data.costUSD.toFixed(5)} (₺{data.costTRY.toFixed(3)})</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Interactive Cost Calculator */}
        <div className="glass-panel p-5 rounded-2xl shadow-xl border border-cyan-500/20 glow-cyan">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Calculator className="w-4 h-4 text-cyan-400" />
              Canlı Token & Maliyet Simülatörü
            </h3>
            <span className="text-[10px] bg-cyan-950/80 border border-cyan-800 text-cyan-300 px-2 py-0.5 rounded-full font-mono">
              Anlık Hesaplayıcı
            </span>
          </div>

          <div className="space-y-4 text-xs">
            {/* Model Selector */}
            <div>
              <label className="text-slate-400 block mb-1">Model Seçin:</label>
              <select
                value={calcModel}
                onChange={(e) => setCalcModel(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-slate-200 outline-none focus:border-cyan-500"
              >
                <option value="gemini-1.5-flash">Gemini 1.5 Flash (En Ekonomik & Hızlı)</option>
                <option value="gemini-1.5-pro">Gemini 1.5 Pro (Gelişmiş Akıl Yürütme)</option>
                <option value="gemini-2.0-flash">Gemini 2.0 Flash (Yeni Nesil Multimodal)</option>
              </select>
            </div>

            {/* Prompt Tokens Slider */}
            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span>Girdi (Prompt) Tokenı:</span>
                <span className="font-mono text-cyan-300 font-bold">{calcPromptTokens.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min="100"
                max="100000"
                step="500"
                value={calcPromptTokens}
                onChange={(e) => setCalcPromptTokens(Number(e.target.value))}
                className="w-full accent-cyan-400"
              />
            </div>

            {/* Candidate Tokens Slider */}
            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span>Çıktı (Yanıt) Tokenı:</span>
                <span className="font-mono text-blue-300 font-bold">{calcCandidateTokens.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min="50"
                max="8192"
                step="100"
                value={calcCandidateTokens}
                onChange={(e) => setCalcCandidateTokens(Number(e.target.value))}
                className="w-full accent-blue-400"
              />
            </div>

            {/* Result Box */}
            {calcResult && (
              <div className="mt-4 p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Toplam Token:</span>
                  <span className="font-mono text-slate-200 font-bold">
                    {(calcPromptTokens + calcCandidateTokens).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center border-t border-slate-800/80 pt-2">
                  <span className="text-slate-400">Tahmini Maliyet (USD):</span>
                  <span className="font-mono text-emerald-400 text-sm font-bold">
                    ${calcResult.costUSD?.totalCost.toFixed(6)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Tahmini Maliyet (TRY):</span>
                  <span className="font-mono text-amber-400 font-semibold">
                    ₺{calcResult.costTRY?.totalCost.toFixed(4)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Daily Usage Trend Table */}
      {dailyTrend.length > 0 && (
        <div className="glass-panel p-5 rounded-2xl shadow-xl">
          <h3 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            Günlük Kullanım Özeti
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-mono">
                  <th className="py-2.5 px-3">Tarih</th>
                  <th className="py-2.5 px-3">İstek Sayısı</th>
                  <th className="py-2.5 px-3">Token Miktarı</th>
                  <th className="py-2.5 px-3">Maliyet (USD)</th>
                  <th className="py-2.5 px-3">Maliyet (TRY)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50 text-slate-300 font-mono">
                {dailyTrend.map((row) => (
                  <tr key={row.date} className="hover:bg-slate-800/30">
                    <td className="py-2.5 px-3 text-cyan-300">{row.date}</td>
                    <td className="py-2.5 px-3">{row.requests}</td>
                    <td className="py-2.5 px-3">{row.tokens.toLocaleString()}</td>
                    <td className="py-2.5 px-3 text-emerald-400">${row.costUSD.toFixed(5)}</td>
                    <td className="py-2.5 px-3 text-amber-400">₺{row.costTRY.toFixed(3)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
