export interface Env {
    STORY_DATA: KVNamespace;
}

declare module "@remix-run/cloudflare" {
    interface AppLoadContext {
        env: Env;
    }
}