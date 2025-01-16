import type {LinksFunction, LoaderFunction} from "@remix-run/cloudflare";
import {
    Links,
    Meta,
    Outlet,
    Scripts,
    ScrollRestoration, useLoaderData,
} from "@remix-run/react";

import "./tailwind.css";

export const loader: LoaderFunction = async ({ context }) => {
    return {
        hasEnv: !!context.env,
        hasCloudflareEnv: !!context.cloudflare?.env,
        hasStoryData: !!(context.env?.STORY_DATA || context.cloudflare?.env?.STORY_DATA)
    };
};

export const links: LinksFunction = () => [
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,400;0,700;1,400;1,700&display=swap",
  },
];

export default function App() {
  const data = useLoaderData<typeof loader>();
  console.log('Root loader data:', data);
  return (
      <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
      <Outlet />
      <ScrollRestoration />
      <Scripts />
      </body>
      </html>
  );
}