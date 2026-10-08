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
  const total = data.reduce((sum, d) => sum + d.count, 0)
  const isEmpty = total === 0
  
  const displayData = isEmpty ? [
    { day: 'السبت', count: 1 },
    { day: 'الأحد', count: 1 },
    { day: 'الإثنين', count: 1 },
    { day: 'الثلاثاء', count: 1 },
    { day: 'الأربعاء', count: 1 },
    { day: 'الخميس', count: 1 },
    { day: 'الجمعة', count: 1 },
  ] : data

  return (
    <div className="rounded-xl border border-border bg-card p-4 relative">
      <h2 className="text-section-title mb-4">المواعيد خلال آخر 7 أيام</h2>
      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={displayData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(var(--border))"
              strokeOpacity={isEmpty ? 0.2 : 0.5}
              vertical={false}
            />
            <XAxis
              dataKey="day"
              tick={{ fontSize: 11, fill: isEmpty ? 'hsl(var(--muted))' : 'hsl(var(--muted-foreground))' }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={isEmpty ? false : { fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            {!isEmpty && (
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
                cursor={{ fill: 'hsl(var(--accent))', opacity: 0.4 }}
              />
            )}
            <Bar
              dataKey="count"
              fill={isEmpty ? "hsl(var(--muted))" : "hsl(var(--primary))"}
              radius={[4, 4, 0, 0]}
              maxBarSize={32}
              isAnimationActive={!isEmpty}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      {isEmpty && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none mt-8">
          <p className="text-sm text-slate-400 font-medium">لا توجد بيانات</p>
        </div>
      )}
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
  const isEmpty = total === 0

  // If empty, display a dummy single slice with light gray
  const displayData = isEmpty ? [{ name: 'لا توجد بيانات', value: 1, color: '#F1F5F9' }] : data

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <h2 className="text-section-title mb-4">حالة المواعيد</h2>
      <div className="flex items-center gap-6">
        <div className="h-40 w-40 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={displayData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={65}
                dataKey="value"
                stroke="hsl(var(--background))"
                strokeWidth={2}
                isAnimationActive={!isEmpty}
              >
                {displayData.map((entry, index) => (
                  <Cell key={index} fill={entry.color || STATUS_CHART_COLORS[entry.name] || '#94a3b8'} />
                ))}
              </Pie>
              {!isEmpty && (
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
              )}
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-2">
          {isEmpty ? (
            <div className="flex items-center justify-center h-full">
              <span className="text-sm text-muted-foreground">لا توجد مواعيد حالياً</span>
            </div>
          ) : (
            <>
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
            </>
          )}
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
  const total = data.reduce((sum, d) => sum + d.count, 0)
  const isEmpty = total === 0
  
  const displayData = isEmpty ? [
    { day: 'السبت', count: 0 },
    { day: 'الأحد', count: 0 },
    { day: 'الإثنين', count: 0 },
    { day: 'الثلاثاء', count: 0 },
    { day: 'الأربعاء', count: 0 },
    { day: 'الخميس', count: 0 },
    { day: 'الجمعة', count: 0 },
  ] : data

  return (
    <div className="rounded-xl border border-border bg-card p-4 relative">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-section-title">المرضى الجدد</h2>
        <span className="text-xs text-muted-foreground">{period}</span>
      </div>
      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={displayData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(var(--border))"
              strokeOpacity={isEmpty ? 0.2 : 0.5}
              vertical={false}
            />
            <XAxis
              dataKey="day"
              tick={{ fontSize: 11, fill: isEmpty ? 'hsl(var(--muted))' : 'hsl(var(--muted-foreground))' }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={isEmpty ? false : { fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            {!isEmpty && (
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
            )}
            <Line
              type="monotone"
              dataKey="count"
              stroke={isEmpty ? "hsl(var(--muted))" : "hsl(var(--primary))"}
              strokeWidth={1.5}
              dot={isEmpty ? false : { r: 3, fill: 'hsl(var(--primary))' }}
              activeDot={isEmpty ? false : { r: 4 }}
              isAnimationActive={!isEmpty}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      {isEmpty && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none mt-8">
          <p className="text-sm text-slate-400 font-medium">لا توجد بيانات</p>
        </div>
      )}
    </div>
  )
}
