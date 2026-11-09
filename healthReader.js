const fs = require('node:fs/promises');

async function healthMetricsCounter(filePath) {
  try {
    const contents = await fs.readFile(filePath, 'utf8');
    const entries = JSON.parse(contents.replace(/^\uFEFF/, ''));

    if (!Array.isArray(entries)) {
      throw new Error('Expected a JSON array of health entries.');
    }

    return { totalHealthEntries: entries.length };
  } catch (error) {
    throw new Error(`Could not read health data from "${filePath}": ${error.message}`, {
      cause: error,
    });
  }
}

module.exports = { healthMetricsCounter };
