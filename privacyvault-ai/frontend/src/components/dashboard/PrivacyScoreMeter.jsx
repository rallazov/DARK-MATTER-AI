import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPrivacyScore } from '../../slices/progressSlice';

export default function PrivacyScoreMeter() {
  const dispatch = useDispatch();
  const { privacyScore, privacyFactors } = useSelector((state) => state.progress);
  const fallback = useSelector((state) => state.settings.privacyScore);

  useEffect(() => {
    dispatch(fetchPrivacyScore());
  }, [dispatch]);

  const score = privacyScore ?? fallback ?? 70;

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Privacy Score</h3>
        <span className="text-lg font-bold text-teal-300">{score}%</span>
      </div>
      <div className="mt-3 h-2 rounded-full bg-slate-700">
        <div className="h-2 rounded-full bg-teal-500" style={{ width: `${score}%` }} />
      </div>
      {privacyFactors?.length > 0 ? (
        <ul className="mt-2 space-y-1 text-sm text-slate-400">
          {privacyFactors.map((f, i) => (
            <li key={i}>
              {f.label} {f.impact}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-sm text-slate-400">Enable MFA and rotate integration keys monthly to improve score.</p>
      )}
    </div>
  );
}
