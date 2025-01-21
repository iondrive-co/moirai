import { readFileSync, writeFileSync, unlinkSync } from 'fs';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const command = process.argv[2];

if (!['get-prod', 'put-prod', 'load-example', 'backup', 'load'].includes(command)) {
    console.error('Usage: node story-manager.js [get-prod|put-prod|load-example|backup|load]');
    process.exit(1);
}

const TEMP_FILE = join(__dirname, 'temp-story.txt');

function cleanup() {
    try {
        if (readFileSync(TEMP_FILE)) {
            unlinkSync(TEMP_FILE);
        }
    } catch (e) {
        // File doesn't exist, ignore
    }
}

process.on('exit', cleanup);
process.on('SIGINT', () => {
    cleanup();
    process.exit();
});

async function loadExampleToKV() {
    const sourceFile = join(__dirname, '..', 'example', 'example-story.json');
    console.log('Loading example story from:', sourceFile);
    const sourceData = JSON.parse(readFileSync(sourceFile, 'utf8'));
    const kvData = sourceData.map(item => ({
        ...item,
        value: JSON.stringify(item.value)
    }));

    writeFileSync(TEMP_FILE, JSON.stringify(kvData, null, 2));

    try {
        const command = `wrangler kv:bulk put --binding=STORY_DATA --local ${TEMP_FILE}`;
        console.log('Executing:', command);
        execSync(command, { stdio: 'inherit' });
        console.log('Successfully loaded example story to local KV');
    } catch (error) {
        console.error('Error loading example data:', error);
    }
}

async function getProdData() {
    try {
        console.log('Getting production data...');
        const prodData = execSync('wrangler kv:key get --binding=STORY_DATA current-story').toString();
        writeFileSync(TEMP_FILE, prodData);
        console.log('Writing to local KV...');
        execSync(`wrangler kv:key put --binding=STORY_DATA --local current-story --path=${TEMP_FILE}`, {
            stdio: 'inherit'
        });
        console.log('Successfully copied production data to local KV');
    } catch (error) {
        console.error('Error syncing from production:', error.message);
    }
}

async function putProdData() {
    try {
        console.log('Getting local data...');
        const localData = execSync('wrangler kv:key get --binding=STORY_DATA --local current-story').toString();
        writeFileSync(TEMP_FILE, localData);
        console.log('Writing to production KV...');
        execSync(`wrangler kv:key put --binding=STORY_DATA current-story --path=${TEMP_FILE}`, {
            stdio: 'inherit'
        });
        console.log('Successfully copied local data to production KV');
    } catch (error) {
        console.error('Error syncing to production:', error.message);
    }
}

async function backupLocalData() {
    try {
        console.log('Getting local KV data...');
        const localData = execSync('wrangler kv:key get --binding=STORY_DATA --local current-story').toString();
        const parsedData = JSON.parse(localData);
        const backupData = [{
            key: 'current-story',
            value: parsedData
        }];
        // Save to current-story.json in project root
        const backupFile = join(__dirname, '..', 'current-story.json');
        writeFileSync(backupFile, JSON.stringify(backupData, null, 2));
        console.log('Successfully backed up local KV data to current-story.json');
    } catch (error) {
        console.error('Error backing up data:', error.message);
    }
}

async function loadCurrentStory() {
    try {
        console.log('Clearing local KV store...');
        execSync('wrangler kv:key delete --binding=STORY_DATA --local current-story', {
            stdio: 'inherit'
        });
    } catch (error) {
        console.log('No existing data to clear');
    }
    try {
        const sourceFile = join(__dirname, '..', 'current-story.json');
        console.log('Loading story from:', sourceFile);
        const sourceData = JSON.parse(readFileSync(sourceFile, 'utf8'));
        const kvData = sourceData.map(item => ({
            ...item,
            value: JSON.stringify(item.value)
        }));

        writeFileSync(TEMP_FILE, JSON.stringify(kvData, null, 2));

        console.log('Writing to local KV...');
        execSync(`wrangler kv:bulk put --binding=STORY_DATA --local ${TEMP_FILE}`, {
            stdio: 'inherit'
        });
        console.log('Successfully loaded story to local KV');
    } catch (error) {
        console.error('Error loading story data:', error);
    }
}

async function main() {
    try {
        switch (command) {
            case 'load-example':
                await loadExampleToKV();
                break;
            case 'get-prod':
                await getProdData();
                break;
            case 'put-prod':
                await putProdData();
                break;
            case 'backup':
                await backupLocalData();
                break;
            case 'load':
                await loadCurrentStory();
                break;
        }
    } finally {
        cleanup();
    }
}

main().catch(console.error);