import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const routesDir = path.join(__dirname, '..', 'app', 'routes');
const backupDir = path.join(__dirname, '..', 'app', 'routes-backup');

// Create backup of routes directory
fs.cpSync(routesDir, backupDir, { recursive: true });

try {
    // Clear routes directory except for production routes
    const files = fs.readdirSync(routesDir);
    files.forEach(file => {
        if (!['root.tsx', '_index.tsx', 'scene.$sceneId.tsx'].includes(file)) {
            const filePath = path.join(routesDir, file);
            if (fs.statSync(filePath).isFile()) {
                fs.rmSync(filePath);
            }
        }
    });

    console.log('Building production bundle...');
    // Run the build
    execSync('remix vite:build', { stdio: 'inherit' });
    console.log('Build completed successfully');
} catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
} finally {
    // Restore routes directory
    fs.rmSync(routesDir, { recursive: true, force: true });
    fs.renameSync(backupDir, routesDir);
}