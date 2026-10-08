export default function Loading() {
  return (
    <div className="w-full h-full flex flex-col gap-6 animate-pulse p-4">
      <div className="h-10 bg-muted/60 rounded-xl w-1/4"></div>
      <div className="h-64 bg-muted/30 rounded-2xl w-full border border-border"></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="h-32 bg-muted/30 rounded-2xl w-full border border-border"></div>
        <div className="h-32 bg-muted/30 rounded-2xl w-full border border-border"></div>
        <div className="h-32 bg-muted/30 rounded-2xl w-full border border-border"></div>
      </div>
    </div>
  )
}
