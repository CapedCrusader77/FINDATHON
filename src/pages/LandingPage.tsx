import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  Zap,
  ShieldCheck,
  HardDrive,
  Image as ImageIcon,
  FileText,
  GitMerge,
  Star,
  CheckCircle2,
  Layers,
  Cpu,
  ChevronRight,
  FolderOpen
} from 'lucide-react'

/* ── Typewriter for hero ── */
function Typewriter({ words }: { words: string[] }) {
  const [wi, setWi] = useState(0)
  const [ci, setCi] = useState(0)
  const [del, setDel] = useState(false)

  useEffect(() => {
    const cur = words[wi]
    let t: ReturnType<typeof setTimeout>
    if (!del && ci < cur.length)       t = setTimeout(() => setCi(c => c + 1), 72)
    else if (!del && ci === cur.length) t = setTimeout(() => setDel(true), 2000)
    else if (del && ci > 0)            t = setTimeout(() => setCi(c => c - 1), 38)
    else { setDel(false); setWi(i => (i + 1) % words.length) }
    return () => clearTimeout(t)
  }, [ci, del, wi, words])

  return (
    <span className="text-brand-400">
      {words[wi].slice(0, ci)}
      <span className="inline-block w-0.5 h-[0.9em] bg-brand-400 align-middle ml-0.5 animate-pulse" />
    </span>
  )
}

