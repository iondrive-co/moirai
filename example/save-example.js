import { writeFileSync } from 'fs';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

try {
    const kvData = execSync(
        'wrangler kv:key get --binding=STORY_DATA "current-story" --preview --local',
        { encoding: 'utf8' }
    );
    const formattedData = [{
        key: 'current-story',
        value: JSON.parse(kvData)
    }];
    const outputPath = join(__dirname, 'example-story.json');
    writeFileSync(outputPath, JSON.stringify(formattedData, null, 2));
    console.log('Successfully saved KV data to example/example-story.json');
} catch (error) {
    console.error('Error saving KV data:', error);
}