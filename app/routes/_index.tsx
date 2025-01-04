import type { LoaderFunction } from "@remix-run/cloudflare";
import { redirect } from "@remix-run/cloudflare";

export const meta = () => {
  return [
    { title: "Interactive Story" },
    { name: "description", content: "An interactive story with dialogue choices" },
  ];
};

// Redirect to the intro scene
export const loader: LoaderFunction = async () => {
  return redirect("/scene/intro");
};

export default function Index() {
  return null;
}