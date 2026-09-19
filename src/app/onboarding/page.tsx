import { redirect } from 'next/navigation'
import { requireAuth } from '@/lib/auth/dal'
import { prisma } from '@/lib/db/prisma'
import { cookies } from 'next/headers'

export default async function OnboardingPage() {
  const user = await requireAuth()

  const membership = await prisma.clinicMembership.findFirst({
    where: { userId: user.id, status: 'ACTIVE' },
  })

  if (membership) {
    redirect('/dashboard')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FAFAFA]" dir="rtl">
      <div className="max-w-md w-full p-8 bg-[#FFFFFF] rounded-xl border border-[#E5E7EB] text-center">
        <h1 className="text-2xl font-semibold text-[#000000] mb-4">أهلاً بك في منصة DRS</h1>
        <p className="text-[#050505] font-normal mb-6">
          حسابك ليس مرتبطاً بأي عيادة حالياً. يرجى تسجيل الخروج وإنشاء حساب وعيادة جديدة.
        </p>
        <div className="space-y-4">
          <form action={async () => {
            'use server'
            const cookieStore = await cookies()
            cookieStore.delete('session')
            cookieStore.delete('__Host-session')
            redirect('/login')
          }}>
            <button type="submit" className="w-full py-2.5 px-4 bg-[#000000] text-[#FFFFFF] rounded-lg font-medium hover:bg-[#050505] transition-colors">
              تسجيل الخروج والعودة
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
