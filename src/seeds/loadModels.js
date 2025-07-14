import fs from 'fs';
import path from 'path';
import {
    fileURLToPath,
    pathToFileURL
} from 'url';

const __filename = fileURLToPath(
    import.meta.url);
const __dirname = path.dirname(__filename);

async function loadModels() {
    const models = [];
    const modelsDir = path.join(__dirname, '../models');
    const files = fs.readdirSync(modelsDir);

    for (const file of files) {
        if (file.endsWith('.js')) {
            const modelPath = path.join(modelsDir, file);
            const fileUrl = pathToFileURL(modelPath).href;

            const module = await import(fileUrl);

            const model = module.default || module;

            const modelName = path.basename(file, '.js');
            models.push({
                model,
                name: modelName
            });
        };
    };

    return models;
};

export default loadModels;