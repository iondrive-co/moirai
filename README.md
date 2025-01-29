# Moirai

A [remix](https://remix.run/) browser-based editor and viewer for dialogue-heavy interactive fiction, designed to run 
in [cloudflare pages](https://pages.cloudflare.com/) from data in a [KV store](https://developers.cloudflare.com/kv/).

![Editor](/example/example-edit.png?raw=true "Editor")
![Viewer](/example/example-view.png?raw=true "Viewer")

Before anything else, you will want to create a KV store. Copy the wrangler.toml.template to wrangler.toml and run the 
create command in there to generate the store. Next, you will need some story data to start out with, you can load the 
example story from the screenshot above into your local KV store with `npm run story:load-example`.

Once you have a KV store, you can run locally with `npm run local`. The default route is the story view, which is all 
that gets deployed to cloudflare. However, locally there is an edit button which allows you to edit the story contents.
When you have written something, you can make a backup to the stories directory with `npm run story:backup`, this 
directory will not be committed by default. To load the latest backup `npm run story:load`. You can list available 
backups with `npm run story:list` which will give output such as:
```
Available backups:
1. story-2025-01-25T05-10-32.json (2.27KB)
2. story-2025-01-25T04-59-52.json (1.84KB)
```
You can then load one of these, for example: `npm run story:load -- 2025-01-25T04-59-52`

When your story is ready, you can use `story:put:prod` to push it to the production KV store, and `story:get:prod` to 
read the production KV store back into local if you want to overwrite the local store. You will need to configure your 
pages app in cloudflare first. The recommended approach is to fork this project in github and set up a cloudflare pages
integration, see [here](https://developers.cloudflare.com/pages/framework-guides/deploy-a-remix-site/).

TODO:

- Variables for determining available choices