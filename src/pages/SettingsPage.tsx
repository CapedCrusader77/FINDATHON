import React, { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Sliders,
  Save,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Cpu,
  HardDrive
} from 'lucide-react'
import { Card, SectionTitle, Button, Badge } from '../components/ui'
import { useToast } from '../components/Toast'

interface EngineSettings {
  image_threshold: number
  document_threshold: number
  semantic_threshold: number
}

export default function SettingsPage() {
  const queryClient = useQueryClient()
  const { pushToast } = useToast()

  const { data: settings, isLoading } = useQuery<EngineSettings>({
    queryKey: ['settings'],
    queryFn: async () => {
      const res = await fetch('/api/settings')
      if (!res.ok) throw new Error('Failed to load settings')
      return res.json()
    }
  })

  const [imageThresh, setImageThresh] = useState(85)
  const [docThresh, setDocThresh] = useState(80)
  const [semanticThresh, setSemanticThresh] = useState(78)

  useEffect(() => {
    if (settings) {
      setImageThresh(Math.round((settings.image_threshold ?? 0.85) * 100))
      setDocThresh(Math.round((settings.document_threshold ?? 0.80) * 100))
      setSemanticThresh(Math.round((settings.semantic_threshold ?? 0.78) * 100))
    }
  }, [settings])

  const mutation = useMutation({
    mutationFn: async (payload: EngineSettings) => {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!res.ok) throw new Error('Failed to update settings')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] })
      pushToast('Algorithm similarity thresholds updated successfully.', 'info')
    },
    onError: () => {
      pushToast('Failed to save algorithm settings.', 'error')
    }
  })

  const handleSave = () => {
    mutation.mutate({
      image_threshold: imageThresh / 100,
      document_threshold: docThresh / 100,
      semantic_threshold: semanticThresh / 100
    })
  }

  const handleResetDefaults = () => {
    setImageThresh(85)
    setDocThresh(80)
    setSemanticThresh(78)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-5">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white font-display">
            Algorithm & Sensitivity Preferences
          </h2>
          <p className="mt-0.5 text-xs text-slate-400">
            Tune algorithmic detection cutoffs for perceptual image hashing, text n-grams, and Louvain clustering.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="glass"
            size="sm"
            onClick={handleResetDefaults}
            className="text-xs"
          >
            Reset Defaults
          </Button>

          <Button
            size="sm"
            disabled={mutation.isPending}
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-glowBlue rounded-xl"
          >
            <Save size={13} />
            <span>Save Preferences</span>
          </Button>
        </div>
      </div>

      {/* Main Settings Form Card */}
      <Card className="p-6 sm:p-8 space-y-6">
        <SectionTitle
          eyebrow="Detection Thresholds"
          title="Multi-Modal Sensitivity Tuning"
          subtitle="Lower values detect broader near-matches; higher values restrict to strict clones."
        />

        <div className="space-y-6 divide-y divide-white/[0.08]">
          {/* Image Threshold */}
          <div className="space-y-2.5 pt-2">
            <div className="flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-white">Image Perceptual Similarity Cutoff</span>
                <p className="text-[11px] text-slate-400">
                  Hamming distance threshold across pHash, dHash, and wavelet fingerprints.
                </p>
              </div>
              <span className="font-mono font-bold text-blue-400 text-xs">≥ {imageThresh}%</span>
            </div>
            <input
              type="range"
              min="60"
              max="99"
              value={imageThresh}
              onChange={e => setImageThresh(Number(e.target.value))}
              className="w-full h-2 bg-white/[0.10] rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>

          {/* Document Threshold */}
          <div className="space-y-2.5 pt-5">
            <div className="flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-white">Document N-Gram & Structural Cutoff</span>
                <p className="text-[11px] text-slate-400">
                  Cross-format text similarity between DOCX, PDF, and Markdown drafts.
                </p>
              </div>
              <span className="font-mono font-bold text-blue-400 text-xs">≥ {docThresh}%</span>
            </div>
            <input
              type="range"
              min="50"
              max="99"
              value={docThresh}
              onChange={e => setDocThresh(Number(e.target.value))}
              className="w-full h-2 bg-white/[0.10] rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>

          {/* Semantic Match Threshold */}
          <div className="space-y-2.5 pt-5">
            <div className="flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-white">Semantic Embedding Cosine Distance</span>
                <p className="text-[11px] text-slate-400">
                  Vector representation cutoff for reformatted or rephrased documents.
                </p>
              </div>
              <span className="font-mono font-bold text-blue-400 text-xs">≥ {semanticThresh}%</span>
            </div>
            <input
              type="range"
              min="50"
              max="95"
              value={semanticThresh}
              onChange={e => setSemanticThresh(Number(e.target.value))}
              className="w-full h-2 bg-white/[0.10] rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>
        </div>
      </Card>

      {/* Engine & Workstation Status Card */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <ShieldCheck size={18} className="text-emerald-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-white">
            macOS Pro Workstation Hardware Engine
          </h3>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 text-xs">
          <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-3.5">
            <p className="text-[10px] text-slate-400">Database Connection</p>
            <p className="mt-1 font-bold text-emerald-400 font-mono text-xs">MongoDB Atlas / Local</p>
          </div>

          <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-3.5">
            <p className="text-[10px] text-slate-400">Cryptographic Engine</p>
            <p className="mt-1 font-bold text-white font-mono text-xs">SHA-256 Fast Chunking</p>
          </div>

          <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-3.5">
            <p className="text-[10px] text-slate-400">Vision Fingerprinter</p>
            <p className="mt-1 font-bold text-white font-mono text-xs">ImageHash (pHash / dHash)</p>
          </div>
        </div>
      </Card>
    </div>
  )
}
