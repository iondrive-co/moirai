import type { MetaFunction , LoaderFunction } from "@remix-run/cloudflare";
import { redirect } from "@remix-run/cloudflare";

export const meta: MetaFunction = () => {
  return [
    { title: "Text Adventure" },
    { name: "description", content: "Choose your own adventure!" },
  ];
};

// Redirect to the first scene
export const loader: LoaderFunction = async () => {
  return redirect("/scene/scene1");
};

export default function Index() {
  return null; // This won't be shown due to redirect
}