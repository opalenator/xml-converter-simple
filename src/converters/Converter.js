const fs = require('fs-extra');
const path = require('path');
const ggeBimToJSON = require('./ggeBimToJSON');
class Converter {
    /**
     * Конвертирует файлы используя xslt4node
     */
    static async convertFile(xmlPath, outputPath, options = {}) {
        try {
            console.log('📁 XML путь:', xmlPath);
            console.log('📁 Output путь:', outputPath);
            // Проверяем существование файлов
            if (!(await fs.pathExists(xmlPath))) {
                throw new Error(`XML файл не существует: ${xmlPath}`);
            }
            
            // Создаем выходную директорию
            await fs.ensureDir(path.dirname(outputPath));
            
            console.log('🔄 Начинаем преобразование...');
            // Чтение файлов
            const [xmlContent] = await Promise.all([
                fs.readFile(xmlPath , 'utf8'),
            ]);
            if (!xmlContent.includes("LocalEstimateBaseIndexMethod")) throw  "Not LS"
            var DOMParser = require('xmldom').DOMParser;
            var parser = new DOMParser();
            const xml = parser.parseFromString(xmlContent, "text/xml");
            await Promise.all([
                fs.writeFile(outputPath, JSON.stringify(ggeBimToJSON(xml,path.parse(xmlPath).name)), 'utf-8'),
            ]);
            console.log('✅ Преобразование завершено');
            
        } catch (error) {
            if (error=="Not LS") console.error('Формат файла не поддерживается!');
            else console.error('❌ Ошибка в convertFile:', error.message);
            throw new Error(`File conversion error: ${error}`);
        }
    }

}

module.exports = Converter;