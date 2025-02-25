import type { ActionFunction } from "@remix-run/cloudflare";

interface DeleteImagesRequest {
    filenames: string[];
}

export const action: ActionFunction = async ({ request, context }) => {
    try {
        const body = await request.json() as DeleteImagesRequest;

        if (!body.filenames || !Array.isArray(body.filenames) || body.filenames.length === 0) {
            return new Response(JSON.stringify({
                success: false,
                message: "No filenames provided"
            }), {
                headers: { "Content-Type": "application/json" }
            });
        }

        const deletePromises = body.filenames.map(filename => {
            const key = `public/uploads/${filename}`;
            return context.env.LOCAL_STORAGE.delete(key);
        });

        await Promise.all(deletePromises);

        return new Response(JSON.stringify({
            success: true,
            message: `Successfully deleted ${body.filenames.length} images`
        }), {
            headers: { "Content-Type": "application/json" }
        });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return new Response(JSON.stringify({
            success: false,
            message: `Failed to delete images: ${errorMessage}`
        }), {
            headers: { "Content-Type": "application/json" }
        });
    }
};