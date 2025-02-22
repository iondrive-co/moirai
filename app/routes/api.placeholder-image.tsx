import type { LoaderFunction } from "@remix-run/cloudflare";

export const loader: LoaderFunction = async () => {
    const width = 400;
    const height = 300;

    const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#333"/>
        <rect x="5" y="5" width="${width-10}" height="${height-10}" fill="#555" rx="8" ry="8"/>
        <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="24" fill="#aaa" text-anchor="middle" dominant-baseline="middle">Image Placeholder</text>
        <text x="50%" y="58%" font-family="Arial, sans-serif" font-size="14" fill="#888" text-anchor="middle" dominant-baseline="middle">Scene Image will appear here</text>
    </svg>
    `;

    return new Response(svg, {
        status: 200,
        headers: {
            "Content-Type": "image/svg+xml",
            "Cache-Control": "max-age=3600"
        }
    });
};