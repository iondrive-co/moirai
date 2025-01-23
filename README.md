# Moirai

A browser editor and viewer for dialogue-heavy stories, designed to run with a cloudflare KV store.

![Editor](/example/example-edit.png?raw=true "Editor")
![Viewer](/example/example-view.png?raw=true "Viewer")

Before anything else, you will want to create a local and production KV store. Copy the wrangler.toml.template to
wrangler.toml and run the commands in there to generate the two stores. Next, you will need some story data to start
out with, so load the example story from above into your local KV store with `npm run story:load-example`.

Once these are done you can then run locally with `npm run local`. The default route is the story view (this is all 
that gets deployed to cloudflare), and the editor can be accessed via /edit. When you work on your own story, you can 
use `story:put:prod` to push it to the production KV store, and `story:get:prod` to read the production KV store back
into local if you want to overwrite the local store. You will need to configure your pages app in cloudflare to use 
these, see [here](https://developers.cloudflare.com/pages/framework-guides/deploy-a-remix-site/)