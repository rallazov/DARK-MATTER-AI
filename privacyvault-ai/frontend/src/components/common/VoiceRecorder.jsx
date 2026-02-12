import { useState } from 'react';

export default function VoiceRecorder({ onTranscript }) {
  const [recording, setRecording] = useState(false);

  const startRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      onTranscript('Voice recognition unsupported in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.onresult = (event) => {
      const text = event.results?.[0]?.[0]?.transcript || '';
      onTranscript(text);
      setRecording(false);
    };
    recognition.onerror = () => {
      onTranscript('Voice capture failed. Please try again.');
      setRecording(false);
    };
    recognition.start();
    setRecording(true);
  };

  return (
    <button type="button" className="btn-secondary" onClick={startRecognition}>
      {recording ? 'Listening...' : 'Record Voice'}
    </button>
  );
}
