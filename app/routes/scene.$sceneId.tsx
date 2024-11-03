import { json } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import { story } from "~/data/story";
import type { LoaderFunction } from "@remix-run/cloudflare";
import type { Choice } from "~/data/story";

export async function loader({ params }: Parameters<LoaderFunction>[0]) {
    const scene = story[params.sceneId ?? ''];

    if (!scene) {
        throw new Response("Scene Not Found", { status: 404 });
    }

    return json({ scene });
}

export default function Scene() {
    const data = useLoaderData<typeof loader>();

    return (
        <div className="flex h-screen items-center justify-center">
            <div className="max-w-2xl w-full p-6">
                <div className="bg-white rounded-lg shadow-md p-6">
                    <p className="text-lg mb-6">{data.scene.text}</p>
                    <div className="space-y-4">
                        {data.scene.choices.map((choice: Choice, index: number) => (
                            <form key={index} method="get" action={`/scene/${choice.nextScene}`}>
                                <button
                                    type="submit"
                                    className="w-full p-3 text-center bg-blue-600 text-white rounded hover:bg-blue-700"
                                >
                                    {choice.text}
                                </button>
                            </form>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}