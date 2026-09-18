import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-primary">DRS</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium hover:text-primary transition-colors">
              تسجيل الدخول
            </Link>
            <Link
              href="/signup"
              className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
            >
              انشئ عيادتك الآن
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 w-full flex flex-col items-center">
        {/* Hero Section */}
        <section className="w-full py-20 md:py-32 lg:py-40 bg-muted/20 border-b border-border">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6">
            <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl text-foreground mb-6">
                المنصة الأذكى لإدارة عيادات الأسنان
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-10 leading-relaxed">
                نظام سحابي متكامل يجمع بين إدارة المرضى، المواعيد، الحسابات، وموقع إلكتروني خاص بعيادتك في مكان واحد، لتتفرغ أنت للعناية بمرضاك.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center">
                <Link
                  href="/signup"
                  className="inline-flex h-12 items-center justify-center rounded-lg bg-primary px-8 text-base font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 w-full sm:w-auto"
                >
                  ابدأ مجاناً الآن
                </Link>
                <Link
                  href="/login"
                  className="inline-flex h-12 items-center justify-center rounded-lg border border-input bg-background px-8 text-base font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground w-full sm:w-auto"
                >
                  تسجيل الدخول للعيادات
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full py-16 md:py-24 lg:py-32">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6">
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {/* Feature 1 */}
              <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-card border border-border shadow-sm">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-6">
                  <svg className="h-8 w-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                </div>
                <h3 className="text-xl font-bold mb-3">إدارة المواعيد</h3>
                <p className="text-muted-foreground leading-relaxed">جدول مواعيد ذكي يمنع التعارض وينظم وقت الأطباء بكل سهولة مع تنبيهات تلقائية.</p>
              </div>
              
              {/* Feature 2 */}
              <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-card border border-border shadow-sm">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-6">
                  <svg className="h-8 w-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path></svg>
                </div>
                <h3 className="text-xl font-bold mb-3">موقع خاص بعيادتك</h3>
                <p className="text-muted-foreground leading-relaxed">احصل على موقع إلكتروني احترافي لعيادتك تلقائياً وبدومين خاص (Subdomain).</p>
              </div>

              {/* Feature 3 */}
              <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-card border border-border shadow-sm sm:col-span-2 lg:col-span-1">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-6">
                  <svg className="h-8 w-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                </div>
                <h3 className="text-xl font-bold mb-3">ملفات المرضى</h3>
                <p className="text-muted-foreground leading-relaxed">سجل طبي إلكتروني كامل لكل مريض شامل الأشعة والخطط العلاجية والتاريخ الطبي.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full border-t bg-background py-8">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 flex flex-col items-center justify-center text-center">
          <p className="text-sm text-muted-foreground font-medium">
            &copy; {new Date().getFullYear()} منصة DRS لإدارة عيادات الأسنان. جميع الحقوق محفوظة.
          </p>
        </div>
      </footer>
    </div>
  )
}
