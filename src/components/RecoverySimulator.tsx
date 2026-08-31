import React, { useState } from 'react'
import { HardDrive, Sparkles, ShieldCheck } from 'lucide-react'
import { DashboardData } from '../types'
import { formatBytes } from '../lib/utils'
import { Card, SectionTitle, Button, Badge } from './ui'
import { useToast } from './Toast'

interface RecoverySimulatorProps {
  data: DashboardData
  onApplyPolicy?: (threshold: number) => void
}

export default function RecoverySimulator({ data, onApplyPolicy }: RecoverySimulatorProps) {
  const { pushToast } = useToast()
  const [threshold, setThreshold] = useState<number>(90)
  const [activePreset, setActivePreset] = useState<'safe' | 'balanced' | 'aggressive'>('balanced')

  // Dynamic projected savings calculation based on slider
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
    <Card className="p-6 bg-[#11141d] border-[#1e2230]">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-[#1e2230]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex h-2 w-2 rounded-full bg-brand-400" />
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-400">
              Interactive Storage Simulator
            </p>
          </div>
          <h3 className="text-base font-bold tracking-tight text-white font-display">
            Simulate Deduplication Space Recovery
          </h3>
          <p className="mt-0.5 text-xs text-slate-400">
            Adjust sensitivity to project reclaimable capacity based on similarity confidence.
          </p>
        </div>

        {/* Presets */}
        <div className="flex items-center rounded-lg border border-[#272d3f] bg-[#0c0e14] p-1 text-xs">
          <button
            onClick={() => handlePreset('safe')}
            className={`rounded-md px-3 py-1 font-semibold transition-colors ${
              activePreset === 'safe' ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Safe (≥98%)
          </button>
          <button
            onClick={() => handlePreset('balanced')}
            className={`rounded-md px-3 py-1 font-semibold transition-colors ${
              activePreset === 'balanced' ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Balanced (≥90%)
          </button>
          <button
            onClick={() => handlePreset('aggressive')}
            className={`rounded-md px-3 py-1 font-semibold transition-colors ${
              activePreset === 'aggressive' ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Deep Clean (≥80%)
          </button>
        </div>
      </div>

      <div className="mt-5 grid gap-6 lg:grid-cols-[1.2fr_0.8fr] items-center">
        {/* Slider & Metrics */}
        <div className="space-y-5">
          <div>
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-semibold text-slate-300">Similarity Cutoff</span>
              <span className="text-xs font-bold text-brand-400 font-mono">≥ {threshold}% Similarity</span>
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
              className="w-full h-1.5 bg-[#1e2230] rounded-lg appearance-none cursor-pointer accent-brand-500"
            />

            <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
              <span>70% (Broad matches)</span>
              <span>85% (Default)</span>
              <span>100% (Exact Hash)</span>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="rounded-lg border border-[#1e2230] bg-[#161922] p-3">
              <p className="text-[10px] font-medium text-slate-400">Reclaimable</p>
              <p className="mt-0.5 text-base font-bold text-emerald-400 font-mono">
                {formatBytes(simulatedBytes)}
              </p>
              <p className="text-[9px] text-slate-500 mt-0.5">Projected space</p>
            </div>

            <div className="rounded-lg border border-[#1e2230] bg-[#161922] p-3">
              <p className="text-[10px] font-medium text-slate-400">Photo Capacity</p>
              <p className="mt-0.5 text-base font-bold text-brand-300 font-mono">
                +{simulatedPhotos.toLocaleString()}
              </p>
              <p className="text-[9px] text-slate-500 mt-0.5">24MP equivalent</p>
            </div>

            <div className="rounded-lg border border-[#1e2230] bg-[#161922] p-3">
              <p className="text-[10px] font-medium text-slate-400">Cloud Value</p>
              <p className="mt-0.5 text-base font-bold text-amber-300 font-mono">
                -${cloudCostSavings}/mo
              </p>
              <p className="text-[9px] text-slate-500 mt-0.5">Storage offset</p>
            </div>
          </div>
        </div>

        {/* Projection Card */}
        <div className="rounded-xl border border-[#272d3f] bg-[#161922] p-4.5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Projected Outcome
            </span>
            <Badge tone="green">Non-Destructive</Badge>
          </div>

          <div className="flex items-baseline gap-2 pt-1">
            <span className="text-2xl font-bold font-mono text-emerald-400">
              {formatBytes(simulatedBytes)}
            </span>
            <span className="text-xs text-slate-400">recoverable</span>
          </div>

          <p className="text-xs leading-relaxed text-slate-300">
            Applying this threshold targets <strong className="text-brand-300 font-mono">{Math.round(data.duplicateFiles * (factor > 1 ? 0.95 : factor))} duplicate files</strong> across <strong className="text-brand-300 font-mono">{Math.round(data.duplicateGroups * (factor > 1 ? 0.95 : factor))} clusters</strong> while retaining the highest quality master copies.
          </p>

          <div className="pt-2">
            <Button
              size="sm"
              className="w-full bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs h-8 shadow-sm"
              onClick={() => {
                if (onApplyPolicy) onApplyPolicy(threshold)
                pushToast(`Threshold set to ${threshold}%. Ready for one-click review.`, 'info')
              }}
            >
              <Sparkles size={13} />
              <span>Apply Sensitivity ({threshold}%)</span>
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}
