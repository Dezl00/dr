interface SiteFooterProps {
  clinicName: string
}

export function SiteFooter({ clinicName }: SiteFooterProps) {
  return (
    <footer className="border-t border-[#E5E7EB] bg-[#FAFAFA] py-12">
      <div className="mx-auto max-w-7xl px-4 text-center sm:px-6">
        <p className="text-sm text-[#050505] font-normal">
          © {new Date().getFullYear()} {clinicName}. جميع الحقوق محفوظة.
        </p>
        <p className="mt-2 text-xs font-normal opacity-50 text-[#050505]">
          مشغل بواسطة منصة DRS
        </p>
      </div>
    </footer>
  )
}
