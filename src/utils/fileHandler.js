const fs = require('fs-extra');
const path = require('path');

class FileHandler {
    static async readFile(filePath) {
        try {
            const absolutePath = path.resolve(filePath);
            return await fs.readFile(absolutePath, 'utf8');
        } catch (error) {
            throw new Error(`File read error: ${error.message}`);
        }
    }

    static async writeFile(filePath, content) {
        try {
            const absolutePath = path.resolve(filePath);
            const dir = path.dirname(absolutePath);
            
            // Создаем директорию, если она не существует
            await fs.ensureDir(dir);
            
            await fs.writeFile(absolutePath, content, 'utf8');
        } catch (error) {
            throw new Error(`File write error: ${error.message}`);
        }
    }

    static async fileExists(filePath) {
        try {
            return await fs.pathExists(path.resolve(filePath));
        } catch (error) {
            return false;
        }
    }
}

module.exports = FileHandler;