const cron = require("node-cron");
const scraperService = require("../services/scraperService");

const setupCronJobs = () => {
  const cronSchedule = process.env.SCRAPE_INTERVAL || "0 * * * *";

  if (cron.validate(cronSchedule)) {
    cron.schedule(cronSchedule, () => {
      console.log(
        `Running scheduled scrape job at ${new Date().toISOString()}`
      );
      scraperService.scrapeProducts();
    });

    console.log(`Scraper scheduled with cron pattern: ${cronSchedule}`);
  } else {
    console.error(`Invalid cron schedule: ${cronSchedule}`);
  }
  scraperService.scrapeProducts();
};

module.exports = setupCronJobs;
