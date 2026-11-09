# Fitness Data Processor

Logan Runyan · Application Development I: Backend

The program reads workout minutes from a CSV and counts entries in a JSON health log. It compares the workout total with the weekly goal set in `.env`.

```sh
npm install
npm test
npm start
```

The sample files contain **10 workouts**, **330 workout minutes**, and **8 health entries**. The sample weekly goal is **150 minutes**. The included `.env` contains only the name and goal required by the lab.

To process other files, provide the workout CSV first and the health JSON second.

```sh
npm start -- ./data/workouts.csv ./data/health-metrics.json
```

- The CSV needs a header row with a `minutes` column. Each workout must have a non-negative duration. Use a CSV containing the week you want to measure, since the program sums all its rows.
- The health file should be a JSON array with one item per entry.
- The readers return summary objects. They reject missing or invalid files with a message that identifies the input.
