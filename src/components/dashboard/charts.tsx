'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts'

// ─── Appointments Overview (Bar Chart) ───

interface AppointmentDayData {
  day: string
  count: number
}

interface AppointmentsOverviewChartProps {
  data: AppointmentDayData[]
}

export function AppointmentsOverviewChart({ data }: AppointmentsOverviewChartProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <h2 className="text-section-title mb-4">المواعيد خلال آخر 7 أيام</h2>
      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(var(--border))"
              strokeOpacity={0.5}
              vertical={false}
            />
            <XAxis
              dataKey="day"
              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                background: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                boxShadow: 'none',
                fontSize: '12px',
                direction: 'rtl',
              }}
              labelFormatter={(label) => `${label}`}
              formatter={(value: number) => [`${value} موعد`, 'المواعيد']}
            />
            <Bar
              dataKey="count"
              fill="hsl(var(--primary))"
              radius={[4, 4, 0, 0]}
              maxBarSize={32}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

// ─── Appointment Status (Donut Chart) ───

interface StatusData {
  name: string
  value: number
  color: string
}

interface AppointmentStatusChartProps {
  data: StatusData[]
}

const STATUS_CHART_COLORS: Record<string, string> = {
  مؤكد: '#10b981',
  مكتمل: '#64748b',
  ملغي: '#ef4444',
  'لم يحضر': '#f59e0b',
  مجدول: '#3b82f6',
}

export function AppointmentStatusChart({ data }: AppointmentStatusChartProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0)

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <h2 className="text-section-title mb-4">حالة المواعيد</h2>
      <div className="flex items-center gap-6">
        <div className="h-40 w-40 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={65}
                dataKey="value"
                stroke="hsl(var(--background))"
                strokeWidth={2}
              >
                {data.map((entry, index) => (
                  <Cell key={index} fill={entry.color || STATUS_CHART_COLORS[entry.name] || '#94a3b8'} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  boxShadow: 'none',
                  fontSize: '12px',
                  direction: 'rtl',
                }}
                formatter={(value: number) => [`${value}`, '']}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-2">
          {data.map((item) => (
            <div key={item.name} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: item.color || STATUS_CHART_COLORS[item.name] }}
                />
                <span className="text-muted-foreground">{item.name}</span>
              </div>
              <span className="font-medium">{item.value}</span>
            </div>
          ))}
          <div className="flex items-center justify-between border-t border-border pt-2 text-sm">
            <span className="text-muted-foreground">الإجمالي</span>
            <span className="font-semibold">{total}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── New Patients (Line Chart) ───

interface PatientDayData {
  day: string
  count: number
}

interface NewPatientsChartProps {
  data: PatientDayData[]
  period?: string
}

export function NewPatientsChart({ data, period = '7 أيام' }: NewPatientsChartProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-section-title">المرضى الجدد</h2>
        <span className="text-xs text-muted-foreground">{period}</span>
      </div>
      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(var(--border))"
              strokeOpacity={0.5}
              vertical={false}
            />
            <XAxis
              dataKey="day"
              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                background: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                boxShadow: 'none',
                fontSize: '12px',
                direction: 'rtl',
              }}
              formatter={(value: number) => [`${value} مريض`, 'جدد']}
            />
            <Line
              type="monotone"
              dataKey="count"
              stroke="hsl(var(--primary))"
              strokeWidth={1.5}
              dot={{ r: 3, fill: 'hsl(var(--primary))' }}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
