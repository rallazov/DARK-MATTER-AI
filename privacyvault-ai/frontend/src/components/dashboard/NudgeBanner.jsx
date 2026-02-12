export default function NudgeBanner({ streak = 0 }) {
  return (
    <div className="card border border-teal-500/40 p-4">
      <p className="text-sm text-teal-100">
        You are on a <span className="font-bold">{streak}-day streak</span>. One quick task today keeps momentum high.
      </p>
    </div>
  );
}
