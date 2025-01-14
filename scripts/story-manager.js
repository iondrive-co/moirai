import { readFileSync, writeFileSync, unlinkSync } from 'fs';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const command = process.argv[2];
const environment = process.argv[3] || 'preview';

if (!['load-example', 'get', 'put'].includes(command)) {
    console.error('Usage: node story-manager.js [load-example|get|put] [preview|production]');
    process.exit(1);
}

const namespace = environment === 'production' ? 'STORY_DATA' : 'STORY_DATA';
const localFlag = environment === 'preview' ? '--preview --local' : '';

async function loadExampleToKV() {
    const sourceFile = join(__dirname, '..', 'example', 'example-story.json');
    const sourceData = JSON.parse(readFileSync(sourceFile, 'utf8'));
    const kvData = sourceData.map(item => ({
        ...item,
        value: JSON.stringify(item.value)
    }));

    const tempFile = join(__dirname, 'temp-kv.json');
    writeFileSync(tempFile, JSON.stringify(kvData, null, 2));

    try {
        execSync(`wrangler kv:bulk put --binding=${namespace} ${tempFile} ${localFlag}`, { stdio: 'inherit' });
    } catch (error) {
        console.error('Error loading KV data:', error);
    } finally {
        unlinkSync(tempFile);
    }
}

async function getCurrentStory() {
    try {
        const result = execSync(`wrangler kv:key get --binding=${namespace} current-story ${localFlag}`);
        writeFileSync('current-story.json', result);
        console.log('Successfully retrieved story data to current-story.json');
    } catch (error) {
        console.error('Error getting story data:', error.message);
    }
}

async function putCurrentStory() {
    try {
        const storyData = readFileSync('current-story.json', 'utf-8');
        const tempFile = 'temp-story.txt';
        writeFileSync(tempFile, storyData);
        execSync(`wrangler kv:key put --binding=${namespace} current-story @${tempFile} ${localFlag}`);
        unlinkSync(tempFile);
        console.log('Successfully uploaded story data to KV');
    } catch (error) {
        console.error('Error putting story data:', error.message);
    }
}

async function main() {
    switch (command) {
        case 'load-example':
            await loadExampleToKV();
            break;
        case 'get':
            await getCurrentStory();
            break;
        case 'put':
            await putCurrentStory();
            break;
    }
}

main().catch(console.error);