import React, { ButtonHTMLAttributes, HTMLAttributes, InputHTMLAttributes, ReactNode } from 'react'
import { cn } from '../lib/utils'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'danger' | 'secondary' | 'subtle'
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
        'inline-flex items-center justify-center gap-2 font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/60 focus-visible:ring-offset-1 focus-visible:ring-offset-[#0f1012] disabled:pointer-events-none disabled:opacity-40 select-none cursor-pointer',
        variant === 'default' &&
          'bg-brand-600 text-white hover:bg-brand-500 shadow-sm border border-brand-500/30',
        variant === 'secondary' &&
          'bg-[#202327] text-slate-200 hover:bg-[#292d32] hover:text-white border border-[#343a40]',
        variant === 'outline' &&
          'border border-[#343a40] bg-transparent text-slate-300 hover:bg-[#202327] hover:text-white hover:border-[#555c64]',
        variant === 'ghost' &&
          'text-slate-400 hover:bg-[#202327] hover:text-slate-200',
        variant === 'subtle' &&
          'bg-brand-500/10 text-brand-300 border border-brand-500/20 hover:bg-brand-500/20',
        variant === 'danger' &&
          'bg-rose-500/15 text-rose-300 hover:bg-rose-500/25 border border-rose-500/30 hover:text-rose-200',
        size === 'xs' && 'h-8 rounded-lg px-3 text-xs font-semibold',
        size === 'sm' && 'h-9.5 rounded-xl px-4 text-xs font-bold',
        size === 'md' && 'h-11 rounded-xl px-5 text-sm font-bold',
        size === 'lg' && 'h-12.5 rounded-xl px-7 text-sm font-bold shadow-sm',
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
        'inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-semibold tracking-wide border',
        tone === 'neutral' &&
          'bg-[#202327] text-slate-300 border-[#343a40]',
        tone === 'blue' &&
          'bg-blue-500/10 text-blue-400 border-blue-500/25',
        tone === 'green' &&
          'bg-emerald-500/10 text-emerald-400 border-emerald-500/25',
        tone === 'amber' &&
          'bg-amber-500/10 text-amber-300 border-amber-500/25',
        tone === 'purple' &&
          'bg-indigo-500/10 text-indigo-300 border-indigo-500/25',
        tone === 'rose' &&
          'bg-rose-500/10 text-rose-300 border-rose-500/25',
        tone === 'cyan' &&
          'bg-cyan-500/10 text-cyan-300 border-cyan-500/25',
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
        'rounded-2xl border border-[#2a2e33] bg-[#151719] shadow-subtle',
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
          'w-full rounded-xl border border-[#343a40] bg-[#0f1012] px-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none transition-colors focus:border-brand-500 focus:ring-1 focus:ring-brand-500',
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
    <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
      <div>
        {eyebrow && (
          <p className="eyebrow mb-1.5 text-brand-400">
            {eyebrow}
          </p>
        )}
        <h2 className="text-[1.05rem] font-semibold tracking-tight text-white font-display">
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
