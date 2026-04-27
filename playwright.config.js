const { defineConfig, devices } = require("@playwright/test");

const isLambdaTest = process.env.LAMBDATEST === "true";

const LT_USERNAME = process.env.LT_USERNAME || "YOUR_LT_USERNAME";
const LT_ACCESS_KEY = process.env.LT_ACCESS_KEY || "YOUR_LT_ACCESS_KEY";

const ltCapabilities = {
  browserName: "Chrome",
  browserVersion: "latest",
  "LT:Options": {
    platform: "Windows 10",
    build: "Amazon Automation - TestMu AI Assignment",
    name: "Amazon Cart Tests",
    user: LT_USERNAME,
    accessKey: LT_ACCESS_KEY,
    network: true,
    video: true,
    console: true,
    tunnel: false,
  },
};

module.exports = defineConfig({
  testDir: "./tests",
  timeout: 60_000,
  retries: 1,
  fullyParallel: true,
  workers: 2,
  reporter: [["html", { open: "never" }], ["list"]],
  use: {
    headless: true,
    viewport: { width: 1280, height: 720 },
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    ...(isLambdaTest && {
      connectOptions: {
        wsEndpoint: `wss://cdp.lambdatest.com/playwright?capabilities=${encodeURIComponent(
          JSON.stringify(ltCapabilities)
        )}`,
      },
    }),
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
