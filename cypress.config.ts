import { defineConfig } from "cypress";

export default defineConfig({
  watchForFileChanges: false,
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    baseUrl: "http://localhost:3000",
    defaultCommandTimeout: 10000,
  },
  env: {
    reseller_name: "ECorp China",
  }
});
