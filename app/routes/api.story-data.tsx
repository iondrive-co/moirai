import type { LoaderFunction, ActionFunction } from "@remix-run/cloudflare";
import {StoryData} from "~/types";

export const loader: LoaderFunction = async ({ context }) => {
    try {
        // Try both context.env and context.cloudflare.env
        const kvNamespace = context.env?.STORY_DATA || context.cloudflare?.env?.STORY_DATA;

        if (!kvNamespace) {
            throw new Error('KV binding not available');
        }

        const storyData = await kvNamespace.get('current-story');

        if (!storyData) {
            return new Response(null, { status: 404 });
        }

        return new Response(storyData, {
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error accessing KV:', error);
        return new Response(
            JSON.stringify({ error: 'Failed to access story data' }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            }
        );
    }
};

export const action: ActionFunction = async ({ request, context }) => {
    if (request.method !== "POST") {
        return new Response("Method not allowed", { status: 405 });
    }

    try {
        // Try both context.env and context.cloudflare.env
        const kvNamespace = context.env?.STORY_DATA || context.cloudflare?.env?.STORY_DATA;

        if (!kvNamespace) {
            throw new Error('KV binding not available');
        }

        // Parse the request body
        const storyData = await request.json() as StoryData;

        // Save to KV
        await kvNamespace.put('current-story', JSON.stringify(storyData));

        return new Response(JSON.stringify({ success: true }), {
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error saving to KV:', error);
        return new Response(
            JSON.stringify({ error: 'Failed to save story data' }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            }
        );
    }
};