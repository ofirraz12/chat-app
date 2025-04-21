import fs from 'fs';
import path from 'path';

export const buildToolkit = (baseDir = './LLM/assessment') => {
    const toolkit = {
        tools: [],
        scripts: [],
        data: []
    };

    const folders = fs.readdirSync(baseDir, { withFileTypes: true })
        .filter((dirent) => dirent.isDirectory())
        .map((dirent) => dirent.name);

    for (const folder of folders) {
        const folderPath = path.join(baseDir, folder);
        const files = fs.readdirSync(folderPath);

        for (const file of files) {
            const fullPath = path.join(folderPath, file);

            // Handle toolkit summary in tools folder
            if (folder === 'tools' && file === 'toolkitSummary.json') {
                const toolList = JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
                toolkit.tools.push(...toolList);
                continue;
            }

            // Load script files (only .json)
            if (folder === 'scripts' && file.endsWith('.json')) {
                const data = JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
                toolkit.scripts.push({
                    name: data.name || file.replace('.json', ''),
                    contextType: data.contextType || 'unknown',
                    description: data.description || '',
                    useCases: data.useCases || []
                });
                continue;
            }

            // Load any .json files in the data folder as data descriptors
            if (folder === 'data' && file.endsWith('.json')) {
                const data = JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
                toolkit.data.push({
                    name: data.name || file.replace('.json', ''),
                    contextType: data.contextType || 'unknown',
                    description: data.description || '',
                    useCases: data.useCases || []
                });
            }
        }
    }

    return toolkit;
};
