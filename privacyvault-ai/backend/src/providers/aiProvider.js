async function generateText({ prompt }) {
  return `Private AI response: ${prompt.slice(0, 300)}`;
}

async function generateImageStub({ prompt }) {
  return {
    url: 'https://placehold.co/1024x768/png?text=Private+AI+Image',
    prompt
  };
}

async function synthesizeSpeechStub({ text }) {
  return {
    audioUrl: 'https://example.com/audio/stub.mp3',
    transcript: text
  };
}

module.exports = { generateText, generateImageStub, synthesizeSpeechStub };
