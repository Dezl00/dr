import { requireAuth } from '@/lib/auth/dal'
import { prisma } from '@/lib/db/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { BackButton } from '@/components/ui/back-button'
import { SubmitButton } from '@/components/ui/submit-button'

async function updateNotificationSettings(formData: FormData) {
  'use server'
  const user = await requireAuth()
  
  const clinicId = formData.get('clinicId') as string
  if (!clinicId) throw new Error('Clinic not found')

  const notifyBookingConfirmation = formData.get('notifyBookingConfirmation') === 'on'
  const notifyBookingCancellation = formData.get('notifyBookingCancellation') === 'on'
  const notifyVisitCompletion = formData.get('notifyVisitCompletion') === 'on'
  const notifyAppointmentReminder = formData.get('notifyAppointmentReminder') === 'on'
  const reminderHoursBefore = parseInt(formData.get('reminderHoursBefore') as string || '24', 10)

  await prisma.clinicSettings.update({
    where: { clinicId },
    data: {
      notifyBookingConfirmation,
      notifyBookingCancellation,
      notifyVisitCompletion,
      notifyAppointmentReminder,
      reminderHoursBefore,
    }
  })

  revalidatePath('/dashboard/settings/notifications')
  redirect('/dashboard/settings')
}

export default async function NotificationSettingsPage() {
  const user = await requireAuth()
  const membership = await prisma.clinicMembership.findFirst({
    where: { userId: user.id, status: 'ACTIVE' },
    include: { clinic: { include: { settings: true } } }
  })

  if (!membership?.clinic) redirect('/dashboard')
  const settings = membership.clinic.settings

  return (
    <div className="max-w-2xl">
      <form action={updateNotificationSettings} className="space-y-6">
        <input type="hidden" name="clinicId" value={membership.clinicId} />
        
        <div className="space-y-4">
          <label className="flex items-center justify-between cursor-pointer p-4 border rounded-lg hover:bg-accent/50 transition-colors">
            <div>
              <p className="font-medium">تأكيد الحجز</p>
              <p className="text-sm text-muted-foreground">إرسال رسالة نصية للمريض عند تأكيد حجز موعد جديد</p>
            </div>
            <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-muted-foreground/30 transition-colors has-[:checked]:bg-primary">
              <input type="checkbox" name="notifyBookingConfirmation" className="peer sr-only" defaultChecked={settings?.notifyBookingConfirmation ?? true} />
              <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform rtl:-translate-x-1 rtl:peer-checked:-translate-x-6" />
            </div>
          </label>

          <label className="flex items-center justify-between cursor-pointer p-4 border rounded-lg hover:bg-accent/50 transition-colors">
            <div>
              <p className="font-medium">إلغاء الحجز</p>
              <p className="text-sm text-muted-foreground">إرسال رسالة عند إلغاء الموعد</p>
            </div>
            <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-muted-foreground/30 transition-colors has-[:checked]:bg-primary">
              <input type="checkbox" name="notifyBookingCancellation" className="peer sr-only" defaultChecked={settings?.notifyBookingCancellation ?? true} />
              <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform rtl:-translate-x-1 rtl:peer-checked:-translate-x-6" />
            </div>
          </label>

          <label className="flex items-center justify-between cursor-pointer p-4 border rounded-lg hover:bg-accent/50 transition-colors">
            <div>
              <p className="font-medium">انتهاء الزيارة (رسالة شكر)</p>
              <p className="text-sm text-muted-foreground">إرسال رسالة شكر عند اكتمال الزيارة</p>
            </div>
            <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-muted-foreground/30 transition-colors has-[:checked]:bg-primary">
              <input type="checkbox" name="notifyVisitCompletion" className="peer sr-only" defaultChecked={settings?.notifyVisitCompletion ?? true} />
              <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform rtl:-translate-x-1 rtl:peer-checked:-translate-x-6" />
            </div>
          </label>
        </div>

        <div className="border-t pt-6 space-y-4">
          <label className="flex items-center justify-between cursor-pointer p-4 border rounded-lg hover:bg-accent/50 transition-colors">
            <div>
              <p className="font-medium">تذكير قبل الموعد</p>
              <p className="text-sm text-muted-foreground">تذكير المريض بموعده القادم</p>
            </div>
            <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-muted-foreground/30 transition-colors has-[:checked]:bg-primary">
              <input type="checkbox" name="notifyAppointmentReminder" className="peer sr-only peer/reminder" defaultChecked={settings?.notifyAppointmentReminder ?? true} />
              <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform rtl:-translate-x-1 rtl:peer-checked:-translate-x-6" />
            </div>
          </label>
          
          <div className="pl-4 pr-4">
            <p className="text-sm font-medium mb-2">وقت إرسال التذكير</p>
            <div className="flex gap-4">
              {[4, 8, 12, 24].map(hours => (
                <label key={hours} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input 
                    type="radio" 
                    name="reminderHoursBefore" 
                    value={hours} 
                    defaultChecked={(settings?.reminderHoursBefore || 24) === hours}
                    className="accent-primary w-4 h-4"
                  />
                  قبل {hours} ساعات
                </label>
              ))}
            </div>
          </div>
        </div>
        
        <SubmitButton label="حفظ الإعدادات" loadingLabel="جاري الحفظ..." />
      </form>
    </div>
  )
}
