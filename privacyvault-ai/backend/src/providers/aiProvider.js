const { env } = require('../config/env');

let openaiClient = null;

function getOpenAIClient() {
  if (!openaiClient && env.openaiApiKey) {
    const OpenAI = require('openai');
    openaiClient = new OpenAI({ apiKey: env.openaiApiKey });
  }
  return openaiClient;
}

const useRealAi = () => !env.enableMockAi && env.openaiApiKey && getOpenAIClient();

async function generateText({ prompt }) {
  const client = useRealAi();
  if (client) {
    try {
      const completion = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1024
      });
      return completion.choices[0]?.message?.content?.trim() || 'No response generated.';
    } catch (error) {
      console.warn('OpenAI API error, falling back to mock:', error.message);
      return mockGenerateText(prompt);
    }
  }
  return mockGenerateText(prompt);
}

function mockGenerateText(prompt) {
  return `Private AI response: ${prompt.slice(0, 300)}`;
}

async function generateImageStub({ prompt }) {
  const client = useRealAi();
  if (client) {
    try {
      const image = await client.images.generate({
        model: 'dall-e-3',
        prompt: prompt.slice(0, 1000),
        n: 1,
        size: '1024x1024'
      });
      const url = image.data?.[0]?.url;
      if (url) return { url, prompt };
    } catch (error) {
      console.warn('OpenAI image API error, falling back to placeholder:', error.message);
    }
  }
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
