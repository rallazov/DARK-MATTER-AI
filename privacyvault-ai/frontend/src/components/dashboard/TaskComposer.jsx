import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import UploadZone from '../common/UploadZone';
import VoiceRecorder from '../common/VoiceRecorder';
import { createTask } from '../../slices/taskSlice';

export default function TaskComposer() {
  const dispatch = useDispatch();
  const selectedVaultId = useSelector((state) => state.vaults.selectedVaultId);
  const [prompt, setPrompt] = useState('');
  const [type, setType] = useState('text');
  const [file, setFile] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedVaultId) return;
    await dispatch(createTask({ vaultId: selectedVaultId, prompt, type, file }));
    setPrompt('');
    setFile(null);
  };

  return (
    <form className="card space-y-4 p-4" onSubmit={handleSubmit}>
      <h3 className="font-semibold">Multimodal Task Creator</h3>

      <label className="block text-sm">
        Task Type
        <select
          className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2"
          value={type}
          onChange={(event) => setType(event.target.value)}
        >
          <option value="text">Text</option>
          <option value="image">Image</option>
          <option value="voice">Voice</option>
          <option value="video">Video</option>
        </select>
      </label>

      <label className="block text-sm">
        Prompt
        <textarea
          className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2"
          rows={4}
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          placeholder="Upload a photo and summarize it privately"
        />
      </label>

      <UploadZone onFile={setFile} />
      <VoiceRecorder onTranscript={(text) => setPrompt((prev) => `${prev}\n${text}`.trim())} />

      <button className="btn-primary" type="submit">
        Run Private Task
      </button>
    </form>
  );
}
