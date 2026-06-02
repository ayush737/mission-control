import cron from "node-cron";
import { ensureMissionForTomorrow } from "../lib/daily-mission";

const timezone = process.env.APP_TIME_ZONE || "Asia/Kolkata";

async function run() {
  try {
    const mission = await ensureMissionForTomorrow();
    console.log(`[daily-mission-cron] generated mission for ${mission.date}`);
  } catch (error) {
    console.error("[daily-mission-cron] failed to generate mission", error);
  }
}

await run();

cron.schedule(
  "0 0 * * *",
  () => {
    void run();
  },
  { timezone }
);

process.stdin.resume();
