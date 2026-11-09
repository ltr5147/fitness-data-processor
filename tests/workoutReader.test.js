const { mkdtemp, writeFile, rm } = require('node:fs/promises');
const { tmpdir } = require('node:os');
const path = require('node:path');
const { workoutCalculator } = require('../workoutReader');

let directory;
let file;

beforeEach(async () => {
  directory = await mkdtemp(path.join(tmpdir(), 'workout-reader-'));
  file = path.join(directory, 'workouts.csv');
});

afterEach(async () => {
  await rm(directory, { recursive: true, force: true });
});

test('reads the workout sample and returns the expected summary', async () => {
  const sample = path.join(__dirname, '..', 'data', 'workouts.csv');
  await expect(workoutCalculator(sample)).resolves.toEqual({
    totalWorkouts: 10,
    totalMinutes: 330,
  });
});

test('parses quoted commas, decimals, and Windows line endings', async () => {
  await writeFile(file, 'workout,minutes\r\n"Run, easy pace",12.5\r\nWalk,0\r\n');
  await expect(workoutCalculator(file)).resolves.toEqual({
    totalWorkouts: 2,
    totalMinutes: 12.5,
  });
});

test('returns zero workouts for a header-only CSV', async () => {
  await writeFile(file, 'workout,minutes\n');
  await expect(workoutCalculator(file)).resolves.toEqual({ totalWorkouts: 0, totalMinutes: 0 });
});

test('reports a missing workout file', async () => {
  await expect(workoutCalculator(file)).rejects.toThrow(/Could not read workouts.*ENOENT/);
});

test('reports a missing minutes column', async () => {
  await writeFile(file, 'workout,date\nWalk,2026-11-02\n');
  await expect(workoutCalculator(file)).rejects.toThrow('needs a minutes column');
});

test('reports a corrupted row with too few columns', async () => {
  await writeFile(file, 'workout,minutes\nWalk\n');
  await expect(workoutCalculator(file)).rejects.toThrow(/Could not read workouts.*row length/i);
});

test.each(['oops', '', '-10'])('rejects invalid duration "%s"', async (value) => {
  await writeFile(file, `workout,minutes\nWalk,${value}\n`);
  await expect(workoutCalculator(file)).rejects.toThrow('Workout 1 must have a valid');
});
