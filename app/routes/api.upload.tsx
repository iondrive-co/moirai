import type { ActionFunction } from "@remix-run/cloudflare";

export const action: ActionFunction = async ({ request, context }) => {
    try {
        const formData = await request.formData();
        const imageFile = formData.get("image") as File;

        if (!imageFile) {
            return new Response(JSON.stringify({ error: "No image file provided" }), {
                headers: { "Content-Type": "application/json" }
            });
        }

        const fileExtension = imageFile.name.split('.').pop();

        // Generate a random UUID using Web Crypto API
        const array = new Uint8Array(16);
        crypto.getRandomValues(array);
        const fileName = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('') + '.' + fileExtension;

        const kvKey = `public/uploads/${fileName}`;

        // Read the file as an ArrayBuffer
        const arrayBuffer = await imageFile.arrayBuffer();

        // Store the file in KV
        try {
            await context.env.LOCAL_STORAGE.put(kvKey, arrayBuffer);
        } catch (kvError: unknown) {
            const errorMessage = kvError instanceof Error ? kvError.message : String(kvError);
            return new Response(JSON.stringify({ error: `Storage error: ${errorMessage}` }), {
                headers: { "Content-Type": "application/json" }
            });
        }

        return new Response(JSON.stringify({ imagePath: `/api/uploads/${fileName}` }), {
            headers: { "Content-Type": "application/json" }
        });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return new Response(JSON.stringify({ error: `Failed to upload image: ${errorMessage}` }), {
            headers: { "Content-Type": "application/json" }
        });
    }
};