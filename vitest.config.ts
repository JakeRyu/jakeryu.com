import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globalSetup: ["./tests/support/build-fixture-site.ts"],
    // Test files each run their own Astro build, and concurrent builds clash over the shared .astro folder.
    fileParallelism: false,
  },
});
