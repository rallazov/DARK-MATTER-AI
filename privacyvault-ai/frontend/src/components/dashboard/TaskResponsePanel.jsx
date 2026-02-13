export default function TaskResponsePanel({ task }) {
  const examples = [
    {
      title: 'Summarize photo',
      text: 'Detected whiteboard notes and created an action plan with deadlines.'
    },
    {
      title: 'Transcribe voice note',
      text: 'Converted your 45s memo into bullet points with follow-up reminders.'
    },
    {
      title: 'Analyze receipt',
      text: 'Extracted total, vendor, date, and categorized as Office Supplies.'
    }
  ];

  return (
    <div className="card p-4">
      <h3 className="font-semibold">AI Response</h3>
      {task ? (
        <div className="mt-3 space-y-3">
          <p className="text-sm text-slate-400">Task: {task.prompt || 'Untitled'}</p>
          {task.output?.text ? (
            <div className="rounded-lg border border-teal-500/30 bg-teal-500/10 p-3 text-sm">
              {task.output.text}
            </div>
          ) : null}
          {task.output?.image?.url ? (
            <img
              src={task.output.image.url}
              alt={task.output.image.prompt || 'Generated output'}
              className="max-h-64 rounded-lg border border-slate-700 object-contain"
            />
          ) : null}
          {task.metadata?.transcript ? (
            <div className="rounded-lg border border-slate-700 bg-slate-900/40 p-3 text-sm text-slate-300">
              Transcript: {task.metadata.transcript}
            </div>
          ) : null}
        </div>
      ) : (
        <p className="mt-2 text-sm text-slate-400">Run a task to preview private AI output here.</p>
      )}

      <div className="mt-4">
        <p className="text-xs uppercase tracking-wide text-slate-500">Example outcomes</p>
        <div className="mt-2 grid gap-2">
          {examples.map((example) => (
            <div key={example.title} className="rounded-lg border border-slate-700 p-2">
              <p className="text-sm font-medium">{example.title}</p>
              <p className="text-xs text-slate-400">{example.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
