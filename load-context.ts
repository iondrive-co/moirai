import type { PlatformProxy } from "wrangler";

interface Env {
  STORY_DATA: KVNamespace;
  ENV: string;
}

type Cloudflare = Omit<PlatformProxy<Env>, "dispose">;

declare module "@remix-run/cloudflare" {
  interface AppLoadContext {
    cloudflare: Cloudflare;
    env: Env;
  }
}