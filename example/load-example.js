import { readFileSync, writeFileSync, unlinkSync } from 'fs';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const sourceFile = join(__dirname, 'example-story.json');
const sourceData = JSON.parse(readFileSync(sourceFile, 'utf8'));
const kvData = sourceData.map(item => ({
    ...item,
    value: JSON.stringify(item.value)
}));

const tempFile = join(__dirname, 'temp-kv.json');
writeFileSync(tempFile, JSON.stringify(kvData, null, 2));

try {
    execSync(`wrangler kv:bulk put --binding=STORY_DATA ${tempFile} --preview --local`, { stdio: 'inherit' });
} catch (error) {
    console.error('Error loading KV data:', error);
} finally {
    unlinkSync(tempFile);
}