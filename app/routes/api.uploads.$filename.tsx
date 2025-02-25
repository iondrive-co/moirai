import type { LoaderFunction } from "@remix-run/cloudflare";

function getMimeType(filename: string): string {
    const extension = filename.split('.').pop()?.toLowerCase();

    const mimeTypes: Record<string, string> = {
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'gif': 'image/gif',
        'webp': 'image/webp',
        'svg': 'image/svg+xml',
        'bmp': 'image/bmp'
    };

    return mimeTypes[extension || ''] || 'application/octet-stream';
}

export const loader: LoaderFunction = async ({ params, context }) => {
    try {
        const fileName = params.filename;
        if (!fileName) throw new Error("No filename provided");

        const contentType = getMimeType(fileName);
        const kvKey = `public/uploads/${fileName}`;

        const fileData = await context.env.LOCAL_STORAGE.get(kvKey, 'arrayBuffer');

        if (!fileData) {
            throw new Error("File not found");
        }

        return new Response(fileData, {
            headers: {
                "Content-Type": contentType,
                "Cache-Control": "public, max-age=31536000",
            },
        });
    } catch (error) {
        return new Response("Image not found", {
            status: 404,
            headers: {
                "Content-Type": "text/plain"
            }
        });
    }
};