import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Sliders, Columns, Eye, ZoomIn, ZoomOut, CheckCircle2, AlertTriangle, Camera, Sparkles, FileImage, ShieldCheck } from 'lucide-react'
import { DuplicateGroup, FileRecord } from '../types'
import { formatBytes } from '../lib/utils'
import { Badge, Button } from './ui'

interface ImageCompareModalProps {
  group: DuplicateGroup
  isOpen: boolean
  onClose: () => void
  onSelectKeep?: (fileId: string) => void
}

export default function ImageCompareModal({ group, isOpen, onClose, onSelectKeep }: ImageCompareModalProps) {
  const masterFile = group.files.find(f => f.isRecommended) || group.files[0]
  const [selectedCandidate, setSelectedCandidate] = useState<FileRecord>(
    group.files.find(f => !f.isRecommended) || group.files[1] || group.files[0]
  )
  const [sliderPosition, setSliderPosition] = useState(50)
  const [isDragging, setIsDragging] = useState(false)
  const [viewMode, setViewMode] = useState<'slider' | 'side-by-side' | 'difference'>('slider')
  const [zoomLevel, setZoomLevel] = useState(1)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || !isDragging) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width))
    setSliderPosition((x / rect.width) * 100)
  }

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const touch = e.touches[0]
    const x = Math.max(0, Math.min(touch.clientX - rect.left, rect.width))
    setSliderPosition((x / rect.width) * 100)
  }

  if (!isOpen) return null

  const masterImg = masterFile.imageUrl || 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1000&q=85'
  const candidateImg = selectedCandidate.imageUrl || 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=600&q=50'

  const sizeReduction = Math.round(((masterFile.size - selectedCandidate.size) / masterFile.size) * 100)

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-950/85 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative flex h-[92vh] w-full max-w-7xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0f172a] shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 bg-slate-900/90 px-6 py-4 backdrop-blur-lg">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-glow">
                <Sliders size={18} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white tracking-tight">{group.title}</h3>
                  <Badge tone="purple">{group.similarity}% Visual Match</Badge>
                </div>
                <p className="text-xs text-slate-400">
                  Interactive Split Inspector · Compare resolution, compression noise, & EXIF tags
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* View mode switcher */}
              <div className="hidden sm:flex items-center rounded-lg border border-white/10 bg-slate-800/80 p-1">
                <button
                  onClick={() => setViewMode('slider')}
                  className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-semibold transition-all ${
                    viewMode === 'slider' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Sliders size={13} /> Split Slider
                </button>
                <button
                  onClick={() => setViewMode('side-by-side')}
                  className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-semibold transition-all ${
                    viewMode === 'side-by-side' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Columns size={13} /> Side-by-Side
                </button>
                <button
                  onClick={() => setViewMode('difference')}
                  className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-semibold transition-all ${
                    viewMode === 'difference' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Eye size={13} /> Heatmap Diff
                </button>
              </div>

              {/* Zoom controls */}
              <div className="flex items-center gap-1 rounded-lg border border-white/10 bg-slate-800/80 p-1">
                <button
                  onClick={() => setZoomLevel(prev => Math.max(0.75, prev - 0.25))}
                  className="rounded p-1 text-slate-400 hover:bg-white/10 hover:text-white"
                  title="Zoom Out"
                >
                  <ZoomOut size={15} />
                </button>
                <span className="px-1 text-[11px] font-mono font-medium text-slate-300">
                  {Math.round(zoomLevel * 100)}%
                </span>
                <button
                  onClick={() => setZoomLevel(prev => Math.min(2.5, prev + 0.25))}
                  className="rounded p-1 text-slate-400 hover:bg-white/10 hover:text-white"
                  title="Zoom In"
                >
                  <ZoomIn size={15} />
                </button>
              </div>

              <button
                onClick={onClose}
                className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-slate-800 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Main Visual Arena */}
          <div className="grid flex-1 overflow-hidden lg:grid-cols-[1fr_360px]">
            {/* Viewport Canvas */}
            <div className="relative flex flex-col items-center justify-center overflow-hidden bg-[#060911] p-4 sm:p-6 select-none">
              {viewMode === 'slider' && (
                <div
                  ref={containerRef}
                  onMouseDown={() => setIsDragging(true)}
                  onMouseUp={() => setIsDragging(false)}
                  onMouseLeave={() => setIsDragging(false)}
                  onMouseMove={handleMouseMove}
                  onTouchMove={handleTouchMove}
                  className="relative h-full max-h-[640px] w-full max-w-[850px] cursor-ew-resize overflow-hidden rounded-xl border border-white/15 bg-slate-900 shadow-2xl"
                  style={{ transform: `scale(${zoomLevel})`, transition: 'transform 0.15s ease-out' }}
                >
                  {/* Candidate Image (Underneath / Right) */}
                  <img
                    src={candidateImg}
                    alt={selectedCandidate.name}
                    className="absolute inset-0 h-full w-full object-contain filter contrast-95 brightness-95"
                  />
                  <div className="absolute right-4 top-4 rounded-md bg-black/75 px-2.5 py-1 text-[11px] font-semibold text-rose-300 backdrop-blur-md border border-rose-500/30">
                    Candidate Copy ({selectedCandidate.dimensions || '1080p'})
                  </div>

                  {/* Master Image (Top Layer / Clipped on Left) */}
                  <div
                    className="absolute inset-0 overflow-hidden"
                    style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
                  >
                    <img
                      src={masterImg}
                      alt={masterFile.name}
                      className="absolute inset-0 h-full w-full object-contain"
                    />
                    <div className="absolute left-4 top-4 rounded-md bg-black/75 px-2.5 py-1 text-[11px] font-semibold text-emerald-300 backdrop-blur-md border border-emerald-500/30">
                      ★ Master Original ({masterFile.dimensions || '4K'})
                    </div>
                  </div>

                  {/* Draggable Divider Line */}
                  <div
                    className="absolute inset-y-0 w-0.5 bg-white shadow-[0_0_12px_rgba(255,255,255,0.8)]"
                    style={{ left: `${sliderPosition}%` }}
                  >
                    <div className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-indigo-600 text-white shadow-glow">
                      <Sliders size={14} className="rotate-90" />
                    </div>
                  </div>
                </div>
              )}

              {viewMode === 'side-by-side' && (
                <div
                  className="grid h-full max-h-[640px] w-full max-w-[900px] grid-cols-2 gap-4"
                  style={{ transform: `scale(${zoomLevel})`, transition: 'transform 0.15s ease-out' }}
                >
                  <div className="relative overflow-hidden rounded-xl border border-emerald-500/40 bg-slate-900 shadow-xl">
                    <img src={masterImg} alt={masterFile.name} className="h-full w-full object-contain" />
                    <div className="absolute left-3 top-3 rounded-md bg-emerald-950/80 px-2 py-0.5 text-[11px] font-semibold text-emerald-300 border border-emerald-500/30">
                      ★ Master: {masterFile.name}
                    </div>
                  </div>
                  <div className="relative overflow-hidden rounded-xl border border-white/10 bg-slate-900 shadow-xl">
                    <img src={candidateImg} alt={selectedCandidate.name} className="h-full w-full object-contain filter contrast-95" />
                    <div className="absolute left-3 top-3 rounded-md bg-slate-900/80 px-2 py-0.5 text-[11px] font-semibold text-slate-300 border border-white/20">
                      Candidate: {selectedCandidate.name}
                    </div>
                  </div>
                </div>
              )}

              {viewMode === 'difference' && (
                <div
                  className="relative h-full max-h-[640px] w-full max-w-[850px] overflow-hidden rounded-xl border border-purple-500/40 bg-slate-900 shadow-xl"
                  style={{ transform: `scale(${zoomLevel})`, transition: 'transform 0.15s ease-out' }}
                >
                  <img src={masterImg} alt="Master" className="h-full w-full object-contain filter invert hue-rotate-180 opacity-70" />
                  <img src={candidateImg} alt="Candidate" className="absolute inset-0 h-full w-full object-contain mix-blend-difference" />
                  <div className="absolute left-4 top-4 rounded-md bg-purple-950/90 px-3 py-1 text-xs font-semibold text-purple-200 border border-purple-500/40">
                    Difference Mask: Black pixels = 100% identical · Colored pixels = compression noise / cropping
                  </div>
                </div>
              )}

              {/* Interaction instructions */}
              <div className="mt-3 flex items-center gap-4 text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
                  Drag the slider horizontally to reveal JPEG compression artifacts and downscaling differences.
                </span>
              </div>
            </div>

            {/* Sidebar Inspector */}
            <div className="flex flex-col border-t lg:border-t-0 lg:border-l border-white/10 bg-slate-900/60 p-5 overflow-y-auto">
              {/* Candidate Version Selector */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Select Comparison Candidate
                </p>
                <div className="mt-2 space-y-1.5">
                  {group.files.map(file => (
                    <button
                      key={file.id}
                      onClick={() => setSelectedCandidate(file)}
                      className={`flex w-full items-center justify-between rounded-xl border p-2.5 text-left text-xs transition-all ${
                        selectedCandidate.id === file.id
                          ? 'border-indigo-500/80 bg-indigo-950/40 text-white shadow-glow'
                          : 'border-white/5 bg-slate-800/40 text-slate-400 hover:border-white/20 hover:text-white'
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <div className="flex items-center gap-1.5">
                          <span className="truncate font-semibold text-slate-200">{file.name}</span>
                          {file.isRecommended && (
                            <span className="rounded bg-emerald-500/20 px-1 py-0.5 text-[9px] font-bold text-emerald-300">
                              MASTER
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 text-[10px] text-slate-400">
                          {formatBytes(file.size)} · {file.dimensions || 'N/A'}
                        </p>
                      </div>
                      <span className="text-[11px] font-bold text-indigo-400">
                        {file.isRecommended ? '100%' : `${file.quality}% quality`}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Technical Comparison Table */}
              <div className="mt-5 rounded-xl border border-white/10 bg-slate-950/50 p-4">
                <p className="text-[11px] font-bold uppercase tracking-wider text-indigo-300">
                  Detailed Metric Divergence
                </p>
                <div className="mt-3 space-y-2.5 text-xs">
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-slate-400">Resolution</span>
                    <div className="text-right">
                      <span className="font-semibold text-emerald-400">{masterFile.dimensions || '6000×4000'}</span>
                      <span className="text-slate-500"> vs </span>
                      <span className="font-semibold text-rose-400">{selectedCandidate.dimensions || '1920×1280'}</span>
                    </div>
                  </div>

                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-slate-400">File Weight</span>
                    <div className="text-right">
                      <span className="font-semibold text-slate-200">{formatBytes(masterFile.size)}</span>
                      <span className="text-slate-500"> vs </span>
                      <span className="font-semibold text-indigo-300">{formatBytes(selectedCandidate.size)}</span>
                      {sizeReduction > 0 && (
                        <span className="ml-1 text-[10px] text-amber-400">(-{sizeReduction}%)</span>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-slate-400">Perceptual Hash</span>
                    <span className="font-mono text-[11px] text-indigo-300">{masterFile.phash || 'd4e5f6a1'}</span>
                  </div>

                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-slate-400">Camera / Sensor</span>
                    <span className="font-medium text-slate-200">{masterFile.exif?.camera || 'Sony α7 IV'}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-400">Color Profile</span>
                    <span className="font-medium text-slate-200">{masterFile.exif?.colorSpace || 'sRGB 14-bit'}</span>
                  </div>
                </div>
              </div>

              {/* Recommendation Callout */}
              <div className="mt-5 rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4">
                <div className="flex items-center gap-2 text-emerald-400">
                  <ShieldCheck size={16} />
                  <span className="text-xs font-bold uppercase tracking-wider">Algorithmic Recommendation</span>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-emerald-200/90">
                  {group.recommendationReason}
                </p>
              </div>

              {/* Actions */}
              <div className="mt-auto pt-6 flex flex-col gap-2">
                <Button
                  variant="default"
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white shadow-glow"
                  onClick={() => {
                    if (onSelectKeep) onSelectKeep(masterFile.id)
                    onClose()
                  }}
                >
                  <CheckCircle2 size={15} /> Keep {masterFile.name} as Master
                </Button>
                <Button variant="outline" className="w-full text-slate-300 border-white/10" onClick={onClose}>
                  Done Inspecting
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
