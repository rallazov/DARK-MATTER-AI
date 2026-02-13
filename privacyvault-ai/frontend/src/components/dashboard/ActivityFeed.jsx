import { useEffect, useState } from 'react';
import { api } from '../../api/client';
import Loader from '../common/Loader';

export default function ActivityFeed({ limit = 12 }) {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('idle');

  useEffect(() => {
    let mounted = true;
    setStatus('loading');
    api
      .get(`/api/users/activity?limit=${limit}`)
      .then((data) => {
        if (!mounted) return;
        setItems(data.items || []);
        setStatus('succeeded');
      })
      .catch(() => {
        if (!mounted) return;
        setStatus('failed');
      });
    return () => {
      mounted = false;
    };
  }, [limit]);

  return (
    <div className="card p-4">
      <h3 className="font-semibold">Recent Activity</h3>
      {status === 'loading' ? <div className="mt-3"><Loader label="Loading activity..." /></div> : null}
      {status === 'failed' ? <p className="mt-2 text-sm text-rose-300">Failed to load activity.</p> : null}
      {status === 'succeeded' && items.length === 0 ? (
        <p className="mt-2 text-sm text-slate-400">Your private activity feed will appear after your first actions.</p>
      ) : null}
      <ul className="mt-3 space-y-2">
        {items.map((item) => (
          <li key={item.id} className="rounded-lg border border-slate-700 bg-slate-900/40 p-3">
            <p className="text-sm font-medium">{item.title}</p>
            <p className="mt-1 text-xs text-slate-400">{item.description}</p>
            <p className="mt-1 text-xs text-slate-500">{new Date(item.createdAt).toLocaleString()}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
