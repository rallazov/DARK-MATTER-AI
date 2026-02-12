import { useSelector } from 'react-redux';

export default function PrivacyScoreMeter() {
  const privacyScore = useSelector((state) => state.settings.privacyScore);

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Privacy Score</h3>
        <span className="text-lg font-bold text-teal-300">{privacyScore}%</span>
      </div>
      <div className="mt-3 h-2 rounded-full bg-slate-700">
        <div className="h-2 rounded-full bg-teal-500" style={{ width: `${privacyScore}%` }} />
      </div>
      <p className="mt-2 text-sm text-slate-400">Enable MFA and rotate integration keys monthly to improve score.</p>
    </div>
  );
}
