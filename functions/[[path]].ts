import { createPagesFunctionHandler } from "@remix-run/cloudflare-pages";
import type { ServerBuild } from "@remix-run/cloudflare";
import type { PlatformProxy } from "wrangler";

interface Env {
    STORY_DATA: KVNamespace;
    ENV: string;
}

const build = {
    ...require("../build/server")
} as unknown as ServerBuild;

export const onRequest = createPagesFunctionHandler({
    build,
    getLoadContext: (context): { cloudflare: Omit<PlatformProxy<Env>, "dispose">; env: Env } => {
        return {
            cloudflare: context as unknown as Omit<PlatformProxy<Env>, "dispose">,
            env: {
                STORY_DATA: context.env.STORY_DATA,
                ENV: context.env.ENV
            }
        };
    }
});