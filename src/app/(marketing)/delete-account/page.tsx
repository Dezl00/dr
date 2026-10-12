import Link from 'next/link'
import type { Metadata } from 'next'
import { DeleteAccountForm } from './delete-account-form'

export const metadata: Metadata = {
  title: 'طلب حذف الحساب والبيانات – عيادتي',
  description: 'صفحة طلب حذف الحساب والبيانات الشخصية لتطبيق عيادتي ومنظومة DRS وفقاً لسياسات متجر Google Play.',
}

export const dynamic = 'force-dynamic'

export default function DeleteAccountPage() {
  const lastUpdated = '12 أكتوبر 2026'

  return (
    <div className="flex min-h-screen flex-col font-sans bg-background text-foreground" dir="rtl">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-primary">عيادتي | DRS</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              الرئيسية
            </Link>
            <Link
              href="/privacy"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              سياسة الخصوصية
            </Link>
            <Link
              href="/login"
              className="text-sm font-medium text-primary hover:underline"
            >
              تسجيل الدخول
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto max-w-4xl px-4 sm:px-6 py-12 md:py-16">
        <div className="space-y-10">
          {/* Header Title */}
          <div className="border-b pb-8">
            <div className="inline-block rounded-full bg-red-100 dark:bg-red-950/40 px-4 py-1.5 text-xs font-semibold text-red-600 dark:text-red-400 mb-3">
              إدارة الحساب والبيانات | متجر Google Play
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground mb-4">
              طلب حذف الحساب والبيانات – عيادتي
            </h1>
            <p className="text-muted-foreground leading-relaxed text-base sm:text-lg">
              نحن في تطبيق <strong>عيادتي</strong> نحترم خصوصية المستخدمين ونمنحهم الحق في طلب حذف حساباتهم والبيانات الشخصية المرتبطة بها.
            </p>
            <p className="text-xs text-muted-foreground mt-3">
              آخر تحديث: {lastUpdated}
            </p>
          </div>

          {/* How to delete account */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">
              كيفية طلب حذف الحساب
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
              لحذف حسابك في تطبيق عيادتي، يُرجى اتباع الخطوات التالية:
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border bg-card p-4">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs mb-2">
                  1
                </span>
                <p className="text-sm text-foreground font-medium">
                  أدخل عنوان البريد الإلكتروني المسجّل به حسابك في التطبيق.
                </p>
              </div>
              <div className="rounded-xl border bg-card p-4">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs mb-2">
                  2
                </span>
                <p className="text-sm text-foreground font-medium">
                  أرسل طلب حذف الحساب من خلال نموذج الطلب الموجود في هذه الصفحة.
                </p>
              </div>
              <div className="rounded-xl border bg-card p-4">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs mb-2">
                  3
                </span>
                <p className="text-sm text-foreground font-medium">
                  سنراجع الطلب ونتحقق من ملكية الحساب عند الحاجة.
                </p>
              </div>
              <div className="rounded-xl border bg-card p-4">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs mb-2">
                  4
                </span>
                <p className="text-sm text-foreground font-medium">
                  سنرسل تأكيدًا إلى بريدك الإلكتروني عند استلام الطلب، ثم عند اكتمال الحذف.
                </p>
              </div>
            </div>
          </section>

          {/* Interactive Form */}
          <section className="space-y-4">
            <DeleteAccountForm />
          </section>

          {/* What data will be deleted */}
          <section className="space-y-3">
            <h2 className="text-2xl font-bold text-foreground">
              ما البيانات التي سيتم حذفها؟
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
              عند الموافقة على طلب الحذف، سنحذف الحساب والبيانات الشخصية المرتبطة به، وفقًا لطبيعة البيانات التي يحتفظ بها التطبيق، مثل:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground text-sm sm:text-base pr-2">
              <li>عنوان البريد الإلكتروني وبيانات الملف الشخصي.</li>
              <li>بيانات الحساب وإعداداته.</li>
              <li>بيانات العيادة المسجلة، الموقع الإلكتروني الفرعي، والخدمات وقوائم الأطباء.</li>
              <li>بيانات أخرى مرتبطة بالحساب، متى كان حذفها مطلوبًا ولا يوجد التزام قانوني بالاحتفاظ بها.</li>
            </ul>
          </section>

          {/* What data may be retained */}
          <section className="space-y-3">
            <h2 className="text-2xl font-bold text-foreground">
              البيانات التي قد يتم الاحتفاظ بها
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
              قد نحتفظ ببعض البيانات لفترة محدودة إذا كان ذلك مطلوبًا بموجب القانون أو لأغراض أمنية أو لمنع الاحتيال، مع تقييد استخدامها وحذفها عند انتهاء سبب الاحتفاظ بها.
            </p>
          </section>

          {/* Timeframe */}
          <section className="space-y-3">
            <h2 className="text-2xl font-bold text-foreground">
              المدة اللازمة لتنفيذ الطلب
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
              سنوضح للمستخدم المدة المتوقعة لمعالجة طلب الحذف، وسنبلغه عند اكتمال العملية أو إذا احتجنا إلى معلومات إضافية.
            </p>
            <div className="rounded-xl border bg-muted/30 p-4 text-sm text-muted-foreground leading-relaxed">
              💡 <strong>مهلة الـ 15 يوماً للتراجع:</strong> يتم حذف الحساب والبيانات نهائياً خلال <strong>15 يوماً</strong> من تاريخ تقديم الطلب. وخلال هذه الفترة، إذا قام المستخدم بتسجيل الدخول مرة أخرى إلى حسابه في التطبيق، فسيتم تلقائياً إلغاء طلب الحذف واستعادة الحساب كحساب نشط.
            </div>
          </section>

          {/* Contact Us */}
          <section className="space-y-4 border-t pt-8">
            <h2 className="text-2xl font-bold text-foreground">
              التواصل معنا
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
              إذا كانت لديك أسئلة بخصوص حذف حسابك أو بياناتك، يمكنك التواصل معنا عبر:
            </p>
            <div className="rounded-xl border bg-card p-5 space-y-2 text-sm sm:text-base">
              <p>
                <strong>البريد الإلكتروني للدعم:</strong>{' '}
                <a
                  href="mailto:mohamedalshobaky27@gmail.com"
                  className="text-primary font-semibold hover:underline"
                >
                  mohamedalshobaky27@gmail.com
                </a>
              </p>
              <p>
                <strong>اسم التطبيق:</strong> عيادتي
              </p>
              <p>
                <strong>معرف الحزمة (Package ID):</strong>{' '}
                <code className="text-xs bg-muted px-2 py-0.5 rounded font-mono">
                  com.eyadaty.app
                </code>
              </p>
              <p className="text-xs text-muted-foreground pt-1">
                آخر تحديث: {lastUpdated}
              </p>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t bg-background py-8">
        <div className="container mx-auto max-w-5xl px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-right">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} تطبيق عيادتي – منصة DRS. جميع الحقوق محفوظة.
          </p>
          <div className="flex items-center gap-4 text-xs">
            <Link href="/privacy" className="text-muted-foreground hover:text-foreground">
              سياسة الخصوصية
            </Link>
            <Link href="/" className="text-muted-foreground hover:text-foreground">
              الرئيسية
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
