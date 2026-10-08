import { requireAuth, getCurrentSession } from '@/lib/auth/dal'
import { prisma } from '@/lib/db/prisma'
import { MessageCircle, Search, Users, UserPlus, Send, Mail } from 'lucide-react'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'
import Link from 'next/link'

export const metadata = {
  title: 'علاقات المرضى (CRM) | DRS',
}

async function getClinicId() {
  const user = await requireAuth()
  const { session } = await getCurrentSession()
  if (user.isAdmin && session?.adminAccessClinicId) return session.adminAccessClinicId
  const membership = await prisma.clinicMembership.findFirst({
    where: { userId: user.id, status: 'ACTIVE' },
    select: { clinicId: true },
  })
  return membership?.clinicId || ''
}

export default async function CRMPage() {
  const clinicId = await getClinicId()

  const [leads, patientsCount] = await Promise.all([
    prisma.lead.findMany({
      where: { clinicId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    }),
    prisma.patient.count({
      where: { clinicId }
    })
  ])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold">إدارة علاقات المرضى (CRM)</h1>
          <p className="mt-1 text-sm text-muted-foreground">العملاء المحتملين والتواصل المباشر (SMS / WhatsApp)</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/crm/new" className="inline-flex items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors hover:bg-accent">
            <UserPlus className="h-4 w-4" strokeWidth={1.5} />
            إضافة عميل محتمل
          </Link>
          <button className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#25D366] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#25D366]/90">
            <MessageCircle className="h-4 w-4" strokeWidth={1.5} />
            حملة واتساب
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-6 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Users className="h-6 w-6" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">إجمالي المرضى الفعليين</p>
            <h3 className="text-2xl font-semibold mt-1 text-foreground">{patientsCount}</h3>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
            <UserPlus className="h-6 w-6" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">العملاء المحتملين (Leads)</p>
            <h3 className="text-2xl font-semibold mt-1 text-foreground">{leads.length}</h3>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-500/10 text-purple-500">
            <Mail className="h-6 w-6" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">الرسائل التلقائية</p>
            <h3 className="text-lg font-semibold mt-1 text-foreground">نشط (تذكير المواعيد)</h3>
          </div>
        </div>
      </div>

      {/* Leads Section */}
      <div>
        <h2 className="text-lg font-semibold mb-4">العملاء المحتملين الجدد (Leads)</h2>
        {leads.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-12 text-center">
            <p className="text-base text-muted-foreground">لا يوجد عملاء محتملين حالياً. قم بربط استمارة حجز الموقع الإلكتروني.</p>
          </div>
        ) : (
          <div className="hidden overflow-hidden rounded-xl border border-border bg-card sm:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-5 py-3.5 text-start font-medium text-muted-foreground">الاسم</th>
                  <th className="px-5 py-3.5 text-start font-medium text-muted-foreground">رقم الهاتف</th>
                  <th className="px-5 py-3.5 text-start font-medium text-muted-foreground">المصدر</th>
                  <th className="px-5 py-3.5 text-start font-medium text-muted-foreground">تاريخ التسجيل</th>
                  <th className="px-5 py-3.5 text-start font-medium text-muted-foreground">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {leads.map((lead) => (
                  <tr key={lead.id} className="transition-colors duration-150 hover:bg-accent/50">
                    <td className="px-5 py-3.5 font-medium">{lead.fullName}</td>
                    <td className="px-5 py-3.5 text-muted-foreground" dir="ltr">{lead.phone}</td>
                    <td className="px-5 py-3.5 text-muted-foreground">{lead.source || 'الموقع الإلكتروني'}</td>
                    <td className="px-5 py-3.5 text-muted-foreground">
                      {format(new Date(lead.createdAt), 'dd MMMM yyyy', { locale: ar })}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        lead.status === 'NEW' ? 'bg-blue-100 text-blue-700' :
                        lead.status === 'CONTACTED' ? 'bg-amber-100 text-amber-700' :
                        lead.status === 'CONVERTED' ? 'bg-green-100 text-green-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {lead.status === 'NEW' ? 'جديد' : 
                         lead.status === 'CONTACTED' ? 'تم التواصل' : 
                         lead.status === 'CONVERTED' ? 'تحول لمريض' : 'مرفوض'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
