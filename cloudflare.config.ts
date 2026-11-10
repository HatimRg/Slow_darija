import { bindings, defineConfig, defineWorker, triggers } from "cf/config";

export default defineConfig({
  worker: defineWorker({
    name: "slow-darija-pragmatrix-preview",
    entrypoint: "./worker/index.ts",
    compatibilityDate: "2026-11-10",
    compatibilityFlags: ["nodejs_compat"],
    assets: {
      htmlHandling: "none",
      notFoundHandling: "none",
      runWorkerFirst: ["/*", "!/_next/static/*", "!/*/_next/static/*"],
    },
    env: {
      ASSETS: bindings.assets(),
      IMAGES: bindings.images(),
      DB: bindings.d1({
        name: "slow-darija-preview",
        id: "e0917e17-ee33-4ca6-b924-9eb53b5c8973",
      }),
    },
    triggers: [
      triggers.fetch({
        pattern: "preview.pragmatrix.ma/darija_learning/*",
        zone: "pragmatrix.ma",
      }),
    ],
  }),
});
