# Moirai

A browser editor and viewer for dialogue-heavy stories, designed to run with a cloudflare KV store.

![Editor](/example/example-edit.png?raw=true "Editor")
![Viewer](/example/example-view.png?raw=true "Viewer")

Before anything else, you will want to create a local and production KV store. Copy the wrangler.toml.template to
wrangler.toml and run the commands in there to generate the two stores. Next, you will need some story data to start
out with, so load the example story from above into your local KV store with `npm run story:load-example`.

Once these are done you can then run locally with `npm run run:local`. The default route is the story view (this is all 
that gets deployed to cloudflare), and the editor can be accessed via /edit. When you work on your own story, you can 
save it to the (.gitignored) current-story.json with `npm run story:get:local`, and load the contents of that file into 
your local KV store with `npm run story:put:local`.

Once you are ready to publish, you can use the `story:get:prod` and `story:put:prod` to modify the production KV store,
which is what you will need to configure your pages app in cloudflare to use. See 
[here](https://developers.cloudflare.com/pages/framework-guides/deploy-a-remix-site/)

TODO:

 - Link to editor in view locally only

