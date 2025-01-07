import type { LoaderFunction } from "@remix-run/cloudflare";

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