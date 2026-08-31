import React from 'react'
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { DashboardData } from '../types'
import { formatBytes } from '../lib/utils'
import { Card, SectionTitle } from './ui'
import { HardDrive } from 'lucide-react'

export default function MiniRecoveryChart({ data }: { data: DashboardData }) {
  const chartData = data.recoveryByType.map(item => ({
    name: item.name,
    value: item.value,
    color: item.color || '#6366f1'
  }))

  return (
    <Card className="p-5 sm:p-6 border-white/10 bg-slate-900/70">
      <SectionTitle
        eyebrow="Storage Distribution"
        title="Reclaimable Space by Category"
        subtitle="Identified duplicates grouped by file taxonomy."
      />
      <div className="h-[210px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ top: 8, right: 24, bottom: 8, left: 10 }}>
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="name"
              axisLine={false}
              tickLine={false}
              width={130}
              tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 500 }}
            />
            <Tooltip
              cursor={{ fill: 'rgba(99, 102, 241, 0.08)' }}
              formatter={(value: number) => [`${value.toFixed(1)} GB`, 'Recoverable Space']}
              contentStyle={{
                backgroundColor: '#0f172a',
                borderRadius: 12,
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#f8fafc',
                fontSize: 12,
                boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)'
              }}
            />
            <Bar
              dataKey="value"
              fill="#6366f1"
              radius={[0, 6, 6, 0]}
              barSize={18}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 flex items-center gap-2 border-t border-white/5 pt-3 text-xs text-slate-400">
        <HardDrive size={14} className="text-indigo-400" />
        <span>
          Total potential recovery: <strong className="text-indigo-300">{formatBytes(data.recoverable)}</strong> across all categories.
        </span>
      </div>
    </Card>
  )
}
