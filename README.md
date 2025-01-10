# Moirai

A browser editor and viewer for dialogue-heavy stories, designed to run with a cloudflare KV store.

![Editor](/example/example-edit.png?raw=true "Editor")
![Viewer](/example/example-view.png?raw=true "Viewer")

The default route is the story view, the editor can be accessed via /edit. You can load the example story above into 
your local KV store with `npm run load`, and run it locally with `npm run preview`. 

For deploying to cloudflare and using a non-local KV store, see 
[here](https://developers.cloudflare.com/pages/framework-guides/deploy-a-remix-site/), and don't forget to change the 
kv_namespaces details in wrangler.toml

