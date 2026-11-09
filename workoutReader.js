const { createReadStream } = require('node:fs');
const { pipeline } = require('node:stream/promises');
const csv = require('csv-parser');

async function workoutCalculator(filePath) {
  const workouts = [];
  let minutesColumn;

  try {
    const parser = csv({
      strict: true,
      mapHeaders: ({ header }) => header.trim().toLowerCase(),
    });
    parser.on('headers', (headers) => {
      const supportedHeaders = ['minutes', 'duration_minutes', 'duration'];
      minutesColumn = supportedHeaders.find((header) => headers.includes(header));
      if (!minutesColumn) {
        parser.destroy(new Error('The CSV needs a minutes column.'));
      }
    });

    await pipeline(createReadStream(filePath), parser, async (rows) => {
      for await (const row of rows) {
        workouts.push(row);
      }
    });

    if (!minutesColumn) {
      throw new Error('The CSV is empty. Add a header with a minutes column.');
    }

    let totalMinutes = 0;
    for (let index = 0; index < workouts.length; index++) {
      const value = workouts[index][minutesColumn].trim();
      const minutes = Number(value);
      if (!/^\d+(?:\.\d+)?$/.test(value) || !Number.isFinite(minutes)) {
        throw new Error(`Workout ${index + 1} must have a valid non-negative number of minutes.`);
      }
      totalMinutes += minutes;
    }

    return { totalWorkouts: workouts.length, totalMinutes };
  } catch (error) {
    throw new Error(`Could not read workouts from "${filePath}": ${error.message}`, {
      cause: error,
    });
  }
}

module.exports = { workoutCalculator };
