'use client';

import React, { useState, useEffect } from 'react';
import { RotateCw, Coins, Calculator, Layers, TrendingUp, Wallet, ShieldCheck } from 'lucide-react';
import { fetchCostStats, estimateTokenCost } from '@/services/api';
import { useAuth } from '@/context/AuthContext';

export default function CostDashboard({ exchangeRate = 35.50 }) {
  const { token, user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Calculator State
  const [calcModel, setCalcModel] = useState('gemini-3.7-flash');
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

  const userQuota = stats?.user || {
    balanceLimit: user?.balanceLimit || 5.00,
    totalSpentUSD: user?.totalSpentUSD || summary.totalCostUSD || 0.00,
    remainingBudgetUSD: Math.max(0, (user?.balanceLimit || 5.00) - (user?.totalSpentUSD || summary.totalCostUSD || 0))
  };

  const byModel = stats?.byModel || {};
  const dailyTrend = stats?.dailyTrend || [];

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 max-w-5xl mx-auto font-mono text-ink bg-paper">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b-2 border-ink">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-signal mb-1">
            [ TELEMETRİ, KOTA & RAPORLAMA ]
          </div>
          <h2 className="text-2xl md:text-3xl font-black font-grotesk uppercase tighten text-ink">
            Maliyet & Token Paneli
          </h2>
          <p className="text-xs text-ink/70 mt-0.5">
            TürkTicaret.net Token Track projesi kapsamında harcanan mikro maliyetler ve kullanıcı bütçe takibi
          </p>
        </div>

        <button
          onClick={() => loadStats(true)}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 border-2 border-ink bg-paper hover:bg-ink hover:text-paper text-xs font-bold uppercase tracking-wider transition-colors"
        >
          <RotateCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Yenile</span>
        </button>
      </div>

      {/* User Quota Banner */}
      <div className="p-4 bg-smoke border-2 border-ink flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-signal text-paper border-2 border-ink flex items-center justify-center font-bold">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-black uppercase text-ink font-grotesk">Kullanıcı Bütçe & Kota Durumu</div>
            <div className="text-[11px] text-ink/70">
              Tanımlı Limit: <strong>${userQuota.balanceLimit.toFixed(2)}</strong> | Kalan Bakiye: <strong className="text-emerald-700">${userQuota.remainingBudgetUSD.toFixed(4)}</strong>
            </div>
          </div>
        </div>
        <div className="w-full md:w-64 space-y-1">
          <div className="flex justify-between text-[10px] font-bold uppercase">
            <span>Kullanım:</span>
            <span>%{Math.min(100, Math.round((userQuota.totalSpentUSD / userQuota.balanceLimit) * 100)) || 0}</span>
          </div>
          <div className="w-full h-2.5 bg-paper border border-ink overflow-hidden">
            <div 
              className="h-full bg-signal transition-all"
              style={{ width: `${Math.min(100, (userQuota.totalSpentUSD / userQuota.balanceLimit) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Total Cost USD */}
        <div className="bg-paper border-2 border-ink hardshadow-sm p-4 flex flex-col justify-between">
          <div className="text-[10px] font-bold uppercase tracking-widest text-ink/60 mb-1">Toplam Harcama</div>
          <div className="text-2xl md:text-3xl font-black text-signal font-grotesk tighten">
            ${summary.totalCostUSD.toFixed(4)}
          </div>
          <div className="text-xs font-bold text-ink mt-1">
            ≈ ₺{summary.totalCostTRY.toFixed(2)}
          </div>
        </div>

        {/* Total Tokens */}
        <div className="bg-paper border-2 border-ink hardshadow-sm p-4 flex flex-col justify-between">
          <div className="text-[10px] font-bold uppercase tracking-widest text-ink/60 mb-1">Toplam Token</div>
          <div className="text-2xl md:text-3xl font-black text-ink font-grotesk tighten">
            {summary.totalTokens.toLocaleString()}
          </div>
          <div className="text-[10px] font-bold text-ink/60 mt-1 uppercase">
            Girdi: {summary.totalPromptTokens.toLocaleString()} | Çıktı: {summary.totalCandidateTokens.toLocaleString()}
          </div>
        </div>

        {/* Total Requests */}
        <div className="bg-paper border-2 border-ink hardshadow-sm p-4 flex flex-col justify-between">
          <div className="text-[10px] font-bold uppercase tracking-widest text-ink/60 mb-1">Toplam İstek</div>
          <div className="text-2xl md:text-3xl font-black text-ink font-grotesk tighten">
            {summary.totalRequests}
          </div>
          <div className="text-[10px] font-bold text-ink/60 mt-1 uppercase">
            İşlenen Sorgu Sayısı
          </div>
        </div>

        {/* Avg Cost per Request */}
        <div className="bg-paper border-2 border-ink hardshadow-sm p-4 flex flex-col justify-between">
          <div className="text-[10px] font-bold uppercase tracking-widest text-ink/60 mb-1">Ortalama / İstek</div>
          <div className="text-2xl md:text-3xl font-black text-ink font-grotesk tighten">
            ${summary.avgCostPerRequestUSD.toFixed(5)}
          </div>
          <div className="text-xs font-bold text-ink mt-1">
            ≈ ₺{(summary.avgCostPerRequestUSD * exchangeRate).toFixed(3)}
          </div>
        </div>
      </div>

      {/* Two Column Layout: Model Breakdown & Calculator */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Model Breakdown */}
        <div className="bg-paper border-2 border-ink hardshadow-sm p-5">
          <h3 className="text-xs font-black uppercase tracking-wider text-ink mb-4 pb-2 border-b-2 border-ink flex items-center gap-2 font-grotesk">
            <Layers className="w-4 h-4 text-signal" />
            <span>Model Bazlı Tüketim Dağılımı</span>
          </h3>

          {Object.keys(byModel).length === 0 ? (
            <div className="text-xs text-ink/50 text-center py-8 font-bold uppercase">
              Henüz kullanım kaydı bulunmuyor.
            </div>
          ) : (
            <div className="space-y-3">
              {Object.entries(byModel).map(([modelName, data]) => {
                const percent = summary.totalTokens > 0 
                  ? Math.round((data.totalTokens / summary.totalTokens) * 100) 
                  : 0;
                
                return (
                  <div key={modelName} className="p-3 bg-smoke border-2 border-ink">
                    <div className="flex items-center justify-between text-xs mb-1 font-bold">
                      <span className="uppercase">{modelName.replace('gemini-', '')}</span>
                      <span className="font-mono">{data.totalTokens.toLocaleString()} token ({percent}%)</span>
                    </div>

                    <div className="w-full h-2 bg-paper border border-ink overflow-hidden my-2">
                      <div 
                        className="h-full bg-signal" 
                        style={{ width: `${percent}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-ink/70 font-bold font-mono">
                      <span>{data.count} istek</span>
                      <span className="text-ink">${data.costUSD.toFixed(4)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Cost Calculator */}
        <div className="bg-paper border-2 border-ink hardshadow-sm p-5">
          <h3 className="text-xs font-black uppercase tracking-wider text-ink mb-4 pb-2 border-b-2 border-ink flex items-center gap-2 font-grotesk">
            <Calculator className="w-4 h-4 text-signal" />
            <span>Mikro Maliyet Simülatörü</span>
          </h3>

          <div className="space-y-3.5 text-xs">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-ink/70 block mb-1">Model:</label>
              <select
                value={calcModel}
                onChange={(e) => setCalcModel(e.target.value)}
                className="w-full bg-paper border-2 border-ink px-3 py-2 text-ink font-mono font-bold outline-none cursor-pointer"
              >
                <option value="gemini-3.7-flash">Gemini 3.7 Flash ($0.10 / $0.40)</option>
                <option value="gemini-3.8-flash">Gemini 3.8 Flash ($0.10 / $0.40)</option>
                <option value="gemini-3.5-flash">Gemini 3.5 Flash ($0.08 / $0.30)</option>
                <option value="gemini-flash-lite-latest">Gemini Flash Lite ($0.05 / $0.20)</option>
              </select>
            </div>

            <div className="p-2.5 bg-smoke border border-ink">
              <div className="flex justify-between text-ink mb-1 font-bold">
                <span className="text-[10px] uppercase">Girdi Tokenı (Input):</span>
                <span className="font-mono">{calcPromptTokens.toLocaleString()} token</span>
              </div>
              <input
                type="range"
                min="100"
                max="50000"
                step="500"
                value={calcPromptTokens}
                onChange={(e) => setCalcPromptTokens(Number(e.target.value))}
                className="w-full accent-signal"
              />
            </div>

            <div className="p-2.5 bg-smoke border border-ink">
              <div className="flex justify-between text-ink mb-1 font-bold">
                <span className="text-[10px] uppercase">Çıktı Tokenı (Output):</span>
                <span className="font-mono">{calcCandidateTokens.toLocaleString()} token</span>
              </div>
              <input
                type="range"
                min="50"
                max="8192"
                step="100"
                value={calcCandidateTokens}
                onChange={(e) => setCalcCandidateTokens(Number(e.target.value))}
                className="w-full accent-signal"
              />
            </div>

            {calcResult && (
              <div className="mt-4 p-4 bg-ink text-paper border-2 border-ink flex items-center justify-between font-mono font-bold">
                <div>
                  <span className="text-paper/60 uppercase text-[10px] block">Hesaplanan Maliyet:</span>
                  <span className="text-xs text-paper">Kur: ₺{exchangeRate} / USD</span>
                </div>
                <div className="text-right">
                  <div className="text-signal text-lg font-black font-grotesk">${calcResult.costUSD?.totalCost.toFixed(5)}</div>
                  <div className="text-paper text-xs">₺{calcResult.costTRY?.totalCost.toFixed(3)}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Daily Usage Trend Table */}
      {dailyTrend.length > 0 && (
        <div className="bg-paper border-2 border-ink hardshadow-sm p-5">
          <h3 className="text-xs font-black uppercase tracking-wider text-ink mb-3 pb-2 border-b-2 border-ink font-grotesk flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-signal" />
            <span>Günlük Kullanım & Maliyet Çizelgesi</span>
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-ink bg-smoke font-mono font-bold text-[11px] uppercase">
                  <th className="py-2.5 px-3">Tarih</th>
                  <th className="py-2.5 px-3">İstek</th>
                  <th className="py-2.5 px-3">Token</th>
                  <th className="py-2.5 px-3 text-right">Maliyet (USD)</th>
                  <th className="py-2.5 px-3 text-right">Maliyet (TRY)</th>
                </tr>
              </thead>
              <tbody className="divide-y border-b-2 border-ink divide-ink/20 font-mono text-xs font-bold">
                {dailyTrend.map((row) => (
                  <tr key={row.date} className="hover:bg-smoke transition-colors">
                    <td className="py-2 px-3">{row.date}</td>
                    <td className="py-2 px-3">{row.requests}</td>
                    <td className="py-2 px-3">{row.tokens.toLocaleString()}</td>
                    <td className="py-2 px-3 text-right text-signal">${row.costUSD.toFixed(4)}</td>
                    <td className="py-2 px-3 text-right text-ink">₺{row.costTRY.toFixed(3)}</td>
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
