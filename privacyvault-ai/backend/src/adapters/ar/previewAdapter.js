async function generateArPreview({ taskId }) {
  return {
    taskId,
    previewUrl: 'https://example.com/ar/preview.glb',
    status: 'stub_ready'
  };
}

module.exports = { generateArPreview };
