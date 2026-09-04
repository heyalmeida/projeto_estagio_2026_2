export default function AdminLoading() {
  return (
    <div className="space-y-6" aria-busy>
      <div className="card h-12 animate-pulse bg-charcoal-200/40" />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card h-20 animate-pulse bg-charcoal-200/40" />
        ))}
      </div>
      <div className="card h-16 animate-pulse bg-charcoal-200/40" />
      <div className="card h-64 animate-pulse bg-charcoal-200/40" />
    </div>
  );
}