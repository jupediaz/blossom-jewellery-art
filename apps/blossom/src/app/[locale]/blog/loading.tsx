export default function BlogLoading() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="h-8 w-32 bg-cream-dark rounded animate-pulse mb-8" />
      <div className="space-y-8">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex gap-6">
            <div className="h-32 w-48 bg-cream-dark rounded-lg animate-pulse flex-shrink-0" />
            <div className="flex-1 space-y-3">
              <div className="h-5 w-3/4 bg-cream-dark rounded animate-pulse" />
              <div className="h-4 w-full bg-cream-dark rounded animate-pulse" />
              <div className="h-4 w-2/3 bg-cream-dark rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
