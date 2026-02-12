import { useRef } from 'react';

export default function UploadZone({ onFile }) {
  const inputRef = useRef(null);

  return (
    <div className="rounded-xl border border-dashed border-slate-600 p-4 text-center">
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={(event) => onFile(event.target.files?.[0] || null)}
      />
      <p className="text-sm text-slate-400">Drop image/audio/video or pick a file</p>
      <button className="btn-secondary mt-3" type="button" onClick={() => inputRef.current?.click()}>
        Choose File
      </button>
    </div>
  );
}
