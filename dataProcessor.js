const path = require('node:path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const { healthMetricsCounter } = require('./healthReader');
const { workoutCalculator } = require('./workoutReader');

async function processFiles(
  workoutPath = path.join(__dirname, 'data', 'workouts.csv'),
  healthPath = path.join(__dirname, 'data', 'health-metrics.json')
) {
  const userName = process.env.USER_NAME?.trim();
  const goalText = process.env.WEEKLY_GOAL?.trim();
  const weeklyGoal = Number(goalText);

  if (!userName || !goalText || !Number.isFinite(weeklyGoal) || weeklyGoal <= 0) {
    throw new Error('Set USER_NAME and a positive WEEKLY_GOAL in .env before running the program.');
  }

  console.log(`Processing data for: ${userName}`);
  console.log('Reading workout data...');
  const { totalWorkouts, totalMinutes } = await workoutCalculator(workoutPath);
  console.log('Reading health data...');
  const { totalHealthEntries } = await healthMetricsCounter(healthPath);

  console.log('\n=== SUMMARY ===');
  console.log(`Workouts found: ${totalWorkouts}`);
  console.log(`Total workout minutes: ${totalMinutes}`);
  console.log(`Health entries found: ${totalHealthEntries}`);
  console.log(`Weekly goal: ${weeklyGoal} minutes`);

  if (totalMinutes > weeklyGoal) {
    console.log(`Congratulations, ${userName}! You exceeded your weekly goal by ${totalMinutes - weeklyGoal} minutes.`);
  } else if (totalMinutes === weeklyGoal) {
    console.log(`Nice work, ${userName}! You met your weekly goal.`);
  } else {
    console.log(`${userName}, you have ${weeklyGoal - totalMinutes} minutes left to meet your weekly goal.`);
  }
}

if (require.main === module) {
  processFiles(process.argv[2], process.argv[3]).catch((error) => {
    console.error(`Unable to finish the report: ${error.message}`);
    process.exitCode = 1;
  });
}

module.exports = { processFiles };
