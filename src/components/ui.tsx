import React, { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from 'react'
import { cn } from '../lib/utils'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'danger' | 'gradient' | 'secondary'
  size?: 'xs' | 'sm' | 'md' | 'lg'
}

export function Button({
  className,
  variant = 'default',
  size = 'md',
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0f19] disabled:pointer-events-none disabled:opacity-40 select-none active:scale-[0.98] hover:-translate-y-px',
        variant === 'default' &&
          'bg-indigo-600 text-white shadow-glow hover:bg-indigo-500 hover:shadow-indigo-500/25',
        variant === 'gradient' &&
          'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-glow hover:brightness-110',
        variant === 'secondary' &&
          'bg-slate-800 text-slate-100 hover:bg-slate-700 hover:text-white border border-white/10',
        variant === 'outline' &&
          'border border-white/10 bg-slate-900/60 text-slate-200 hover:bg-white/10 hover:border-white/20 hover:text-white',
        variant === 'ghost' &&
          'text-slate-400 hover:bg-white/10 hover:text-white',
        variant === 'danger' &&
          'bg-rose-600/90 text-white hover:bg-rose-600 border border-rose-500/30 hover:shadow-[0_0_20px_-3px_rgba(244,63,94,0.4)]',
        size === 'xs' && 'h-7 rounded-lg px-2.5 text-[11px]',
        size === 'sm' && 'h-8.5 rounded-lg px-3.5 text-xs',
        size === 'md' && 'h-10 rounded-xl px-4 text-sm',
        size === 'lg' && 'h-12 rounded-xl px-6 text-sm font-semibold',
        className
      )}
      {...props}
    />
  )
}

export function Badge({
  children,
  tone = 'neutral',
  className,
}: {
  children: ReactNode
  tone?: 'neutral' | 'blue' | 'green' | 'amber' | 'purple' | 'rose' | 'cyan'
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-lg px-2.5 py-1 text-[11px] font-semibold tracking-wide border transition-colors',
        tone === 'neutral' &&
          'bg-slate-800/80 text-slate-300 border-white/10',
        tone === 'blue' &&
          'bg-blue-500/10 text-blue-400 border-blue-500/30',
        tone === 'green' &&
          'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
        tone === 'amber' &&
          'bg-amber-500/10 text-amber-300 border-amber-500/30',
        tone === 'purple' &&
          'bg-purple-500/10 text-purple-300 border-purple-500/30',
        tone === 'rose' &&
          'bg-rose-500/10 text-rose-300 border-rose-500/30',
        tone === 'cyan' &&
          'bg-cyan-500/10 text-cyan-300 border-cyan-500/30',
        className
      )}
    >
      {children}
    </span>
  )
}

export function Card({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl shadow-card transition-all duration-200 hover:border-indigo-400/20 hover:shadow-panel',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function SectionTitle({
  eyebrow,
  title,
  subtitle,
  action,
}: {
  eyebrow?: string
  title: string
  subtitle?: string
  action?: ReactNode
}) {
  return (
    <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
      <div>
        {eyebrow && (
          <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-400">
            {eyebrow}
          </p>
        )}
        <h2 className="text-xl font-bold tracking-tight text-white font-display">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-1 text-xs text-slate-400">
            {subtitle}
          </p>
        )}
      </div>
      {action}
    </div>
  )
}
