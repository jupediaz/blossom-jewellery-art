export default function CollectionsLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="h-8 w-48 bg-cream-dark rounded animate-pulse mb-8" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="aspect-[4/5] bg-cream-dark rounded-lg animate-pulse" />
        ))}
      </div>
    </div>
  );
}
