const { mkdtemp, writeFile, rm } = require('node:fs/promises');
const { tmpdir } = require('node:os');
const path = require('node:path');
const { healthMetricsCounter } = require('../healthReader');

let directory;
let file;

beforeEach(async () => {
  directory = await mkdtemp(path.join(tmpdir(), 'health-reader-'));
  file = path.join(directory, 'health.json');
});

afterEach(async () => {
  await rm(directory, { recursive: true, force: true });
});

test('reads the health sample and returns the expected summary', async () => {
  const sample = path.join(__dirname, '..', 'data', 'health-metrics.json');
  await expect(healthMetricsCounter(sample)).resolves.toEqual({ totalHealthEntries: 8 });
});

test('counts zero entries in an empty array', async () => {
  await writeFile(file, '[]');
  await expect(healthMetricsCounter(file)).resolves.toEqual({ totalHealthEntries: 0 });
});

test('reports a missing health file', async () => {
  await expect(healthMetricsCounter(file)).rejects.toThrow(/Could not read health data.*ENOENT/);
});

test('reports malformed JSON and retains the parsing error', async () => {
  await writeFile(file, '[{"type":"sleep"}');
  await expect(healthMetricsCounter(file)).rejects.toMatchObject({
    message: expect.stringContaining('Could not read health data'),
    cause: expect.any(SyntaxError),
  });
});

test('rejects valid JSON that is not an array', async () => {
  await writeFile(file, '{"type":"sleep"}');
  await expect(healthMetricsCounter(file)).rejects.toThrow('Expected a JSON array');
});
