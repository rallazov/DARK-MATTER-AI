export default function TaskTimeline({ tasks, onDelete }) {
  return (
    <div className="card p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-semibold">Task History</h3>
        <a href="/api/tasks/export/csv" className="text-sm text-teal-300 hover:underline">
          Export CSV
        </a>
      </div>
      <ul className="space-y-3">
        {tasks.map((task) => (
          <li key={task._id} className="rounded-lg border border-slate-700 p-3">
            <div className="flex items-center justify-between">
              <p className="font-medium">{task.prompt || 'Untitled task'}</p>
              <span className="text-xs uppercase text-slate-400">{task.status}</span>
            </div>
            <p className="mt-1 text-sm text-slate-400">{task.type} | {new Date(task.createdAt).toLocaleString()}</p>
            <div className="mt-2 flex gap-2">
              <button className="text-xs text-rose-300 hover:underline" onClick={() => onDelete(task._id)}>
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
