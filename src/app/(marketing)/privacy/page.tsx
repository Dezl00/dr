import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'سياسة الخصوصية | تطبيق عيادتي (Eyadaty) ومنصة DRS',
  description: 'سياسة الخصوصية وشروط معالجة البيانات لتطبيق عيادتي (com.eyadaty.app) ومنصة إدارة العيادات DRS التابعة لمجموعة بيوند (Beyoond Group).',
}

export const dynamic = 'force-dynamic'

export default function PrivacyPolicyPage() {
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
        <div className="space-y-8">
          {/* Title Box */}
          <div className="border-b pb-8">
            <div className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary mb-3">
              وثيقة معتمدة لمتجر Google Play
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground mb-3">
              سياسة الخصوصية (Privacy Policy)
            </h1>
            <p className="text-muted-foreground text-sm">
              لتطبيق <strong>عيادتي (Eyadaty)</strong> ومُعرّف الحزمة <strong>(com.eyadaty.app)</strong> ومنظومة DRS الطبية
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              تاريخ آخر تحديث: {lastUpdated}
            </p>
          </div>

          {/* Section 1: المقدمة */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">1. مقدمة ونطاق التطبيق</h2>
            <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
              نرحب بكم في تطبيق <strong>عيادتي (Eyadaty)</strong> التابع لمنصة <strong>DRS</strong> والمُشغل بواسطة <strong>مجموعة بيوند (Beyoond Group)</strong>. نحن نلتزم بأعلى معايير حماية الخصوصية والأمان لبيانات مستخدمينا، بما في ذلك أطباء الأسنان، مسؤولي المراكز الطبية، والمرضى. توضح هذه السياسة كيفية جمع البيانات، واستخدامها، وحمايتها، وحقوق المستخدمين المتعلقة بها وفقاً لسياسات Google Play ومتطلبات القوانين الدولية لحماية البيانات.
            </p>
            <div className="rounded-lg bg-muted/40 p-3 text-xs sm:text-sm text-muted-foreground border">
              • اسم التطبيق على المتجر: <strong>عيادتي (Eyadaty)</strong><br />
              • معرف الحزمة (Application ID / Package Name): <code className="text-primary font-mono font-semibold">com.eyadaty.app</code><br />
              • الجهة المطورة: <strong>Beyoond Group</strong> (<a href="https://beyoondgroup.com" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">beyoondgroup.com</a>)
            </div>
          </section>

          {/* Section 2: البيانات التي نجمعها */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">2. البيانات التي نقوم بجمعها</h2>
            <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
              نقوم بجمع الحد الأدنى والضروري من البيانات لتشغيل الخدمة الطبية والإدارية بنجاح:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground text-sm sm:text-base pr-2">
              <li>
                <strong className="text-foreground">بيانات الحساب الشخصي:</strong> الاسم الكامل، البريد الإلكتروني، رقم الهاتف، والدور الوظيفي داخل العيادة.
              </li>
              <li>
                <strong className="text-foreground">بيانات العيادة وإدارتها:</strong> اسم العيادة، العنوان، التخصصات الطبية، مواعيد العمل، وقائمة الخدمات والأسعار.
              </li>
              <li>
                <strong className="text-foreground">سجلات المرضى والمواعيد:</strong> الاسم، رقم الهاتف، المواعيد المجدولة، الزيارات السابقة، والملفات أو السجلات الطبية المدخلة بمعرفة الطبيب المعالج لأغراض الرعاية الصحية.
              </li>
              <li>
                <strong className="text-foreground">معلومات الأجهزة وسجلات التشغيل:</strong> نوع الجهاز، إصدار نظام التشغيل، ومعرف رمز الإشعارات (Firebase Cloud Messaging Token) لإرسال التنبيهات الطبية والإدارية.
              </li>
            </ul>
          </section>

          {/* Section 3: الأذونات المطلوبة على الهاتف */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">3. أذونات الجهاز (Device Permissions)</h2>
            <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
              يطلب التطبيق بعض الأذونات الأساسية التي لا تُستخدم إلا بعد موافقة صريحة من المستخدم ولأغراض محددة بدقة:
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="border rounded-xl p-4 bg-card">
                <h3 className="font-semibold text-foreground text-sm mb-1">📷 الكاميرا ومكتبة الصور (Camera & Storage)</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  تُستخدم فقط للسماح للطبيب أو المستخدم برفع صور الأشعة السينية، المستندات الطبية للمرضى، أو صورة الملف الشخصي وشعار العيادة. لا يتم الوصول لأي صور شخصية أخرى.
                </p>
              </div>
              <div className="border rounded-xl p-4 bg-card">
                <h3 className="font-semibold text-foreground text-sm mb-1">🔔 الإشعارات الفورية (Push Notifications)</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  لإعلام الطبيب بالمواعيد الجديدة، تذكيرات الحجوزات، وحالات المرضى في الوقت الفعلي.
                </p>
              </div>
              <div className="border rounded-xl p-4 bg-card">
                <h3 className="font-semibold text-foreground text-sm mb-1">🌐 الاتصال بالإنترنت (Internet Access)</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  لمزامنة البيانات السحابية الآمنة مع خوادم النظام المشفرة وتقديم تجربة سلسة.
                </p>
              </div>
              <div className="border rounded-xl p-4 bg-card">
                <h3 className="font-semibold text-foreground text-sm mb-1">💾 التخزين المحلي المشفر (Encrypted Local Cache)</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  حفظ البيانات على ذاكرة الجهاز باستخدام خوارزميات التشفير (AES) لتوفير وضع عدم الاتصال (Offline Mode) دون المساس بالأمان.
                </p>
              </div>
            </div>
          </section>

          {/* Section 4: كيفية استخدام البيانات */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">4. كيفية استخدام البيانات</h2>
            <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
              تُستخدم البيانات المجمعة للأغراض التالية حصراً:
            </p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground text-sm sm:text-base pr-2">
              <li>تسهيل إدارة حجوزات المرضى وتنظيم جدول مواعيد الأطباء.</li>
              <li>إرسال رسائل تذكير تلقائية عبر الرسائل النصية القصيرة (SMS) أو الإشعارات للمرضى.</li>
              <li>إصدار الفواتير وتنظيم الحسابات وسجلات المخزون الخاصة بالعيادة.</li>
              <li>تأمين الحسابات ومنع الدخول غير المصرح به والتحقق من الهوية عبر الرمز السري (OTP).</li>
            </ul>
          </section>

          {/* Section 5: مشاركة البيانات مع أطراف ثالثة */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">5. مشاركة البيانات مع أطراف ثالثة</h2>
            <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
              <strong>نحن لا نقوم مطلقاً ببيع، تأجير، أو المتاجرة ببياناتكم أو بيانات مرضاكم لأي جهات تسويقية أو إعلانية.</strong> تتم مشاركة البيانات فقط مع مزودي الخدمات الأساسية الضرورية للتشغيل:
            </p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground text-sm sm:text-base pr-2">
              <li><strong>Google Firebase:</strong> لإرسال الإشعارات وتتبع استقرار وأخطاء التطبيق (Crashlytics).</li>
              <li><strong>مزودو بوابات الرسائل القصيرة (SMS Gateway):</strong> لإيصال رسائل تأكيد وتذكير المواعيد للمرضى.</li>
              <li><strong>الجهات القانونية:</strong> فقط عند وجود أمر قضائي رسمي وملزم بموجب القانون المعمول به.</li>
            </ul>
          </section>

          {/* Section 6: أمن وحماية البيانات */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">6. أمن وحماية البيانات (Data Security)</h2>
            <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
              نطبق أعلى المعايير التقنية والمؤسسية لحماية البيانات الطبية والشخصية:
            </p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground text-sm sm:text-base pr-2">
              <li>تشفير شامل لجميع البيانات المنقولة عبر بروتوكولات الأمان القياسية (HTTPS / TLS 1.3).</li>
              <li>تشفير كلمات المرور باستخدام خوارزميات التجزئة القوية (Argon2 / Bcrypt).</li>
              <li>عزل كامل لقواعد البيانات وبيانات كل عيادة في بيئة سحابية معزولة (Multi-Tenant Isolation).</li>
              <li>تشفير البيانات المخزنة محلياً على الهاتف بمفتاح تشفير آمن في (Android Keystore / Secure Storage).</li>
            </ul>
          </section>

          {/* Section 7: حذف الحساب والبيانات (مطلب أساسي لجوجل بلاي) */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">7. طلب حذف الحساب والبيانات (Data Deletion Policy)</h2>
            <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
              وفقاً لسياسة Google Play وحقوق حماية البيانات، يحق لأي مستخدم أو طبيب مسجل طلب حذف حسابه وكافة بياناته المرتبطة به نهائياً من خوادمنا في أي وقت:
            </p>
            <div className="rounded-xl border p-4 bg-muted/20 space-y-2 text-sm sm:text-base">
              <p className="font-semibold text-foreground">طريقة طلب الحذف:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground pr-2">
                <li>من خلال التطبيق: الانتقال إلى صفحة <strong>المزيد &gt; إعدادات الحساب &gt; حذف الحساب نهائياً</strong>.</li>
                <li>من خلال صفحة الويب المخصصة لطلب الحذف: <Link href="/delete-account" className="text-primary font-semibold hover:underline">صفحة طلب حذف الحساب والبيانات</Link>.</li>
                <li>أو عبر إرسال بريد إلكتروني مباشر إلى: <a href="mailto:mohamedalshobaky27@gmail.com" className="text-primary font-semibold hover:underline">mohamedalshobaky27@gmail.com</a> بعنوان &quot;طلب حذف حساب وبيانات عيادتي&quot;.</li>
              </ul>
              <p className="text-xs text-muted-foreground mt-2">
                عند تقديم الطلب، يتم جدولة الحذف النهائي للحساب وبيانات العيادة والموقع خلال 15 يوماً، مع إمكانية إلغاء الطلب في أي وقت بتسجيل الدخول مجدداً خلال هذه الفترة.
              </p>
            </div>
          </section>

          {/* Section 8: خصوصية الأطفال */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">8. خصوصية الأطفال (Children&apos;s Privacy)</h2>
            <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
              التطبيق مخصص للكوادر الطبية والإدارية ولا يستهدف الأطفال دون سن 13 عاماً بشكل مباشر. وفي حال إدراج بيانات طبية لأطفال قصر كمراجعين في العيادة، فإن ذلك يتم بمسؤولية الطبيب المعالج وبموافقة ولي الأمر أو الوصي القانوني.
            </p>
          </section>

          {/* Section 9: التعديلات على السياسة */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">9. التعديلات على هذه السياسة</h2>
            <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
              قد نقوم بتحديث سياسة الخصوصية من وقت لآخر لتعكس التحسينات التقنية أو التغييرات التنظيمية. سنقوم بإشعار المستخدمين بأي تغييرات جوهرية عبر نشر السياسة المحدثة على هذه الصفحة مع تحديث تاريخ المراجعة.
            </p>
          </section>

          {/* Section 10: التواصل معنا */}
          <section className="space-y-3 border-t pt-8">
            <h2 className="text-xl font-bold text-foreground">10. التواصل معنا (Contact Us)</h2>
            <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
              إذا كانت لديك أي استفسارات أو ملاحظات بخصوص سياسة الخصوصية أو ممارسات معالجة البيانات، يسعدنا تواصلك معنا:
            </p>
            <div className="space-y-1 text-sm sm:text-base text-muted-foreground">
              <p>• الشركة المشغلة: <strong>مجموعة بيوند (Beyoond Group)</strong></p>
              <p>• البريد الإلكتروني للخصوصية: <a href="mailto:privacy@beyoondgroup.com" className="text-primary hover:underline">privacy@beyoondgroup.com</a></p>
              <p>• الدعم الفني: <a href="mailto:support@beyoondgroup.com" className="text-primary hover:underline">support@beyoondgroup.com</a></p>
              <p>• الموقع الرسمي: <a href="https://beyoondgroup.com" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">https://beyoondgroup.com</a></p>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t bg-muted/30 py-8">
        <div className="container mx-auto max-w-5xl px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between text-center gap-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} عيادتي (Eyadaty) - منظومة DRS. جميع الحقوق محفوظة لمجموعة بيوند.</p>
          <div className="flex gap-4">
            <Link href="/" className="hover:underline">الرئيسية</Link>
            <Link href="/privacy" className="hover:underline font-semibold text-foreground">سياسة الخصوصية</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
