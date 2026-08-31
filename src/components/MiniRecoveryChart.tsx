import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { DashboardData } from '../types'
import { formatBytes } from '../lib/utils'
import { Card, SectionTitle } from './ui'

export default function MiniRecoveryChart({ data }: { data: DashboardData }) {
  return <Card className="p-5 sm:p-6"><SectionTitle eyebrow="Recovery mix" title="Where reclaimable space sits" /><div className="h-[220px]"><ResponsiveContainer width="100%" height="100%"><BarChart data={data.recoveryByType} layout="vertical" margin={{ top: 4, right: 20, bottom: 4, left: 10 }}><XAxis type="number" hide /><YAxis type="category" dataKey="name" axisLine={false} tickLine={false} width={76} tick={{ fontSize: 11, fill: '#667085' }} /><Tooltip cursor={{ fill: 'rgba(70,104,232,0.06)' }} formatter={(value: number) => [`${value.toFixed(1)} GB`, 'Recoverable']} contentStyle={{ borderRadius: 8, border: '1px solid #e6e9ef', fontSize: 11 }} /><Bar dataKey="value" fill="#4668e8" radius={[0, 4, 4, 0]} barSize={18} /></BarChart></ResponsiveContainer></div><div className="mt-2 flex items-center gap-2 text-xs text-muted"><HardDriveIcon /> {formatBytes(data.recoverable)} total opportunity across detected groups.</div></Card>
}
function HardDriveIcon() { return <span className="h-1.5 w-1.5 rounded-full bg-brand" /> }