/* ── Animated "file group" demo card ── */
function FileDemoCard({
  files,
  keep,
  similarity,
  type,
  delay = 0
}: {
  files: { name: string; size: string; isKeep?: boolean; role: string }[]
  keep: string
  similarity: number
  type: 'image' | 'document'
  delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5 }}
      className="rounded-2xl border border-[#1e2230] bg-[#11141d] p-5 space-y-4 hover:border-brand-500/40 transition-colors"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-xl bg-brand-500/15 text-brand-400">
            {type === 'image' ? <ImageIcon size={16} /> : <FileText size={16} />}
          </div>
          <div>
            <p className="text-xs font-bold text-white">Duplicate Group</p>
            <p className="text-[10px] text-slate-400">{type === 'image' ? 'Photo Cluster' : 'Document Versions'}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs font-bold text-brand-400 font-mono">{similarity}% match</p>
        </div>
      </div>

      {/* Version chain for documents */}
      {type === 'document' && (
        <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono overflow-x-auto pb-1">
          {files.map((f, i) => (
            <React.Fragment key={f.name}>
              <span className={f.isKeep ? 'text-brand-300 font-bold' : ''}>{f.name}</span>
              {i < files.length - 1 && <ChevronRight size={10} className="shrink-0" />}
            </React.Fragment>
          ))}
        </div>
      )}

      <div className="space-y-1.5">
        {files.map(file => (
          <div
            key={file.name}
            className={`flex items-center justify-between rounded-lg px-3 py-2 text-xs ${
              file.isKeep
                ? 'bg-brand-500/10 border border-brand-500/30'
                : 'bg-[#0c0e14] border border-[#1e2230]'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {file.isKeep ? (
                <Star size={12} className="text-brand-400 shrink-0 fill-brand-400" />
              ) : (
                <span className="h-1.5 w-1.5 rounded-full bg-slate-600 shrink-0 ml-0.5" />
              )}
              <div className="min-w-0">
                <p className={`font-semibold truncate ${file.isKeep ? 'text-white' : 'text-slate-400'}`}>
                  {file.name}
                </p>
                <p className="text-[10px] text-slate-500">{file.role}</p>
              </div>
            </div>
            <div className="text-right shrink-0 pl-3">
              <p className="font-mono text-xs text-slate-300">{file.size}</p>
              {file.isKeep && <p className="text-[9px] text-brand-400">KEEP</p>}
            </div>
          </div>
        ))}
      </div>

      <div className="pt-1 border-t border-[#1e2230] flex items-center justify-between text-[11px]">
        <span className="text-slate-400">Why keep <strong className="text-white">{keep}</strong>?</span>
        <span className="text-emerald-400 font-semibold">
          {type === 'image' ? 'Highest res + original EXIF' : 'Most content, newest version'}
        </span>
      </div>
    </motion.div>
  )
}

/* ── How it works step ── */
function Step({ n, title, desc, icon: Icon, color }: { n: number; title: string; desc: string; icon: any; color: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: n * 0.1 }}
      className="flex items-start gap-4"
    >
      <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-gradient-to-br ${color} text-white text-sm font-black shadow-lg`}>
        {n}
      </div>
      <div>
        <div className="flex items-center gap-2">
          <Icon size={14} className="text-slate-400" />
          <p className="font-bold text-sm text-white">{title}</p>
        </div>
        <p className="mt-1 text-xs text-slate-400 leading-relaxed">{desc}</p>
      </div>
    </motion.div>
  )
}

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[#0a0c13] text-slate-100 font-sans selection:bg-brand-500/30 selection:text-brand-200">

      {/* ── Nav ── */}
      <nav className="sticky top-0 z-50 border-b border-[#1e2230]/80 bg-[#0a0c13]/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5">
          <div className="flex items-center gap-2.5">
            <div className="grid h-8 w-8 place-items-center rounded-xl bg-brand-600 text-white shadow-lg">
              <HardDrive size={16} />
            </div>
            <span className="font-black text-base tracking-tight text-white font-display">
              Dedupe<span className="text-brand-400">IQ</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <a href="#how" className="hidden sm:block text-xs text-slate-400 hover:text-white transition-colors">How it works</a>
            <a href="#demo" className="hidden sm:block text-xs text-slate-400 hover:text-white transition-colors">Demo</a>
            <a href="#features" className="hidden sm:block text-xs text-slate-400 hover:text-white transition-colors">Features</a>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-600 hover:bg-brand-500 px-4 py-2 text-xs font-bold text-white shadow-lg transition-colors"
            >
              <Zap size={13} />
              Open App
            </motion.button>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        {/* Background gradient blobs */}
        <div className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-brand-600/10 blur-[100px]" />
        <div className="pointer-events-none absolute top-40 right-0 h-[300px] w-[400px] rounded-full bg-emerald-600/8 blur-[80px]" />

        <div className="relative mx-auto max-w-5xl px-5 pt-20 pb-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-4 py-1.5 text-xs font-semibold text-brand-300 mb-6"
          >
            <span className="h-2 w-2 rounded-full bg-brand-400 animate-pulse" />
            Built for FINDATHON Hackathon
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight font-display text-white leading-[1.08]"
          >
            Your computer is full of<br />
            <Typewriter words={['photo copies.', 'draft documents.', 'WhatsApp files.', 'wasted storage.']} />
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.16 }}
            className="mt-6 text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed"
          >
            DedupeIQ looks <em>inside</em> your files — not just at names — and groups visually similar photos and semantically similar documents. Then it tells you which copy is best and helps you safely clean up the rest.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.24 }}
            className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-2.5 rounded-2xl bg-brand-600 hover:bg-brand-500 px-7 py-3.5 text-sm font-bold text-white shadow-[0_0_30px_rgba(99,102,241,0.4)] transition-all"
            >
              <Zap size={16} className="fill-white" />
              Try DedupeIQ Free
              <ArrowRight size={16} />
            </motion.button>
            <a
              href="#how"
              className="inline-flex items-center gap-2 rounded-2xl border border-[#1e2230] bg-[#11141d] hover:border-brand-500/40 px-7 py-3.5 text-sm font-semibold text-slate-300 hover:text-white transition-all"
            >
              See how it works
              <ChevronRight size={15} />
            </a>
          </motion.div>

          {/* Simple stat strip */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.38 }}
            className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs text-slate-400"
          >
            {[
              { val: '4-Stage', label: 'Detection Pipeline' },
              { val: '100%', label: 'On-Device Privacy' },
              { val: 'SHA-256', label: 'Exact Match' },
              { val: 'pHash', label: 'Visual Similarity' },
              { val: 'NLP', label: 'Document Semantic Match' },
            ].map(s => (
              <div key={s.label} className="text-center">
                <p className="text-white font-bold text-sm font-mono">{s.val}</p>
                <p className="text-[10px] text-slate-500">{s.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── The Simple Idea ── */}
      <section className="mx-auto max-w-5xl px-5 py-14">
        <div className="rounded-3xl border border-[#1e2230] bg-[#0e1018] p-8 sm:p-12">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-400 mb-3">The Simple Idea</p>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white font-display leading-tight">
                Normal software checks filenames.<br />
                <span className="text-brand-400">We check what's inside.</span>
              </h2>
              <p className="mt-4 text-sm text-slate-400 leading-relaxed">
                <code className="text-brand-300 bg-brand-900/30 px-1 py-0.5 rounded text-xs">dog.jpg</code>, <code className="text-brand-300 bg-brand-900/30 px-1 py-0.5 rounded text-xs">dog_whatsapp.jpg</code>, and <code className="text-brand-300 bg-brand-900/30 px-1 py-0.5 rounded text-xs">dog_small.jpg</code> look like different files to your OS. DedupeIQ looks at what the image actually <em>looks like</em> and says: "these are all the same dog photo."
              </p>
              <p className="mt-3 text-sm text-slate-400 leading-relaxed">
                Same for documents — <code className="text-brand-300 bg-brand-900/30 px-1 py-0.5 rounded text-xs">assignment.docx</code> and <code className="text-brand-300 bg-brand-900/30 px-1 py-0.5 rounded text-xs">assignment_submission.pdf</code> contain the same text, just in different formats.
              </p>
            </div>

            {/* Visual comparison */}
            <div className="space-y-3">
              <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-xs">
                <p className="font-bold text-red-400 mb-2">❌ Normal duplicate finder says:</p>
                <p className="text-slate-300 font-mono">"dog.jpg ≠ dog_whatsapp.jpg<br />These are different files."</p>
              </div>
              <div className="flex justify-center">
                <div className="h-6 w-0.5 bg-gradient-to-b from-red-500/30 to-brand-500/30" />
              </div>
              <div className="rounded-xl border border-brand-500/30 bg-brand-500/8 p-4 text-xs">
                <p className="font-bold text-brand-400 mb-2">✅ DedupeIQ says:</p>
                <p className="text-slate-300 font-mono">"Nah, these are all versions of<br />the same picture. Keep the original."</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── How it Works ── */}
      <section id="how" className="mx-auto max-w-5xl px-5 py-14">
        <div className="text-center mb-10">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-400 mb-2">The Engine</p>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white font-display">4-Stage Detection Pipeline</h2>
          <p className="mt-2 text-sm text-slate-400">Every file passes through all four stages automatically.</p>
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          {[
            { n: 1, title: 'Exact SHA-256 Match', desc: 'Instant byte-for-byte clone detection. If two files are identical at the bit level, caught immediately.', icon: Cpu, color: 'from-blue-500 to-indigo-600' },
            { n: 2, title: 'Perceptual Image Hash', desc: 'pHash + dHash + wHash compute visual fingerprints. Catches resized, cropped, or WhatsApp-compressed photos.', icon: ImageIcon, color: 'from-purple-500 to-pink-600' },
            { n: 3, title: 'Document Text Similarity', desc: 'Extracts text from DOCX, PDF, TXT. Compares n-gram overlap and cosine similarity of semantic embeddings.', icon: FileText, color: 'from-amber-500 to-orange-600' },
            { n: 4, title: 'Louvain Graph Clustering', desc: 'Builds a similarity graph. Louvain community detection groups related files. Recommends the best master copy.', icon: GitMerge, color: 'from-emerald-500 to-teal-600' },
          ].map(s => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: s.n * 0.08 }}
              className="rounded-2xl border border-[#1e2230] bg-[#0e1018] p-5 flex items-start gap-4"
            >
              <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-gradient-to-br ${s.color} text-white font-black text-sm shadow-lg`}>
                {s.n}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <s.icon size={14} className="text-slate-400" />
                  <p className="font-bold text-sm text-white">{s.title}</p>
                </div>
                <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">{s.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Pipeline arrow */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-8 flex items-center justify-center gap-2 text-xs font-mono text-slate-500 overflow-x-auto"
        >
          {['Messy Folder', 'SHA-256 Pass', 'pHash Vision', 'NLP Similarity', 'Graph Cluster', 'Clean Groups ✓'].map((s, i) => (
            <React.Fragment key={s}>
              <span className={i === 0 || i === 5 ? 'text-brand-400 font-bold' : ''}>{s}</span>
              {i < 5 && <ArrowRight size={13} className="shrink-0 text-slate-600" />}
            </React.Fragment>
          ))}
        </motion.div>
      </section>

      {/* ── Live Demo Cards ── */}
      <section id="demo" className="mx-auto max-w-5xl px-5 py-14">
        <div className="text-center mb-10">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-400 mb-2">Output Preview</p>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white font-display">What you actually see</h2>
          <p className="mt-2 text-sm text-slate-400">Grouped duplicates with explanations — not a raw list of files.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          <FileDemoCard
            type="image"
            similarity={97}
            keep="Original.jpg"
            delay={0}
            files={[
              { name: 'Original.jpg',    size: '5 MB',    isKeep: true, role: 'Full resolution + EXIF data' },
              { name: 'WhatsApp.jpg',    size: '500 KB',  role: 'WhatsApp compressed copy' },
              { name: 'dog_small.jpg',   size: '200 KB',  role: 'Resized thumbnail' },
              { name: 'dog_cropped.jpg', size: '1.2 MB',  role: 'Cropped version' },
            ]}
          />
          <FileDemoCard
            type="document"
            similarity={94}
            keep="assignment_final2.docx"
            delay={0.1}
            files={[
              { name: 'assignment.docx',            size: '24 KB', role: 'First draft' },
              { name: 'assignment_final.docx',      size: '31 KB', role: 'Revised version' },
              { name: 'assignment_final2.docx',     size: '34 KB', isKeep: true, role: 'Most content — KEEP' },
              { name: 'assignment_submission.pdf',  size: '180 KB', role: 'PDF export' },
            ]}
          />
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="mx-auto max-w-5xl px-5 py-14">
        <div className="text-center mb-10">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-400 mb-2">Feature Set</p>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white font-display">Everything you need</h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { icon: ShieldCheck, title: 'Safe Quarantine', desc: '30-day soft staging. Files are never permanently deleted without explicit confirmation.', color: 'text-emerald-400' },
            { icon: Star, title: 'Master Copy Pick', desc: 'Explains why one file is better — resolution, content coverage, recency, metadata.', color: 'text-amber-400' },
            { icon: GitMerge, title: 'Version Lineage', desc: 'Shows the chain: v1 → v2 → final → PDF. Understand how files evolved.', color: 'text-brand-400' },
            { icon: Layers, title: 'Cross-Format', desc: 'Compares DOCX ↔ PDF ↔ TXT ↔ Markdown. Format is no barrier.', color: 'text-purple-400' },
            { icon: HardDrive, title: 'Storage Recovery', desc: 'Shows exactly how many GB you can reclaim before you delete anything.', color: 'text-cyan-400' },
            { icon: CheckCircle2, title: '100% On-Device', desc: 'No files, text, or metadata ever leave your machine. Zero cloud uploads.', color: 'text-emerald-400' },
          ].map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="rounded-2xl border border-[#1e2230] bg-[#0e1018] p-5 hover:border-brand-500/30 transition-colors"
            >
              <f.icon size={20} className={f.color} />
              <h3 className="mt-3 font-bold text-sm text-white">{f.title}</h3>
              <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="mx-auto max-w-5xl px-5 py-14">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl border border-brand-500/30 bg-gradient-to-br from-brand-900/40 via-[#0e1018] to-emerald-900/20 p-10 sm:p-14 text-center"
        >
          <div className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 h-40 w-80 rounded-full bg-brand-600/20 blur-[60px]" />
          <div className="relative">
            <h2 className="text-2xl sm:text-3xl font-black text-white font-display">
              Ready to clean your storage?
            </h2>
            <p className="mt-3 text-sm text-slate-400 max-w-xl mx-auto">
              Give DedupeIQ a messy folder. Get back organized duplicate groups, a recommended master copy for each, and a clear picture of how much space you can safely recover.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/app')}
                className="inline-flex items-center gap-2.5 rounded-2xl bg-brand-600 hover:bg-brand-500 px-8 py-3.5 text-sm font-bold text-white shadow-[0_0_30px_rgba(99,102,241,0.4)] transition-all"
              >
                <FolderOpen size={16} />
                Open DedupeIQ
                <ArrowRight size={16} />
              </motion.button>
            </div>
            <p className="mt-4 text-[11px] text-slate-500">
              Free. No signup required for demo. 100% local.
            </p>
          </div>
        </motion.div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-[#1e2230] py-8 text-center text-xs text-slate-500">
        <p>
          DedupeIQ — Built for FINDATHON &nbsp;·&nbsp;{' '}
          <a href="https://github.com/CapedCrusader77/FINDATHON" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
            GitHub →
          </a>
        </p>
      </footer>
    </div>
  )
}
