// @ts-check
const { devices } = require("@playwright/test");

/**
 * @see https://playwright.dev/docs/test-configuration
 * @type {import('@playwright/test').PlaywrightTestConfig}
 */
const config = {
  testDir: "tests/playwright",
  timeout: 60_000,
  expect: {
    timeout: 15_000
  },
  use: {
    headless: true,
    trace: "retain-on-failure",
    video: "retain-on-failure",
    screenshot: "only-on-failure",
    locale: "pt-BR",
    baseURL: process.env.PDFDOCBUILDER_BASE_URL
  },
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] }
    }
  ]
};

module.exports = config;
