export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="relative flex h-16 w-16 items-center justify-center text-blue-600">
        {/* Outer circle */}
        <svg className="absolute inset-0 h-full w-full animate-[spin_1.5s_linear_infinite]" viewBox="0 0 50 50">
          <circle cx="25" cy="25" r="20" fill="none" strokeWidth="4" stroke="currentColor" strokeDasharray="35 90" strokeLinecap="round" />
        </svg>
        {/* Inner circle (opposite rotation, smaller radius, same stroke width) */}
        <svg className="absolute inset-0 h-full w-full animate-[spin_1s_linear_infinite_reverse]" viewBox="0 0 50 50">
          <circle cx="25" cy="25" r="13" fill="none" strokeWidth="4" stroke="currentColor" strokeDasharray="25 60" strokeLinecap="round" opacity="0.6" />
        </svg>
      </div>
    </div>
  )
}
