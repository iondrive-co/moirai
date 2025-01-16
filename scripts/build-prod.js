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
        if (!['_index.tsx', 'scene.$sceneId.tsx'].includes(file)) {
            fs.rmSync(path.join(routesDir, file));
        }
    });
    // Run the build
    execSync('remix vite:build', { stdio: 'inherit' });
} finally {
    // Restore routes directory
    fs.rmSync(routesDir, { recursive: true, force: true });
    fs.renameSync(backupDir, routesDir);
}