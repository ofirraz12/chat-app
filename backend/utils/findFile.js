import path from 'path';
import fs from 'fs';

// Helper function: Recursively search for a file in a directory
export default function findFileRecursively(startDir, filename) {
    const files = fs.readdirSync(startDir, { withFileTypes: true });

    for (const file of files) {
        const fullPath = path.join(startDir, file.name);

        if (file.isDirectory()) {
            const found = findFileRecursively(fullPath, filename);
            if (found) return found;
        } else if (file.isFile() && file.name === filename) {
            return fullPath;
        }
    }

    return null;
}
