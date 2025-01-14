import {
  vitePlugin as remix,
  cloudflareDevProxyVitePlugin as remixCloudflareDevProxy,
} from "@remix-run/dev";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

declare module "@remix-run/cloudflare" {
  interface Future {
    v3_singleFetch: true;
  }
}

const isProduction = process.env.NODE_ENV === "production";

export default defineConfig({
  plugins: [
    remixCloudflareDevProxy(),
    remix({
      ignoredRouteFiles: ["**/.*"],
      serverModuleFormat: "esm",
      routes: (defineRoutes) => {
        return defineRoutes((route) => {
          // Base routes that are always included
          route("/", "routes/_index.tsx");
          route("/scene/*", "routes/scene.$sceneId.tsx");
          // Only include editor routes in development
          if (!isProduction) {
            route("/edit", "routes/edit.tsx");
            route("/edit/*", "routes/edit/*.tsx");
          }
        });
      },
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
        v3_singleFetch: true,
        v3_lazyRouteDiscovery: true,
      },
    }),
    tsconfigPaths(),
  ],
});
