import type { PlatformProxy } from "wrangler";

interface Env {
  STORY_DATA: KVNamespace;
}

type Cloudflare = Omit<PlatformProxy<Env>, "dispose">;

declare module "@remix-run/cloudflare" {
  interface AppLoadContext {
    cloudflare: Cloudflare;
    env: Env;
  }
}