import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const routesDir = path.join(__dirname, '..', 'app', 'routes');
const backupDir = path.join(__dirname, '..', 'app', 'routes-backup');
const buildDir = path.join(__dirname, '..', 'build');

// Clean the build directory first
if (fs.existsSync(buildDir)) {
    console.log('Cleaning build directory...');
    fs.rmSync(buildDir, { recursive: true, force: true });
}

// Create backup of routes directory
fs.cpSync(routesDir, backupDir, { recursive: true });

try {
    // Clear routes directory except for production routes
    console.log('Filtering production routes...');
    const files = fs.readdirSync(routesDir);

    // Keep only these core routes for production
    const productionFiles = [
        'root.tsx',
        '_index.tsx',
        'scene.$sceneId.tsx',
        // Needed for viewing images
        'api.uploads.$filename.tsx'
    ];

    files.forEach(file => {
        if (!productionFiles.includes(file)) {
            const filePath = path.join(routesDir, file);
            if (fs.statSync(filePath).isFile()) {
                console.log(`Removing non-production file: ${file}`);
                fs.rmSync(filePath);
            }
        } else {
            console.log(`Keeping production file: ${file}`);
        }
    });

    console.log('Building production bundle...');
    execSync('remix vite:build', { stdio: 'inherit' });
    console.log('Build completed successfully');
} catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
} finally {
    // Restore routes directory
    console.log('Restoring original routes...');
    fs.rmSync(routesDir, { recursive: true, force: true });
    fs.renameSync(backupDir, routesDir);
}