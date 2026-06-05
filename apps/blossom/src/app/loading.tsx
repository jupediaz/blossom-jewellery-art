export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-sage/30 border-t-sage rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-warm-gray">Loading...</p>
      </div>
    </div>
  );
}
