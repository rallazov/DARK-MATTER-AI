export default function Loader({ label = 'Loading...' }) {
  return (
    <div className="flex items-center gap-3 text-slate-300">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-teal-400 border-t-transparent" />
      <span>{label}</span>
    </div>
  );
}
