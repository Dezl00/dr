'use client'

import { useState } from 'react'

export function DeleteAccountForm() {
  const [email, setEmail] = useState('')
  const [reason, setReason] = useState('لم أعد بحاجة للخدمة')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const reasons = [
    'لم أعد بحاجة للخدمة',
    'واجهت صعوبة في استخدام التطبيق',
    'الانتقال لنظام أو برنامج آخر',
    'أسباب تتعلق بالتكلفة أو الخصوصية',
    'سبب آخر',
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!email || !email.includes('@')) {
      setError('يرجى إدخال عنوان بريد إلكتروني صحيح.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/v1/auth/delete-account-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, reason, notes }),
      })

      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'حدث خطأ أثناء إرسال الطلب.')
      }

      setSuccess(
        'تم استلام طلب حذف الحساب بنجاح. سيتم مراجعة الطلب وحذف الحساب وبيانات العيادة نهائياً خلال 15 يوماً ما لم تقم بتسجيل الدخول مرة أخرى لإلغاء الطلب.'
      )
      setEmail('')
      setNotes('')
    } catch (err: any) {
      setError(err.message || 'حدث خطأ في الاتصال بالخادم، يرجى المحاولة لاحقاً.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-2xl border bg-card p-6 sm:p-8 shadow-sm">
      <div className="mb-6 border-b pb-4">
        <h3 className="text-xl font-bold text-foreground">
          نموذج إرسال طلب حذف الحساب
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          يرجى تعبئة النموذج بالبريد الإلكتروني المسجل به حسابك لإتمام طلب الحذف.
        </p>
      </div>

      {success ? (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 p-5 text-emerald-800 dark:text-emerald-200">
          <div className="flex items-center gap-3 mb-2">
            <svg
              className="h-6 w-6 text-emerald-600 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h4 className="font-bold text-base">تم تسجيل طلب الحذف بنجاح</h4>
          </div>
          <p className="text-sm leading-relaxed">{success}</p>
          <button
            type="button"
            onClick={() => setSuccess(null)}
            className="mt-4 inline-flex items-center text-xs font-semibold text-emerald-700 dark:text-emerald-300 hover:underline"
          >
            إرسال طلب آخر
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="rounded-lg border border-red-500/30 bg-red-50/50 dark:bg-red-950/20 p-4 text-sm text-red-700 dark:text-red-300">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-foreground mb-1.5">
              البريد الإلكتروني المسجل في التطبيق <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="doctor@example.com"
              dir="ltr"
              className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary text-left"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-1.5">
              سبب طلب الحذف <span className="text-red-500">*</span>
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {reasons.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-1.5">
              ملاحظات أو تفاصيل إضافية <span className="text-xs text-muted-foreground font-normal">(اختياري)</span>
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="أخبرنا كيف يمكننا تحسين التطبيق، أو سبب رغبتك في حذف الحساب..."
              className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="rounded-lg bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/50 p-3.5 text-xs text-amber-800 dark:text-amber-200 leading-relaxed">
            ⚠️ <strong>ملاحظة هامة:</strong> بعد تقديم هذا النموذج، ستدخل فترة سماح لمدة <strong>15 يوماً</strong> قبل حذف كافة بياناتك وعيادتك والموقع الخاص بك نهائياً. يمكنك إلغاء الطلب في أي وقت خلال هذه الفترة ببساطة عن طريق تسجيل الدخول مرة أخرى للتطبيق.
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center rounded-xl bg-red-600 px-6 py-3.5 text-sm font-bold text-white shadow transition-colors hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                جارٍ إرسال الطلب...
              </span>
            ) : (
              'تأكيد إرسال طلب حذف الحساب'
            )}
          </button>
        </form>
      )}
    </div>
  )
}
