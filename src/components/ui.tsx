import React, { ButtonHTMLAttributes, HTMLAttributes, InputHTMLAttributes, ReactNode } from 'react'
import { cn } from '../lib/utils'

export function TrafficLights({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span className="h-3 w-3 rounded-full traffic-light-close inline-block shadow-sm transition-transform hover:scale-110 cursor-pointer" />
      <span className="h-3 w-3 rounded-full traffic-light-minimize inline-block shadow-sm transition-transform hover:scale-110 cursor-pointer" />
      <span className="h-3 w-3 rounded-full traffic-light-expand inline-block shadow-sm transition-transform hover:scale-110 cursor-pointer" />
    </div>
  )
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'danger' | 'secondary' | 'glass'
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
        'inline-flex items-center justify-center gap-2 font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60 focus-visible:ring-offset-1 focus-visible:ring-offset-[#08090d] disabled:pointer-events-none disabled:opacity-40 select-none cursor-pointer active:scale-[0.98]',
        variant === 'default' &&
          'bg-blue-600 hover:bg-blue-500 text-white shadow-glowBlue border border-blue-400/30',
        variant === 'secondary' &&
          'bg-white/[0.08] hover:bg-white/[0.14] text-slate-100 border border-white/[0.12] backdrop-blur-md',
        variant === 'glass' &&
          'bg-white/[0.05] hover:bg-white/[0.10] text-slate-200 border border-white/[0.15] backdrop-blur-xl shadow-glass',
        variant === 'outline' &&
          'border border-white/[0.15] bg-transparent text-slate-300 hover:bg-white/[0.06] hover:text-white hover:border-white/[0.25]',
        variant === 'ghost' &&
          'text-slate-400 hover:bg-white/[0.08] hover:text-white',
        variant === 'danger' &&
          'bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/35 hover:text-rose-100',
        size === 'xs' && 'h-7 rounded-lg px-2.5 text-[11px]',
        size === 'sm' && 'h-8.5 rounded-xl px-3.5 text-xs',
        size === 'md' && 'h-10 rounded-xl px-4 text-xs font-semibold',
        size === 'lg' && 'h-11.5 rounded-2xl px-5 text-sm font-semibold',
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
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold tracking-wide border backdrop-blur-md',
        tone === 'neutral' &&
          'bg-white/[0.06] text-slate-300 border-white/[0.10]',
        tone === 'blue' &&
          'bg-blue-500/15 text-blue-300 border-blue-400/30 shadow-[0_0_12px_rgba(59,130,246,0.2)]',
        tone === 'green' &&
          'bg-emerald-500/15 text-emerald-300 border-emerald-400/30 shadow-[0_0_12px_rgba(16,185,129,0.2)]',
        tone === 'amber' &&
          'bg-amber-500/15 text-amber-300 border-amber-400/30 shadow-[0_0_12px_rgba(245,158,11,0.2)]',
        tone === 'purple' &&
          'bg-purple-500/15 text-purple-300 border-purple-400/30 shadow-[0_0_12px_rgba(168,85,247,0.2)]',
        tone === 'rose' &&
          'bg-rose-500/15 text-rose-300 border-rose-400/30 shadow-[0_0_12px_rgba(244,63,94,0.2)]',
        tone === 'cyan' &&
          'bg-cyan-500/15 text-cyan-300 border-cyan-400/30 shadow-[0_0_12px_rgba(6,182,212,0.2)]',
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
        'rounded-2xl border border-white/[0.10] bg-white/[0.035] backdrop-blur-2xl shadow-glass transition-all duration-200 hover:border-white/[0.18]',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string
}

export function Input({ className, error, ...props }: InputProps) {
  return (
    <div className="w-full">
      <input
        className={cn(
          'w-full rounded-xl border border-white/[0.12] bg-white/[0.04] px-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none transition-all focus:border-blue-500 focus:bg-white/[0.08] focus:ring-1 focus:ring-blue-500 backdrop-blur-md',
          error && 'border-rose-500 focus:border-rose-500 focus:ring-rose-500',
          className
        )}
        {...props}
      />
      {error && <p className="mt-1 text-[11px] text-rose-400">{error}</p>}
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
    <div className="mb-5 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
      <div>
        {eyebrow && (
          <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.18em] text-blue-400">
            {eyebrow}
          </p>
        )}
        <h2 className="text-xl font-bold tracking-tight text-white font-display">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-0.5 text-xs text-slate-400">
            {subtitle}
          </p>
        )}
      </div>
      {action}
    </div>
  )
}
