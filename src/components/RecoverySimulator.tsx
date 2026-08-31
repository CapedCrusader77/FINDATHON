import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { HardDrive, Zap, Sparkles, Sliders, CheckCircle2, ArrowRight, ShieldCheck, DollarSign, Image as ImageIcon, FileText } from 'lucide-react'
import { DashboardData } from '../types'
import { formatBytes } from '../lib/utils'
import { Card, SectionTitle, Button, Badge } from './ui'

interface RecoverySimulatorProps {
  data: DashboardData
  onApplyPolicy?: (threshold: number) => void
}

export default function RecoverySimulator({ data, onApplyPolicy }: RecoverySimulatorProps) {
  const [threshold, setThreshold] = useState<number>(90)
  const [activePreset, setActivePreset] = useState<'safe' | 'balanced' | 'aggressive'>('balanced')

  // Calculate dynamic projected savings based on slider
  const factor = threshold >= 98 ? 0.35 : threshold >= 92 ? 0.75 : threshold >= 85 ? 1.0 : 1.25
  const simulatedBytes = Math.min(data.scannedSize * 0.4, data.recoverable * factor)
  const simulatedPhotos = Math.round(simulatedBytes / (3.2 * 1024 * 1024))
  const cloudCostSavings = (simulatedBytes / (1024 ** 3) * 0.02).toFixed(2)

  const handlePreset = (preset: 'safe' | 'balanced' | 'aggressive') => {
    setActivePreset(preset)
    if (preset === 'safe') setThreshold(98)
    if (preset === 'balanced') setThreshold(90)
    if (preset === 'aggressive') setThreshold(80)
  }

  return (
    <Card className="p-6 sm:p-7 relative overflow-hidden border border-indigo-500/20 bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-indigo-950/30">
      <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex h-2 w-2 rounded-full bg-indigo-400 animate-ping" />
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-indigo-400">
              Interactive Storage Simulator
            </p>
          </div>
          <h3 className="text-xl font-bold tracking-tight text-white">
            Simulate Your Deduplication ROI
          </h3>
          <p className="mt-1 text-xs text-slate-400 max-w-xl">
            Slide the sensitivity threshold to preview how much storage space you can safely reclaim without manual per-file review.
          </p>
        </div>

        {/* Presets */}
        <div className="flex items-center rounded-xl border border-white/10 bg-slate-950/60 p-1">
          <button
            onClick={() => handlePreset('safe')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              activePreset === 'safe' ? 'bg-indigo-600 text-white shadow-glow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Safe (Exact + 98%)
          </button>
          <button
            onClick={() => handlePreset('balanced')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              activePreset === 'balanced' ? 'bg-indigo-600 text-white shadow-glow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Balanced (90%)
          </button>
          <button
            onClick={() => handlePreset('aggressive')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              activePreset === 'aggressive' ? 'bg-indigo-600 text-white shadow-glow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Deep Clean (80%)
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr] items-center">
        {/* Slider Arena */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-semibold text-slate-300">Similarity Match Confidence Cutoff</span>
              <span className="text-sm font-bold text-indigo-400 font-mono">≥ {threshold}% Similarity</span>
            </div>

            <input
              type="range"
              min="70"
              max="100"
              step="1"
              value={threshold}
              onChange={e => {
                setThreshold(Number(e.target.value))
                setActivePreset(Number(e.target.value) >= 97 ? 'safe' : Number(e.target.value) >= 88 ? 'balanced' : 'aggressive')
              }}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-400 transition-all"
            />

            <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
              <span>70% (Broader variations)</span>
              <span>85% (Balanced)</span>
              <span>100% (Exact Hash Only)</span>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-white/5 bg-slate-950/40 p-3.5">
              <p className="text-[10px] font-medium text-slate-400">Reclaimable Space</p>
              <p className="mt-1 text-lg font-bold text-emerald-400 tracking-tight">
                {formatBytes(simulatedBytes)}
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">Estimated immediate gain</p>
            </div>

            <div className="rounded-xl border border-white/5 bg-slate-950/40 p-3.5">
              <p className="text-[10px] font-medium text-slate-400">Photo Capacity</p>
              <p className="mt-1 text-lg font-bold text-indigo-300 tracking-tight">
                +{simulatedPhotos.toLocaleString()}
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">High-res 24MP photos</p>
            </div>

            <div className="rounded-xl border border-white/5 bg-slate-950/40 p-3.5">
              <p className="text-[10px] font-medium text-slate-400">Cloud Storage Tier</p>
              <p className="mt-1 text-lg font-bold text-amber-300 tracking-tight">
                -${cloudCostSavings}/mo
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">Google / iCloud tier offset</p>
            </div>
          </div>
        </div>

        {/* Visual ROI Display Card */}
        <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-b from-indigo-950/40 to-slate-950/80 p-5 shadow-glow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">
              Simulation Outcome
            </span>
            <Badge tone="green">Non-Destructive</Badge>
          </div>

          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white tracking-tight">
              {formatBytes(simulatedBytes)}
            </span>
            <span className="text-xs text-slate-400">recoverable</span>
          </div>

          <p className="mt-2 text-xs leading-relaxed text-slate-300">
            Applying this threshold marks <strong className="text-indigo-300">{Math.round(data.duplicateFiles * (factor > 1 ? 0.95 : factor))} duplicate files</strong> across <strong className="text-indigo-300">{Math.round(data.duplicateGroups * (factor > 1 ? 0.95 : factor))} groups</strong> for soft quarantine while retaining the highest quality Master copies.
          </p>

          <div className="mt-5 flex items-center gap-3">
            <Button
              variant="default"
              size="sm"
              className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white shadow-glow"
              onClick={() => {
                if (onApplyPolicy) onApplyPolicy(threshold)
                alert(`Applied threshold filter: ${threshold}%. Groups updated for one-click clean.`)
              }}
            >
              <Sparkles size={14} /> Auto-Select Candidates ({threshold}%)
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}
