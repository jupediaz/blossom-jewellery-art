export default function ProductsLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="h-8 w-48 bg-cream-dark rounded animate-pulse mb-8" />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <div className="aspect-square bg-cream-dark rounded-lg animate-pulse" />
            <div className="h-4 w-3/4 bg-cream-dark rounded animate-pulse" />
            <div className="h-4 w-1/3 bg-cream-dark rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
