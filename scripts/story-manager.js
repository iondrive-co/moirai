import { readFileSync, writeFileSync, unlinkSync } from 'fs';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const command = process.argv[2];
const environment = process.argv[3] || 'local-preview';

if (!['load-example', 'get', 'put'].includes(command)) {
    console.error('Usage: node story-manager.js [load-example|get|put] [production|preview|local-production|local-preview]');
    process.exit(1);
}

function getFlags(env) {
    switch (env) {
        case 'production':
            return '--preview false';
        case 'preview':
            return '--preview';
        case 'local-production':
            return '--local';
        case 'local-preview':
            return '--preview --local';
        default:
            throw new Error(`Unknown environment: ${env}`);
    }
}

const flags = getFlags(environment);
const bindingFlags = `--binding=STORY_DATA ${flags}`.trim();

async function loadExampleToKV() {
    const sourceFile = join(__dirname, '..', 'example', 'example-story.json');
    console.log('Loading example story from:', sourceFile);
    const sourceData = JSON.parse(readFileSync(sourceFile, 'utf8'));
    const kvData = sourceData.map(item => ({
        ...item,
        value: JSON.stringify(item.value)
    }));

    const tempFile = join(__dirname, 'temp-kv.json');
    writeFileSync(tempFile, JSON.stringify(kvData, null, 2));

    try {
        const command = `wrangler kv:bulk put ${bindingFlags} ${tempFile}`;
        console.log('Executing:', command);
        execSync(command, { stdio: 'inherit' });
        console.log('Successfully loaded example story to KV');
    } catch (error) {
        console.error('Error loading KV data:', error);
    } finally {
        unlinkSync(tempFile);
    }
}

async function getCurrentStory() {
    try {
        const command = `wrangler kv:key get ${bindingFlags} current-story`;
        console.log('Executing:', command);
        const result = execSync(command);
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
        const command = `wrangler kv:key put ${bindingFlags} current-story @${tempFile}`;
        console.log('Executing:', command);
        execSync(command, { stdio: 'inherit' });
        unlinkSync(tempFile);
        console.log('Successfully uploaded story data to KV');
    } catch (error) {
        console.error('Error putting story data:', error.message);
    }
}

async function main() {
    console.log(`Running command '${command}' for environment '${environment}'`);
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